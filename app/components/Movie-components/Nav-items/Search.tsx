"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/legacy/image";
import Link from "next/link";

const apiKey = "a48ad289c60fd0bb3fc9cc3663937d7b";
const baseUrl = "https://api.themoviedb.org/3/search/movie";

interface SearchProps {
  setSearchVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

const getMovies = async (query: string) => {
  const res = await fetch(`${baseUrl}?query=${query}&api_key=${apiKey}`);
  const data = await res.json();
  return data.results;
};

const Search: React.FC<SearchProps> = ({ setSearchVisible }) => {
  const [movies, setMovies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const searchRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchVisible(false);
      }
    };

    document.addEventListener("click", handler);
    return () => {
      document.removeEventListener("click", handler);
    };
  }, [searchRef, setSearchVisible]);

  useEffect(() => {
    if (searchTerm.trim()) {
      const fetchMovies = async () => {
        const results = await getMovies(searchTerm);
        setMovies(results);
      };

      fetchMovies();
    } else {
      setMovies([]);
    }
  }, [searchTerm]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted, searchTerm:", searchTerm);
    // The fetchMovies function is already handled by useEffect when searchTerm changes
  };

  return (
    <form
      ref={searchRef}
      className="w-[440px] flex flex-col gap-2 absolute top-20 left-1/2 transform z-10 -translate-x-1/2 transition duration-700 ease-in-out searchbar"
      onSubmit={handleSubmit}
    >
      <div className="relative">
        <input
          type="search"
          placeholder="Search..."
          className="w-full rounded-full text-[#d3d3d3] p-4 bg-slate-800 search"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {movies.length > 0 && (
        <div className="w-full flex flex-col bg-slate-800 p-4 rounded-xl text-[#d3d3d3] mt-4">
          {movies.slice(0, 6).map((movie) => (
            <Link
              key={movie.id}
              href={`/Movies/${movie.id}`}
              onClick={() => setSearchVisible(false)}
              className="p-2 border-b flex flex-row border-gray-700"
            >
              <div className="mr-4">
                {movie.poster_path && (
                  <Image
                    src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                    alt={movie.title}
                    width={64}
                    height={96}
                    objectFit="cover"
                  />
                )}
              </div>
              <div>
                <h2 className="text-lg">{movie.title}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}
    </form>
  );
};

export default Search;
