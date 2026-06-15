import Filter from "@/app/Components/Movie-components/Filter";
import { options, baseUrl, Movie } from "@/app/Constants/constants";
import Cards from "@/app/Components/Movie-components/Cards";
import MoviePages from "@/app/Components/Movie-components/Pages";

const GENRE_NAMES: Record<string, string> = {
  "28": "Action", "12": "Adventure", "16": "Animation", "35": "Comedy",
  "80": "Crime", "99": "Documentary", "18": "Drama", "10751": "Family",
  "14": "Fantasy", "36": "History", "27": "Horror", "10402": "Music",
  "9648": "Mystery", "10749": "Romance", "878": "Science Fiction",
  "10770": "TV Movie", "53": "Thriller", "10752": "War", "37": "Western",
};

const getMovieData = async (page: string, genre: string) => {
  const res = await fetch(
    `${baseUrl}discover/movie?include_adult=false&page=${page}&with_genres=${genre}&sort_by=primary_release_date.desc&vote_count.gte=10&with_original_language=en&${process.env.MOVIE_API_KEY}`,
    options
  );
  const data = await res.json();
  return data;
};

const FilteredByGenre = async ({
  params,
}: {
  params: { genre: string; page: string };
}) => {
  const movieData: Movie = await getMovieData(`${params.page}`, params.genre);

  const genreName = GENRE_NAMES[params.genre] ?? "Movies";

  return (
    <div className="overflow-hidden">
      <Filter />
      <h1 className="sr-only">{genreName} Movies</h1>
      <div className="grid grid-cols-2 mt-4 h-full not-search movies-grid gap-y-2 mx-auto w-[92%] md:grid-cols-3 lg:grid-cols-4 md:gap-8 lg:gap-8 lg:w-3/4 md:w-[80%] md:ml-32 lg:ml-64 ">
        {/* Kanw Link oloklhrh th kartela */}
        <Cards movieData={movieData} />
      </div>
      <div className="">
        <MoviePages page={Number(params.page)} link={`/Movies/Genres/${params.genre}`} />
      </div>
    </div>
  );
};

export default FilteredByGenre;
