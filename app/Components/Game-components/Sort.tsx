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

const Sort = () => {
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
      className="pointer-events-none z-10 group mt-12 text-white relative flex flex-col items-center"
      ref={index}
    >
      <button
        className={`sort-btn pointer-events-auto rounded-2xl px-10 py-3 text-md border-none ${
          isOpen ? "rounded-b-none" : "rounded-b-2xl"
        }`}
        onClick={toggleDropdown}
      >
        Order By
      </button>
      <div
        className={`pointer-events-auto absolute top-[3rem] overflow-hidden w-[9rem] divide-y text-md rounded-b-2xl bg-neutral-100 text-black flex flex-col transition-all duration-300 ${
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{ visibility: isOpen ? "visible" : "hidden" }}
        onClick={closeDropdown}
      >
        <Link
          href={`/Games/page/rating-first/1`}
          className="hover:text-blue-600 py-3 px-6"
        >
          Rating
        </Link>
        <Link
          href={`/Games/page/name-first/1`}
          className="hover:text-blue-600 py-3 px-6"
        >
          Name
        </Link>
      </div>
    </div>
  );
};

export default Sort;
