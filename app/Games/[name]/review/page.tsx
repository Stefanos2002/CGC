import { getGameBySlug } from "@/app/Game Collection/functions";
import WriteReview from "@/app/Components/Game-components/WriteReview";
import NavBar from "@/app/Components/Game-components/NavBar";

export default async function Games({ params }: { params: any }) {
  const games = await getGameBySlug(params.name);
  return (
    <div className="relative w-full min-h-screen overflow-y-auto">
      <div className="bg-[url('/assets/images/back.jpg')] z-0 bg-cover fixed h-screen w-screen"></div>
      <NavBar />
      <WriteReview game={games} />
    </div>
  );
}
