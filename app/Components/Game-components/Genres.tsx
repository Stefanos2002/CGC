"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface GenresProps {
  genres: Genre[];
  consoleName?: string;
}

const Genres: React.FC<GenresProps> = ({ genres, consoleName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const index = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);
  const closeDropdown = () => setIsOpen(false);

  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      if (index.current && !index.current.contains(e.target as Node)) {
        setTimeout(() => setIsOpen(false), 50);
      }
    };
    document.addEventListener("mousedown", mouseHandler);
    return () => document.removeEventListener("mousedown", mouseHandler);
  }, []);

  const buildGenreUrl = (slug: string) => {
    const params = new URLSearchParams();
    if (consoleName) params.set("console", consoleName);
    params.set("genre", slug);
    return `/Games/page/1?${params.toString()}`;
  };

  const isConsole = Boolean(consoleName);

  return (
    <div
      className={`wrapper relative pointer-events-none items-center z-10 group mt-12 text-white flex flex-col`}
      ref={index}
    >
      <button
        className={`sort-btn pointer-events-auto rounded-2xl px-[4.4rem] py-3 text-md border-none ${
          isOpen ? "rounded-b-none" : "rounded-b-2xl"
        } `}
        onClick={toggleDropdown}
      >
        Genres
      </button>
      <div
        className={`pointer-events-auto top-[3rem] absolute rounded-b-2xl overflow-hidden overflow-y-auto divide-y text-md bg-neutral-100 flex flex-col text-center transition-all duration-300 ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        onClick={closeDropdown}
      >
        {genres.map((genre) => (
          <Link key={genre.id} href={buildGenreUrl(genre.slug)}>
            <ul
              className={`text-black text-md transition delay-50 p-2 rounded-full hover:scale-105 ${
                isConsole ? "w-[12rem]" : "w-[11.5rem]"
              }`}
              onClick={closeDropdown}
            >
              {genre.name}
            </ul>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Genres;
