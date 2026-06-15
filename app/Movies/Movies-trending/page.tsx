import Link from "next/link";
import { ImTv } from "react-icons/im";
import Filter from "@/app/Components/Movie-components/Filter";
import { options, baseUrl, Movie } from "@/app/Constants/constants";
import Cards from "@/app/Components/Movie-components/Cards";

const ApiURL = baseUrl+ "trending/movie/day?page=1&language=en-US&" + process.env.MOVIE_API_KEY ;


const getMovieData = async (url: string) => {
  const res = await fetch(url, options);
  const data = await res.json();
  return data;
};

const Trending = async () => {
  const movieData: Movie = await getMovieData(ApiURL);
  
  return (
    <div className="overflow-hidden">
      <Filter />
      <h1 className="sr-only">Trending Movies</h1>
      <div className="flex justify-end mr-10 mt-2">
        <Link
          href={"/Movies/TVShows/Trending"}
          className="flex flex-row gap-2 mt-2 items-center justify-end p-2 rounded hover:opacity-85 transition duration-200 bg-[#4c545b] cursor-pointer text-[#d1d1d1] not-search trending-button"
        >
          <ImTv style={{ flexShrink: 0, fontSize: "1.4rem" }} />
          <span>TV Shows</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 mt-4 h-full not-search movies-grid gap-y-2 mx-auto w-[92%] md:grid-cols-3 lg:grid-cols-4 md:gap-8 lg:gap-8 lg:w-3/4 md:w-[80%] md:ml-32 lg:ml-64 ">
       <Cards movieData={movieData}/>
      </div>
    </div>
  );
};

export default Trending;