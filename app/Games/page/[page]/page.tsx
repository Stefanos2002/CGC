import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import Genres from "@/app/Components/Game-components/Genres";
import { pageSize } from "@/app/Constants/constants";
import {
  fetchAndCombineDataSimple,
  searchGamesByName,
  paginateGames,
  extractGenres,
  sortGamesByRelease,
  fetchGameDetailsBatch,
} from "@/app/Game Collection/functions";
import Sort from "@/app/Components/Game-components/Sort";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

interface PageProps {
  params: { page: number };
  searchParams: { search?: string };
}

const Posts = async ({ params, searchParams }: PageProps) => {
  try {
    const searchQuery = searchParams.search;

    let filteredGames;
    if (searchQuery) {
      filteredGames = await searchGamesByName(searchQuery);
    } else {
      filteredGames = await fetchAndCombineDataSimple();
    }

    const genres = extractGenres(filteredGames);
    sortGamesByRelease(filteredGames);
    const paginatedGames = paginateGames(filteredGames, params.page, pageSize);
    const detailedGames = await fetchGameDetailsBatch(paginatedGames);

    return (
      <div>
        <MainPage>
          <NavBar />
          <div className="flex w-full items-center gap-3 justify-center">
            <Sort />
            <Genres genres={genres} />
          </div>
          <GameList paginatedGames={detailedGames} />
          <Buttons
            link={`/Games/page`}
            page={Number(params.page)}
            gamesLength={filteredGames.length} // Use filtered length
            searchQuery={searchQuery} // PASS SEARCH TO BUTTONS
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
