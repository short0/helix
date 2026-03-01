export async function POST(req: Request) {
  try {
    const { habitName, habitType, sectionType } = await req.json();

    const suggestions = [
      `Create a trigger for ${habitName}`,
      `Track progress on ${habitName}`,
      `Find an accountability partner`,
      `Use habit stacking technique`,
      `Create a reward system`,
    ];

    return Response.json({ suggestions });
  } catch (error) {
    return Response.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
