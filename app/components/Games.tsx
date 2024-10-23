"use client"; //because we use UseState
import Link from "next/link";
import React from "react";
import Image from "next/legacy/image";
const senuaImagePath = "/assets/images/senua.jpg";

function Games() {
  return (
    <Link
      href={`/Games/page/1`}
      className="relative group text-6xl hover:scale-105 justify-center flex lg:w-2/4 w-full h-screen overflow-hidden transition duration-500 ease-in-out cursor-pointer"
    >
      {/* <Image
        src={senuaImagePath}
        alt="Senua image placeholder"
        layout="fill"
        objectFit="cover"
        className="absolute grayscale hover:grayscale-0 transition duration-1000"
        priority
      /> */}
      <img
        src={senuaImagePath}
        alt="Senua image placeholder"
        className="absolute object-cover grayscale hover:grayscale-0 transition duration-1000"
      />
      <h1 className="group-hover:opacity-100 transition duration-1000 flex absolute top-2/4 text-white z-10 lg:text-[4rem] text-[2rem] lg:opacity-0">
        Games
      </h1>
    </Link>
  );
}

export default Games;
