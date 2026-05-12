"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

interface Genre {
  id: number;
  name: string;
  slug: string;
}

interface PostResult {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  description: string;
  description_raw: string;
  parent_platforms: Platform[];
}

interface GenresProps {
  genres: Genre[];
}

const Genres: React.FC<GenresProps> = ({ genres }) => {
  const [isOpen, setIsOpen] = useState(false);
  const index = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const closeDropdown = () => {
    setIsOpen(false);
  };

  //check if clicked outside of input container
  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      if (index.current && !index.current.contains(e.target as Node)) {
        setTimeout(() => {
          setIsOpen(false);
        }, 50);
      }
    };
    document.addEventListener("mousedown", mouseHandler);
    return () => {
      document.removeEventListener("mousedown", mouseHandler);
    };
  }, []);

  return (
    <div
      className="wrapper relative pointer-events-none mt-12 items-center z-10 group text-white flex flex-col "
      ref={index}
    >
      <button
        className={`sort-btn pointer-events-auto rounded-2xl px-[4.4rem] py-3 text-md border-none ${
          isOpen ? "rounded-b-none" : "rounded-b-2xl"
        }`}
        onClick={toggleDropdown}
      >
        Genres
      </button>
      <div
        className={`pointer-events-auto top-[3rem] absolute rounded-b-2xl overflow-hidden overflow-y-auto divide-y text-md bg-neutral-100 flex flex-col text-center transition-all duration-300 ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 "
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        onClick={closeDropdown}
      >
        {genres.map((genre) => (
          <Link key={genre.id} href={`/Games/genre/${genre.slug}/page/1`}>
            <ul
              className="text-black w-[11.5rem] text-md transition delay-50 p-2 rounded-full hover:scale-105"
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
