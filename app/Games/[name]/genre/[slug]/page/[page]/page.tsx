import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import SearchBar from "@/app/Components/Game-components/SearchBar";
import GenresConsole from "@/app/Components/Game-components/GenresConsole";
import { pageSize } from "@/app/Constants/constants";
import {
  paginateGames,
  fetchGameDetails,
  extractGenres,
  fetchByGenreConsole,
  sortGamesByRelease,
} from "@/app/Game Collection/functions";
import SortGenresConsole from "@/app/Components/Game-components/SortGenresConsole";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

const Posts = async ({ params }: { params: any }) => {
  try {
    const gameData = await fetchByGenreConsole(params.name, params.slug);

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
          <SortGenresConsole
            currentName={params.name}
            currentGenre={params.slug}
          />
          <GenresConsole genres={genres} currentName={params.name} />
          <GameList paginatedGames={paginatedGames} />
          <Buttons
            link={`/Games/${params.name}/genre/${params.slug}/page`}
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
