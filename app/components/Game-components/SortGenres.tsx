"use client";
import React, { useState } from "react";
import Link from "next/link";

interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
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

interface SortProps {
  currentName: string;
}

const Sort: React.FC<SortProps> = ({ currentName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  const closeDropdown = () => {
    setIsOpen(false);
  };
  return (
    <div className="pointer-events-none group mt-20 text-white relative flex flex-col items-center justify-center">
      <button
        className={`group-hover:bg-blue-900 pointer-events-auto rounded-2xl bg-blue-950 px-10 py-3 text-lg border-none ${
          isOpen ? "rounded-b-sm" : "rounded-b-2xl"
        }`}
        onClick={toggleDropdown}
      >
        Order By
      </button>
      <div
        className={`pointer-events-auto divide-y text-lg rounded-b-2xl bg-neutral-100 text-black flex flex-col transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        onClick={closeDropdown}
      >
        <Link
          href={`/Games/genre/${currentName}/page/release-first/1`}
          className="hover:text-blue-600 py-3 px-6"
        >
          Release Date
        </Link>
        <Link
          href={`/Games/genre/${currentName}/page/rating-first/1`}
          className="hover:text-blue-600 py-3 px-6"
        >
          Rating
        </Link>
        <Link
          href={`/Games/genre/${currentName}/page/name-first/1`}
          className="hover:text-blue-600 py-3 px-6"
        >
          Name
        </Link>
      </div>
    </div>
  );
};

export default Sort;
