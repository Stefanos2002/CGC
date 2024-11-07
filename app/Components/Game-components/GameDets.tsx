import React from "react";
import Link from "next/link";
import AddToList from "./AddToList";
import Screenshots from "./Screenshots";
import { getServerSession } from "next-auth";
import { findUserByEmail } from "@/app/User Collection/connection";
import { authOptions } from "@/authDbConnection/authOptions";
import {
  convertToStars,
  roundNum,
  getGameDets,
} from "@/app/Game Collection/functions";

const GameDets = async ({ params }: { params: any }) => {
  const game = await getGameDets(params.name);
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email; // You get this from session

  let dbUser;
  if (userEmail) {
    // Fetch the full user details from MongoDB
    dbUser = await findUserByEmail(userEmail);
  }
  return (
    <div className="flex pt-20 items-center lg:items-stretch flex-col lg:flex-row h-full justify-evenly xl:gap-20 gap-10 pl-0">
      <div className="flex lg:w-[50vw] h-full w-[85vw] flex-col relative lg:pl-10 pl-0">
        <div className="relative xl:h-[35vh] lg:h-[25vh] h-auto  w-full">
          <img
            src={game.background_image}
            alt={game.name}
            className="object-cover"
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
            <div className="flex flex-row gap-4 items-stretch justify-between">
              <span className="lg:text-md min-[450px]:text-lg text-md font-bold">
                Rating:
              </span>
              {game.rating > 0 ? (
                <span className="flex gap-1 text-white lg:text-md min-[450px]:text-lg text-md">
                  {convertToStars(game.rating)}({roundNum(game.ratings_count)})
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
                  game.genres.map((genre: { name: string }, index: number) => (
                    <span key={index}>
                      {index > 0 && ","}{" "}
                      {/* Add slash if not the first platform */}
                      {genre.name}
                    </span>
                  ))
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
                      index: number
                    ) => (
                      <span key={index}>
                        {index > 0 && ","}{" "}
                        {/* Add slash if not the first platform */}
                        {platform.platform.name}
                      </span>
                    )
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
              {game.playtime > 0 ? (
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
                    href={`/Games/${game.slug}/review/${dbUser._id}`}
                    className="bg-neutral-600 hover:bg-neutral-800 py-1 px-4 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    Write a review
                  </Link>
                  <AddToList />
                </div>
              </>
            ) : (
              <div className="mt-4 flex w-full justify-center items-center">
                <span className="bg-neutral-600 text-lg py-2 px-6 rounded-xl">
                  You have to be signed in to be able to write a review or add
                  to your wishlist
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {game.description_raw ? (
        <span className="font-inter lg:mb-0 mb-10 lg:mt-0 -mt-10 leading-8 border shadow-xl shadow-gray-600 relative lg:w-1/2 w-4/5 lg:h-[78vh] h-96 overflow-y-auto lg:overflow-y-visible bg-stone-900/60 p-6 rounded-2xl md:text-balance xl:text-center text-white text-lg transition-[width] lg:overflow-hidden ease-in-out duration-300">
          {game.description_raw}
        </span>
      ) : (
        <span>No Description Yet For This Game</span>
      )}

      <Screenshots params={params} />
    </div>
  );
};

export default GameDets;
