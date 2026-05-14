import React from "react";
import Link from "next/link";
import AddToList from "./AddToList";
import Screenshots from "./Screenshots";
import { getServerSession } from "next-auth";
import { findUserByEmail } from "@/app/User Collection/connection";
import { authOptions } from "@/authDbConnection/authOptions";
import { getGameInfoByName } from "@/app/Game Collection/functions";
import { BsController } from "react-icons/bs";
import Image from "next/image";

const GameDets = async ({ params }: { params: any }) => {
  const game = await getGameInfoByName(params.name);
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email; // You get this from session

  let dbUser;
  if (userEmail) {
    // Fetch the full user details from MongoDB
    dbUser = await findUserByEmail(userEmail);
  }
  return (
    <div className="flex w-full flex-col">
      <div className="flex pt-20 items-stretch flex-col lg:flex-row h-full gap-5 px-6">
        <div className="flex w-[50vw] h-full flex-col relative">
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={game.background_image}
              alt={game.name}
              className="object-cover rounded-t-lg"
              fill
            />
          </div>
          <div className="relative flex flex-col -top-10">
            <div className="fade-bottom"></div>
            <div className="flex flex-col gap-2 text-lg px-4 py-6 text-center font-inter text-white bg-black rounded-b-xl h-full">
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Name:
                </span>
                <span className="flex gap-1 text-end text-white lg:text-md min-[450px]:text-lg text-md">
                  {game.name}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-center justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Rating:
                </span>
                {game.rating > 0 ? (
                  <span
                    className="flex gap-2 items-center lg:text-md min-[450px]:text-lg text-md font-semibold"
                    style={{
                      color:
                        Math.round(game.rating * 20) >= 80
                          ? "#4ade80"
                          : Math.round(game.rating * 20) >= 50
                            ? "#c084fc"
                            : "#f87171",
                    }}
                  >
                    <BsController style={{ fontSize: "22px" }} />
                    {Math.round(game.rating * 20)}/100
                  </span>
                ) : (
                  <span>---</span>
                )}
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Release date:{" "}
                </span>
                {game.released ? (
                  <span className="flex gap-1 text-end text-white lg:text-md min-[450px]:text-lg text-md">
                    {game.released}
                  </span>
                ) : (
                  <span>TBA</span>
                )}
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Genres:
                </span>
                <span className="text-end lg:text-md min-[450px]:text-lg text-md">
                  {game.genres && game.genres.length > 0 ? (
                    game.genres.map(
                      (genre: { name: string }, index: number) => (
                        <span key={index}>
                          {index > 0 && ","}{" "}
                          {/* Add slash if not the first platform */}
                          {genre.name}
                        </span>
                      ),
                    )
                  ) : (
                    <span>---</span>
                  )}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Platforms:
                </span>
                <span className="text-end lg:text-md min-[450px]:text-lg text-md">
                  {game.platforms && game.platforms.length > 0 ? (
                    game.platforms.map(
                      (
                        platform: { platform: { name: string } },
                        index: number,
                      ) => (
                        <span key={index}>
                          {index > 0 && ","}{" "}
                          {/* Add slash if not the first platform */}
                          {platform.platform.name}
                        </span>
                      ),
                    )
                  ) : (
                    <span>---</span>
                  )}
                </span>
              </div>
              <div className="flex flex-row gap-4 items-stretch justify-between">
                <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                  Playtime:
                </span>
                {game.playtime && game.playtime > 0 ? (
                  <span className="lg:text-md min-[450px]:text-lg text-md">
                    about {game.playtime}h
                  </span>
                ) : (
                  <span>---</span>
                )}
              </div>
              {dbUser ? (
                <>
                  <div className="mt-4 gap-4 flex sm:flex-row sm:text-lg text-md flex-col w-full justify-between items-center">
                    <Link
                      href={`/Games/${game.slug}/review`}
                      className="bg-neutral-600 hover:bg-neutral-800 py-1 px-4 rounded-xl transition-all duration-200 hover:scale-105"
                    >
                      Write a review
                    </Link>
                    <AddToList gameName={game.slug} />
                  </div>
                </>
              ) : (
                <div className="mt-4 flex w-full justify-center items-center">
                  <span className="bg-neutral-600 text-lg py-2 px-6 rounded-xl">
                    Sign-in required to be able to write/read a review or add to
                    your Library
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {game.description_raw ? (
          <div className="mb-10 flex flex-col gap-3 border shadow-xl shadow-gray-600 relative w-[50vw] overflow-y-auto bg-neutral-900 p-6 rounded-2xl transition-[width] ease-in-out duration-300">
            <h2 className="text-white text-xl font-semibold border-b border-neutral-700 pb-2 tracking-wide">
              About
            </h2>
            <p className="leading-[1.8rem] text-neutral-300 text-md tracking">
              {game.description_raw}
            </p>
          </div>
        ) : (
          <span>No Description Yet For This Game</span>
        )}
      </div>
      <Screenshots params={params} />
    </div>
  );
};

export default GameDets;
