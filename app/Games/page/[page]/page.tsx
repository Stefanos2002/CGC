import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import SearchBar from "@/app/Components/Game-components/SearchBar";
import Genres from "@/app/Components/Game-components/Genres";
import { pageSize } from "@/app/Constants/constants";
import {
  fetchAndCombineDataSimple,
  paginateGames,
  extractGenres,
  sortGamesByRelease,
  fetchGameDetailsBatch,
} from "@/app/Game Collection/functions";
import Sort from "@/app/Components/Game-components/Sort";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

const Posts = async ({ params }: { params: any }) => {
  try {
    const gameData = await fetchAndCombineDataSimple();
    const genres = extractGenres(gameData);
    sortGamesByRelease(gameData);
    const paginatedGames = paginateGames(gameData, params.page, pageSize);
    const detailedGames = await fetchGameDetailsBatch(paginatedGames);

    return (
      <div>
        <MainPage>
          <NavBar />
          <Sort />
          <Genres genres={genres} />
          <GameList paginatedGames={detailedGames} />
          <Buttons
            link={`/Games/page`}
            page={Number(params.page)}
            gamesLength={gameData.length}
          />
          <Footer />
        </MainPage>
      </div>
    );
  } catch (error) {
    console.log("Error fetching render:", error);
    return <div>Error fetching game data</div>;
  }
};
// Export the Posts component
export default Posts;
