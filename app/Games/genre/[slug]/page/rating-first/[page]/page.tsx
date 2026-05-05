import React from "react";
import Buttons from "@/app/Components/Game-components/Buttons";
import MainPage from "@/app/Components/Game-components/MainPage";
import NavBar from "@/app/Components/Game-components/NavBar";
import SearchBar from "@/app/Components/Game-components/SearchBar";
import { pageSize } from "@/app/Constants/constants";
import {
  paginateGames,
  fetchGameDetailsBatch,
  getCachedGenres,
  fetchByGenreRating,
} from "@/app/Game Collection/functions";
import SortGenres from "@/app/Components/Game-components/SortGenres";
import Genres from "@/app/Components/Game-components/Genres";
import GameList from "@/app/Components/Game-components/GameList";
import Footer from "@/app/Components/Footer";

const Posts = async ({ params }: { params: any }) => {
  try {
    const [gameData, genres] = await Promise.all([
      fetchByGenreRating(params.slug),
      getCachedGenres(),
    ]);
    const paginatedGames = paginateGames(gameData, params.page, pageSize);
    const detailedGames = await fetchGameDetailsBatch(paginatedGames);

    return (
      <div>
        <MainPage>
          <NavBar />
          <SortGenres currentName={params.slug} />
          <Genres genres={genres} />
          <GameList paginatedGames={detailedGames} />
          <Buttons
            link={`/Games/genre/${params.slug}/page/rating-first`}
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
