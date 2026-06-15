import type { Metadata } from "next";
import AddToWatchlist from "@/app/Components/Movie-components/AddToWatchlist";
import Filter from "@/app/Components/Movie-components/Filter";
// import Pages from "@/app/components/Movie-components/Pages";
import { baseUrl, getVotecolor, imageURL, options } from "@/app/Constants/constants";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

interface Result {
  id: number;
  title?: string; // Movies have 'title'
  name?: string; // TV shows have 'name'
  vote_average: number;
  media_type: "movie" | "tv";
  overview: string;
  poster_path?: string;
  popularity: number;
}

const getMovieData = async (query: string): Promise<Result[]> => {
  const res = await fetch(
    `${baseUrl}search/movie?query=${query}&include_adult=false&language=en-US&page=1&${process.env.MOVIE_API_KEY}`,
    options
  );
  const data = await res.json();
  return data.results.map((result: any) => ({
    ...result,
    media_type: "movie",
  }));
};

const getTVShowData = async (query: string): Promise<Result[]> => {
  const res = await fetch(
    `${baseUrl}search/tv?query=${query}&include_adult=false&language=en-US&page=1&${process.env.MOVIE_API_KEY}`,
    options
  );
  
  const data = await res.json();
  return data.results.map((result: any) => ({
    ...result,
    media_type: "tv",
  }));
};

const searchPage = async ({ params }: any) => {
  const movieResults = await getMovieData(`${params.query}`);
  const tvResults = await getTVShowData(`${params.query}`);
  const allResults = [...movieResults, ...tvResults]; //Array me ta apotelesmata kai twn tainiwn kai twn seirwn

  //We sort the results so that the ones with high popularity and a vote average > 0 will appear first 
  allResults.sort((a, b) => {
    if (b.vote_average === a.vote_average) return b.popularity - a.popularity;
    else if (b.vote_average !== a.vote_average)
      return b.vote_average - a.vote_average;
    else return 0;
  });

  return (
    <div className="overflow-hidden">
      <Filter />
      <div className="grid grid-cols-2 mt-4 h-full not-search movies-grid gap-y-2 mx-auto w-[92%] md:grid-cols-3 lg:grid-cols-4 md:gap-8 lg:gap-8 lg:w-3/4 md:w-[80%] md:ml-32 lg:ml-64 ">
        {allResults.map((item) => (
          <div
            key={item.id}
            className="hover:scale-110 hover:border hover:z-9 hover:shadow-2xl card-link hover:shadow-gray-600 transition w-[90%] md:w-full lg:w-full h-1/2 md:h-full lg:h-full mb-52 md:mb-0 lg:mb-0 duration-500 ease-in-out"
          >
            {/* Image container */}
            <Link
              href={`/${
                item.media_type === "tv" ? "Movies/TVShows" : "Movies"
              }/${item.id}`}
            >
              <div className="w-full h-full md:w-full md:h-64 lg:w-full lg:h-96 relative">
                <img
                  src={`${imageURL}${item.poster_path}`}
                  alt={item.media_type === "tv" ? item.name : item.title}
                  className="w-full h-full absolute object-cover"
                />
              </div>
            </Link>

            {/* Text container */}
            <div className="bg-[#4c545b] flex flex-col md:h-44 lg:h-52 cards h-full card-text-container">
              <Link
                href={`/${
                  item.media_type === "tv" ? "Movies/TVShows" : "Movies"
                }/${item.id}`}
                className="flex lg:ml-4 h-10 text-white justify-between"
              >
                <div className="w-[55%]">
                  <h2>{item.media_type === "tv" ? item.name : item.title}</h2>
                </div>
                <div className="flex gap-2">
                  {item?.vote_average ? (
                    <>
                      <span className={`${getVotecolor(item.vote_average)}`}>
                        {item.vote_average.toString().slice(0, 3)}
                      </span>
                      <FaStar color="gold" style={{ marginTop: "3px" }} />
                    </>
                  ) : (
                    <div></div>
                  )}
                </div>
              </Link>
              {/* watchlist and review container */}
              <div className="movies-buttons-container h-full flex flex-col justify-center gap-4">
                <div className="flex justify-center mt-4 ml-[-2rem]">
                  <AddToWatchlist id={item.id} media_type={item.media_type} />
                </div>
                <span className="text-white justify-center text-center">
                  <Link href={ item.media_type === "movie" ? `/Movies/${item.id}/reviews` : `/Movies/TVShows/${item.id}/reviews`}>Review</Link>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default searchPage;
