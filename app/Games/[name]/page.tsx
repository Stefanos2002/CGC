import type { Metadata } from "next";
import Footer from "@/app/Components/Footer";
import GameDets from "@/app/Components/Game-components/GameDets";
import UserReviews from "@/app/Components/Game-components/UserReviews";
import RelatedGames from "@/app/Components/Game-components/RelatedGames";
import NavBar from "@/app/Components/Game-components/NavBar";
import { getGameBySlug } from "@/app/Game Collection/functions";

export async function generateMetadata({
  params,
}: {
  params: { name: string };
}): Promise<Metadata> {
  const game = await getGameBySlug(params.name);
  const year = game.released?.slice(0, 4);
  const description =
    game.description_raw
      ?.replace(/^#{1,6}\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .slice(0, 155) ||
    `Read reviews and info for ${game.name} on CineGame Critic.`;

  return {
    title: `${game.name}${year ? ` (${year})` : ""}`,
    description,
    openGraph: {
      title: `${game.name}${year ? ` (${year})` : ""}`,
      description,
      images: game.background_image
        ? [{ url: game.background_image, alt: `${game.name} cover` }]
        : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.name}${year ? ` (${year})` : ""}`,
      description,
      images: game.background_image ? [game.background_image] : [],
    },
  };
}

export default async function Games({ params }: { params: { name: string } }) {
  const game = await getGameBySlug(params.name);
  const year = game.released?.slice(0, 4);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.description_raw
      ?.replace(/^#{1,6}\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .slice(0, 500),
    image: game.background_image,
    datePublished: game.released,
    genre: game.genres?.map((g: { name: string }) => g.name),
    gamePlatform: game.platforms?.map(
      (p: { platform: { name: string } }) => p.platform.name
    ),
    ...(game.ratings_count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Math.round(game.rating * 20),
        ratingCount: game.ratings_count,
        bestRating: 100,
        worstRating: 0,
      },
    }),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <NavBar />
      <div className="bg-[url('/assets/images/back.jpg')] z-0 bg-cover fixed h-screen w-screen"></div>
      <GameDets params={params} />
      <div className="bg-black/40 backdrop-blur-sm px-6 py-8">
        <UserReviews params={params} />
        <RelatedGames params={params} />
      </div>
      <div className="-mt-6">
        <Footer />
      </div>
    </div>
  );
}
