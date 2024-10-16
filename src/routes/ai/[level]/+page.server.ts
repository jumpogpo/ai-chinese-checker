// routes/ai/[id]/+page.server.js
export async function load({ params }) {
  const levelString: string = params.level;
  const levelMapping: { [key: string]: number } = {
    easy: 2,
    medium: 4,
    hard: 6
  };

  const level = levelMapping[levelString];

  if (level !== undefined) {
    return { level };
  } else {
    throw new Error(`Invalid level: ${params.level}`);
  }
}