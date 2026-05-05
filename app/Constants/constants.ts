//MOST OF THE GAME INTERFACES ARE NOT USED AND ARE JUST DISPLAYING THE STRUCTURE
export const pageSize = 15;

//base TMDB URLs
export const imageURL = "https://image.tmdb.org/t/p/w500";
export const baseUrl = "https://api.themoviedb.org/3/";

//TMDB api fetch options
export const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.MOVIE_BEARER_TOKEN}`,
  },
  next: { revalidate: 1000 },
};

//TMDB api fetch options for client pages
export const clientOptions = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_MOVIE_BEARER_TOKEN}`,
  },
  next: { revalidate: 1000 },
};

//function used in Movies to get the color based on vote average
export const getVotecolor = (vote: number) => {
  if (vote >= 7) return "text-green-500";
  if (vote >= 6) return "text-yellow-500";
  return "text-red-500";
};

//user interfaces
export interface Review {
  reviewId: number;
  gameId: number;
  gameName: string;
  reaction?: string;
  text?: string;
  date: string; // ISO date string
}

export interface MovieReview {
  reviewId: number;
  movieId: number;
  movieName: string;
  text?: string;
  rating?: number;
  date: string;
}

export interface ShowReview {
  reviewId: number;
  showId: number;
  showName: string;
  text?: string;
  rating?: number;
  date: string;
}

export interface Library {
  libraryId: number;
  gameId: number;
  gameName: string;
  gamePic: string;
  date: string; // ISO date string
}
export interface User {
  username?: string;
  name?: string;
  email: string;
  password?: string;
  profilePicture?: string;
  user_reviews?: Review[];
  library?: Library[];
  verificationToken?: string;
  isVerified?: boolean;
  provider?: string;
  watchlist?: WatchlistItem[];
}
interface WatchlistItem {
  id: number;
  media_type: "movie" | "tv";
}

//game interfaces
export interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface EsrbRating {
  id: number;
  name: string;
  slug: string;
}

export interface Rating {
  id: number;
  title: string;
  count: number;
}

export interface PostResult {
  _id: string;
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  ratings_count: number;
  ratings?: Rating[];
  metacritic: number;
  description: string;
  description_raw: string;
  parent_platforms: Platform[];
  platforms?: Platform[];
  playtime?: number;
  genres: Genre[];
  esrb_rating?: EsrbRating;
}

//interfaces used on layout
export interface Author {
  name: string;
  url?: string; // Optional
}

export interface Metadata {
  title: string;
  description: string;
  keywords?: string;
  authors: Author[]; // Ensure authors is an array
  robots?: string;
}

//interfaces used throught the movie pages
export interface MovieProps {
  movieData?: Movie;
  movieResultData?: MovieResult[];
  upcoming?: boolean; //prop used to tell if the page has upcoming movies or not
}

export interface Movie {
  page: number;
  results: MovieResult[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetails {
  adult: boolean;
  backdrop_path: string;
  genres: Genre[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}
export interface MovieResult {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  media_type: string;
}

export interface TVShowProps {
  tvShowData: TVShows;
  upcoming?: boolean; // optional prop used to tell if the page has upcoming shows or not
}

export interface TVShows {
  page: number;
  results: TVResult[];
}

export interface TVDetails {
  adult: boolean;
  backdrop_path: string;
  genres: Genre[];
  id: number;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  air_date: string;
  name: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  seasons: Seasons[];
}

export interface TVResult {
  adult: boolean;
  backdrop_path: string;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string;
  first_air_date: string;
  name: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Seasons {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  vote_average: number;
}
