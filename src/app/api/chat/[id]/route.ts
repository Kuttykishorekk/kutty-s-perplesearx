import { eq } from 'drizzle-orm';
import db from '@/lib/db';
import { chats } from '@/lib/db/schema';

export const DELETE = async (
  _req: Request,
  { params: { id } }: { params: { id: string } },
) => {
  try {
    // FIX: Convert the route parameter 'id' from a string to a number
    const numericId = parseInt(id, 10);

    // Add a check to ensure the ID is a valid number
    if (isNaN(numericId)) {
      return Response.json({ message: 'Invalid chat ID' }, { status: 400 });
    }

    const chatExists = await db.query.chats.findFirst({
      // FIX: Use the numeric ID in the database query
      where: eq(chats.id, numericId),
    });

    if (!chatExists) {
      return Response.json({ message: 'Chat not found' }, { status: 404 });
    }

    // FIX: Use the numeric ID for the delete operation
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
