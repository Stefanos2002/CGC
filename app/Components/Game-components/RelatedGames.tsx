// app/Components/Game-components/RelatedGames.tsx
import {
  getGameBySlug,
  getGamesByGenre,
} from "@/app/Game Collection/functions";
import GameList from "./GameList";

const GENRE_PRIORITY: Record<string, number> = {
  racing: 10,
  fighting: 10,
  sports: 10,
  strategy: 9,
  rpg: 9,
  platformer: 8,
  shooter: 8,
  "massively-multiplayer": 7,
  indie: 6,
  adventure: 5,
  family: 5,
  arcade: 4,
  action: 2,
  simulation: 1,
  puzzle: 1,
  casual: 1,
};

const RelatedGames = async ({ params }: { params: any }) => {
  const game = await getGameBySlug(params.name);
  if (!game.genres?.length) return null;

  const primaryGenre = game.genres
    .slice()
    .sort(
      (a, b) => (GENRE_PRIORITY[b.slug] ?? 0) - (GENRE_PRIORITY[a.slug] ?? 0),
    )[0];

  const related = await getGamesByGenre(primaryGenre.slug);
  const eligible = related
    .filter((g) => g.slug !== game.slug)
    .sort(
      (a, b) => new Date(b.released).getTime() - new Date(a.released).getTime(),
    );
  const pool = eligible.slice(0, 30);
  const offset = game.id % (pool.length || 1);
  const rotated = [...pool.slice(offset), ...pool.slice(0, offset)];
  const filtered = rotated.slice(0, 6);

  if (!filtered?.length) return null;

  return (
    <section>
      <h2 className="text-white text-2xl font-thin mb-4 px-6 xl:px-16">
        More like this
      </h2>
      <GameList paginatedGames={filtered} />
    </section>
  );
};

export default RelatedGames;
