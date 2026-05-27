import Footer from "@/app/Components/Footer";
import GameDets from "@/app/Components/Game-components/GameDets";
import UserReviews from "@/app/Components/Game-components/UserReviews";
import RelatedGames from "@/app/Components/Game-components/RelatedGames";
import NavBar from "@/app/Components/Game-components/NavBar";

export default async function Games({ params }: { params: any }) {
  return (
    <div>
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
