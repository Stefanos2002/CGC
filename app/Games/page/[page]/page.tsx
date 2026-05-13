import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import { pageSize } from "@/app/Constants/constants";
import {
  fetchAndCombineDataSimple,
  fetchAndCombineData,
  fetchByGenre,
  fetchByGenreConsole,
  searchGamesByName,
  paginateGames,
  extractGenres,
  sortGamesByRelease,
  fetchGameDetailsBatch,
  getCachedGenres,
} from "@/app/Game Collection/functions";
import Sort from "@/app/Components/Game-components/Sort";
import Genres from "@/app/Components/Game-components/Genres";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

interface PageProps {
  params: { page: string };
  searchParams: { console?: string; genre?: string; sort?: string; search?: string };
}

const Posts = async ({ params, searchParams }: PageProps) => {
  try {
    const consoleName = searchParams.console;
    const genre = searchParams.genre;
    const sort = searchParams.sort;
    const search = searchParams.search;
    const page = Number(params.page);

    let gameData;
    if (search) {
      gameData = await searchGamesByName(search);
    } else if (consoleName && genre) {
      gameData = await fetchByGenreConsole(consoleName, genre);
    } else if (consoleName) {
      gameData = await fetchAndCombineData(consoleName);
    } else if (genre) {
      gameData = await fetchByGenre(genre);
    } else {
      gameData = await fetchAndCombineDataSimple();
    }

    if (sort === "name-first") {
      gameData = gameData.slice().sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "rating-first") {
      gameData = gameData.slice().sort((a, b) => b.rating - a.rating);
    } else {
      sortGamesByRelease(gameData);
    }

    const genres = genre ? await getCachedGenres() : extractGenres(gameData);
    const paginatedGames = paginateGames(gameData, page, pageSize);
    const detailedGames = await fetchGameDetailsBatch(paginatedGames);

    return (
      <div>
        <MainPage>
          <NavBar />
          <div className="flex w-full items-center gap-3 justify-center">
            <Sort consoleName={consoleName} genre={genre} />
            <Genres genres={genres} consoleName={consoleName} />
          </div>
          <GameList paginatedGames={detailedGames} />
          <Buttons
            link="/Games/page"
            page={page}
            gamesLength={gameData.length}
            consoleName={consoleName}
            genre={genre}
            sort={sort}
            searchQuery={search}
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

export default Posts;
