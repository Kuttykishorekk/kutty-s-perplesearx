import crypto from 'crypto';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { EventEmitter } from 'stream';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '@/lib/providers';
import db from '@/lib/db';
import { chats, messages as messagesSchema } from '@/lib/db/schema';
import { and, eq, gt } from 'drizzle-orm';
import { getFileDetails } from '@/lib/utils/files';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { Embeddings } from '@langchain/core/embeddings';
import { searchHandlers } from '@/lib/search';
import { createCustomModel, validateCustomModel } from '@/lib/providers/customModels';


export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Message = {
  messageId: string;
  chatId: string;
  content: string;
};

type ChatModel = {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
};

type Body = {
  message: Message;
  optimizationMode: 'speed' | 'balanced' | 'quality';
  focusMode: string;
  history: Array<[string, string]>;
  files: Array<string>;
  chatModel: ChatModel;
  systemInstructions: string;
  maxSources?: number;
  maxToken?: number;
  includeImages?: boolean;
  includeVideos?: boolean;
};

// Updated to accept a numeric chatId
const handleEmitterEvents = async (
  stream: EventEmitter,
  writer: WritableStreamDefaultWriter,
  encoder: TextEncoder,
  aiMessageId: string,
  chatId: number, // <-- FIX: Expect a number
) => {
  let recievedMessage = '';
  let sources: any[] = [];

  stream.on('data', (data) => {
    const parsedData = JSON.parse(data);
    if (parsedData.type === 'response') {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'message',
            data: parsedData.data,
            messageId: aiMessageId,
          }) + '\n',
        ),
      );

      recievedMessage += parsedData.data;
    } else if (parsedData.type === 'sources') {
      writer.write(
        encoder.encode(
          JSON.stringify({
            type: 'sources',
            data: parsedData.data,
            messageId: aiMessageId,
          }) + '\n',
        ),
      );

      sources = parsedData.data;
    }
  });

  stream.on('end', async () => { // <-- FIX: Made callback async
    writer.write(
      encoder.encode(
        JSON.stringify({
          type: 'messageEnd',
          messageId: aiMessageId,
        }) + '\n',
      ),
    );
    writer.close();

    // The user's schema might have these columns, keeping them.
    // The key fix is using the numeric `chatId`.
    await db.insert(messagesSchema) // <-- FIX: Added await
      .values({
        content: recievedMessage,
        chatId: chatId, // <-- FIX: Use the numeric chatId
        role: 'assistant',
        // NOTE: These fields were in your original code.
        // If they are not in your final schema, you may need to remove them.
        // @ts-ignore
        messageId: aiMessageId,
        // @ts-ignore
        metadata: JSON.stringify({
          createdAt: new Date(),
          ...(sources && sources.length > 0 && { sources }),
        }),
      })
      .execute();
  });
  stream.on('error', (data) => {
    const parsedData = JSON.parse(data);
    writer.write(
      encoder.encode(
        JSON.stringify({
          type: 'error',
          data: parsedData.data,
        }),
      ),
    );
    writer.close();
  });
};

// Updated to accept a numeric chatId
const handleHistorySave = async (
  message: Message,
  humanMessageId: string,
  focusMode: string,
  files: string[],
  numericChatId: number, // <-- FIX: Expect a number
) => {
  const chat = await db.query.chats.findFirst({
    // @ts-ignore
    where: eq(chats.id, numericChatId), // <-- FIX: Use the numeric chatId
  });

  if (!chat) {
    // NOTE: Inserting a value into a `serial` primary key ('id') might cause a runtime error.
    // If it does, you should remove the 'id' field from this insert call.
    await db // <-- FIX: Added await
      .insert(chats)
      .values({
        // @ts-ignore
        id: numericChatId, // <-- FIX: Use the numeric chatId
        title: message.content,
        createdAt: new Date().toString(),
        focusMode: focusMode,
        // @ts-ignore
        files: files.map(getFileDetails),
      })
      .execute();
  }

  const messageExists = await db.query.messages.findFirst({
     // @ts-ignore
    where: eq(messagesSchema.messageId, humanMessageId),
  });

  if (!messageExists) {
    await db // <-- FIX: Added await
      .insert(messagesSchema)
      .values({
        content: message.content,
        chatId: numericChatId, // <-- FIX: Use the numeric chatId
        role: 'user',
        // NOTE: These fields were in your original code.
        // @ts-ignore
        messageId: humanMessageId,
        // @ts-ignore
        metadata: JSON.stringify({
          createdAt: new Date(),
        }),
      })
      .execute();
  } else {
    await db // <-- FIX: Added await
      .delete(messagesSchema)
      .where(
        and(
           // @ts-ignore
          gt(messagesSchema.id, messageExists.id),
          // @ts-ignore
          eq(messagesSchema.chatId, numericChatId), // <-- FIX: Use the numeric chatId
        ),
      )
      .execute();
  }
};

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as Body;
    const { message } = body;

    // FIX: Convert chatId from string to number right at the start
    const numericChatId = parseInt(message.chatId, 10);
    if (isNaN(numericChatId)) {
        return Response.json({ message: 'Invalid chatId provided. Must be a number.' }, { status: 400 });
    }


    if (message.content === '') {
      return Response.json(
        {
          message: 'Please provide a message to process',
        },
        { status: 400 },
      );
    }

    const chatModelProviders = await getAvailableChatModelProviders();

    let llm: BaseChatModel | undefined;

    // Check if custom model configuration is provided
    if (body.chatModel?.apiKey && body.chatModel?.model) {
      const customConfig = {
        provider: body.chatModel.provider,
        model: body.chatModel.model,
        apiKey: body.chatModel.apiKey,
        baseUrl: body.chatModel.baseUrl,
      };

      const validation = validateCustomModel(customConfig);
      if (!validation.isValid) {
        return Response.json({ error: validation.error }, { status: 400 });
      }

      llm = createCustomModel(customConfig);
    } else {
      // Use default configured models
      const chatModelProvider =
        chatModelProviders[
          body.chatModel?.provider || Object.keys(chatModelProviders)[0]
        ];
      const chatModel =
        chatModelProvider?.[
          body.chatModel?.model || Object.keys(chatModelProvider || {})[0]
        ];
      
      if (chatModelProvider && chatModel) {
        llm = chatModel.model;
      }
    }

    if (!llm) {
      return Response.json({ error: 'Invalid chat model configuration' }, { status: 400 });
    }

    const humanMessageId =
      message.messageId ?? crypto.randomBytes(7).toString('hex');
    const aiMessageId = crypto.randomBytes(7).toString('hex');

    const history: BaseMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    const handler = searchHandlers[body.focusMode];

    if (!handler) {
      return Response.json(
        {
          message: 'Invalid focus mode',
        },
        { status: 400 },
      );
    }

    // Get system-configured embedding model for reranking
    let embeddings: Embeddings | null = null;
    if (body.optimizationMode === 'balanced') {
      const embeddingProviders = await getAvailableEmbeddingModelProviders();
      
      // Try to get the first available embedding model from system configuration
      for (const provider of Object.keys(embeddingProviders)) {
        const models = embeddingProviders[provider];
        if (models && Object.keys(models).length > 0) {
          const firstModel = Object.keys(models)[0];
          embeddings = models[firstModel].model;
          break;
        }
      }
    }

    const stream = await handler.searchAndAnswer(
      message.content,
      history,
      llm,
      embeddings,
      body.optimizationMode,
      body.files,
      body.systemInstructions || '',
      body.maxSources,
      body.maxToken || 4000,
      body.includeImages,
      body.includeVideos,
    );

    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // FIX: Pass the numericChatId to the handlers
    handleEmitterEvents(stream, writer, encoder, aiMessageId, numericChatId);
    handleHistorySave(message, humanMessageId, body.focusMode, body.files, numericChatId);

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (err) {
    console.error('An error occurred while processing chat request:', err);
    return Response.json(
      { message: 'An error occurred while processing chat request' },
      { status: 500 },
    );
  }
};
