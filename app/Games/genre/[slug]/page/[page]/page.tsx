import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import SearchBar from "@/app/Components/Game-components/SearchBar";
import Genres from "@/app/Components/Game-components/Genres";
import { pageSize } from "@/app/Constants/constants";
import {
  fetchByGenre,
  paginateGames,
  extractGenres,
  sortGamesByRelease,
  fetchGameDetails,
} from "@/app/Game Collection/functions";
import SortGenres from "@/app/Components/Game-components/SortGenres";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

const Posts = async ({ params }: { params: any }) => {
  try {
    const gameData = await fetchByGenre(params.slug);

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
          <SortGenres currentName={params.slug} />
          <Genres genres={genres} />
          <GameList paginatedGames={paginatedGames} />
          <Buttons
            link={`/Games/genre/${params.slug}/page`}
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
