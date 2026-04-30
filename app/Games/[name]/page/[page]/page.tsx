// 1 = pc
// 2 = playstation
// 3 = xbox
// 7 = nintendo
// Import necessary dependencies
import {
  fetchAndCombineData,
  paginateGames,
  fetchGameDetails,
  extractGenres,
  sortGamesByRelease,
} from "@/app/Game Collection/functions";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import SearchBar from "@/app/Components/Game-components/SearchBar";
import { pageSize } from "@/app/Constants/constants";
import SortConsole from "@/app/Components/Game-components/SortConsole";
import GenresConsole from "@/app/Components/Game-components/GenresConsole";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

const Posts = async ({ params }: { params: any }) => {
  const gameData = await fetchAndCombineData(params.name);

  const genres = await extractGenres();

  sortGamesByRelease(gameData);
  const paginatedGames = paginateGames(gameData, params.page, pageSize);

  const detailedGames = await Promise.all(
    paginatedGames.map((item) => fetchGameDetails(item)),
  );

  return (
    <div>
      <MainPage>
        <NavBar />
        <SortConsole currentName={params.name} />
        <GenresConsole genres={genres} currentName={params.name} />
        <GameList paginatedGames={paginatedGames} />
        <Buttons
          link={`/Games/${params.name}/page`}
          page={Number(params.page)}
          gamesLength={gameData.length}
        />
        <Footer />
      </MainPage>
    </div>
  );
};
// Export the Posts component
export default Posts;
