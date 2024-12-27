import Footer from "@/app/Components/Footer";
import GameDets from "@/app/Components/Game-components/GameDets";
import UserReviews from "@/app/Components/Game-components/UserReviews";
import NavBar from "@/app/Components/Game-components/NavBar";
import { fetchAndCombineDataSimple } from "@/app/Game Collection/functions";

export default async function Games({ params }: { params: any }) {
  const gameData = await fetchAndCombineDataSimple();
  return (
    <div>
      <NavBar />
      <div className="bg-[url('/assets/images/back.jpg')] z-0 bg-cover fixed h-screen w-screen"></div>
      <GameDets params={params} />
      <UserReviews params={params} />
      <Footer />
    </div>
  );
}
