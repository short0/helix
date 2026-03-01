export async function POST(req: Request) {
  try {
    const { habitName, messages } = await req.json();

    const reply = `I can help you with your "${habitName}" habit! Based on the 4 Laws of Atomic Habits, focus on making it obvious, attractive, easy, and satisfying. What specific aspect would you like help with?`;

    return Response.json({ reply });
  } catch (error) {
    return Response.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
