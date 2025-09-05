import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { chats } from '@/lib/db/schema';

// The fix is in the type definition of the second argument for the DELETE function.
export const DELETE = async (
  _req: Request,
  { params }: { params: { id: string } }, // <-- FIX: Corrected the type definition
) => {
  try {
    const { id } = params; // Destructure id from params here
    
    const numericId = parseInt(id, 10);

    if (isNaN(numericId)) {
      return Response.json({ message: 'Invalid chat ID' }, { status: 400 });
    }

    const chatExists = await db.query.chats.findFirst({
      where: eq(chats.id, numericId),
    });

    if (!chatExists) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    await db.delete(chats).where(eq(chats.id, numericId)).execute();
    return Response.json({ message: 'Chat deleted' }, { status: 200 });
  } catch (err) {
    console.error('An error occurred while deleting chat:', err);
    return Response.json(
      { message: 'An error occurred while deleting chat' },
      { status: 500 },
    );
  }
};

