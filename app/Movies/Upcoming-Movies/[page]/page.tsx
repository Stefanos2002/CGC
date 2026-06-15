import { ImTv } from "react-icons/im";
import Link from "next/link";
import Filter from "@/app/Components/Movie-components/Filter";
import { baseUrl, MovieResult, options } from "@/app/Constants/constants";
import Cards from "@/app/Components/Movie-components/Cards";
import MoviePages from "@/app/Components/Movie-components/Pages";


//Kanw fetch tis upcoming tainies, to fetch ginetai apo pollaples selides an den ginei 20 tainiwn apo mia selida
//px. An to fetch ths selidas 1 logw tou filter emfanisei 10 tainies anti gia 20, tote tha kanei fetch tainies kai apo thn selida 2
const getMovieData = async (initialPage: number, moviesNeeded: number): Promise<MovieResult[]> => {
  let movies: MovieResult[] = [];
  const currentDate = new Date().toISOString().split("T")[0]; //metavlhth gia to shmerino date

  // Kanw fetch mexri 20 tainies gia to kathe page
  while (movies.length < moviesNeeded) {
    const res = await fetch(
      `${baseUrl}movie/upcoming?include_adult=false&page=${initialPage}&${process.env.MOVIE_API_KEY}`,
      options
    );
    const data = await res.json();

    //Krataw mono tis tainies pou den exoun kykloforisei akoma, ara to release_date na einai megalytero tou currentDate
    const filteredMovies = data.results.filter(
      (item: any) => item.release_date > currentDate
    );

    movies = movies.concat(filteredMovies); //Tis vazw sto array me ta movies
    initialPage++;  //Increment thn twrinh selida
    if (data.results.length === 0) break; // An den yparxoun alles tainies kanw break
  }
  return movies;
};

const UpComing = async ({ params }: { params: { page: string } }) => {
  const page = parseInt(params.page);
  const moviesPerPage = 20;
  const allMovies = await getMovieData(page, moviesPerPage * page); // Fetch enough movies to cover the current page

  const startIndex = (page - 1) * moviesPerPage;
  const movieData = allMovies.slice(startIndex, startIndex + moviesPerPage);

  return (
    <div className="overflow-hidden">
      <Filter />
      <h1 className="sr-only">Upcoming Movies</h1>
      <div className="flex justify-end mr-10 mt-2">
        <Link
          href={"/Movies/TVShows/Upcoming-tvshows/1"}
          className="flex flex-row gap-2 items-center hover:opacity-85 transition duration-200 justify-end p-2 rounded mt-2 cursor-pointer text-[#d1d1d1] bg-[#4c545b] trending-button not-search"
        >
          <ImTv style={{ flexShrink: 0, fontSize: "1.4rem" }} />
          <span>TV Shows</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 mt-4 h-full not-search movies-grid gap-2 mx-auto w-[92%] md:grid-cols-3 lg:grid-cols-4 md:gap-4 lg:gap-8 lg:w-3/4 md:w-[80%] md:ml-32 lg:ml-64 ">
       <Cards movieResultData={movieData} upcoming/>
      </div>
      <div>
        <MoviePages page={Number(params.page)} link={`Movies/Upcoming-Movies`} />
      </div>
    </div>
  );
};
export default UpComing;
