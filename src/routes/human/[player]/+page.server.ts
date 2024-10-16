// routes/human/[id]/+page.server.js
export async function load({ params }) {
  const player: string = params.player;

  return {
    player
  };
}
