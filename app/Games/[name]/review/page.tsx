import { getGameInfoByName } from "@/app/Game Collection/functions";
import WriteReview from "@/app/Components/Game-components/WriteReview";
import NavBar from "@/app/Components/Game-components/NavBar";

export default async function Games({ params }: { params: any }) {
  const games = await getGameInfoByName(params.name);
  return (
    <div className="w-full h-screen items-center bg-stone-700 overflow-hidden overflow-y-auto bg-cover ">
      <NavBar />
      <WriteReview game={games} />
    </div>
  );
}
