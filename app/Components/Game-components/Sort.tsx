"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface SortProps {
  consoleName?: string;
  genre?: string;
}

const Sort: React.FC<SortProps> = ({ consoleName, genre }) => {
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

  const buildSortUrl = (sortValue: string) => {
    const params = new URLSearchParams();
    if (consoleName) params.set("console", consoleName);
    if (genre) params.set("genre", genre);
    params.set("sort", sortValue);
    return `/Games/page/1?${params.toString()}`;
  };

  const isConsole = Boolean(consoleName);

  return (
    <div
      className={`pointer-events-none z-10 group mt-12 text-white relative flex flex-col items-center ${isConsole ? "justify-center" : ""}`}
      ref={index}
    >
      <button
        className={`sort-btn pointer-events-auto rounded-2xl px-5 sm:px-10 py-3 text-md border-none ${
          isOpen ? "rounded-b-none" : "rounded-b-2xl"
        } `}
        onClick={toggleDropdown}
      >
        Order By
      </button>
      <div
        className={`pointer-events-auto w-[6.5rem] sm:w-[9rem] absolute top-[3rem] overflow-hidden divide-y text-md rounded-b-2xl bg-neutral-100 text-black flex flex-col transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        onClick={closeDropdown}
      >
        <Link
          href={buildSortUrl("rating-first")}
          className="hover:text-blue-600 py-3 px-6"
        >
          Rating
        </Link>
        <Link
          href={buildSortUrl("name-first")}
          className="hover:text-blue-600 py-3 px-6"
        >
          Name
        </Link>
      </div>
    </div>
  );
};

export default Sort;
