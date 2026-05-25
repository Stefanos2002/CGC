import {
  getGameBySlug,
  getUserReviews,
} from "@/app/Game Collection/functions";
import { findAllUsers } from "@/app/User Collection/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authDbConnection/authOptions";
import React from "react";

const UserReviews = async ({ params }: { params: any }) => {
  const game = await getGameBySlug(params.name);
  const session = await getServerSession(authOptions);
  let allUsers;
  // Fetch all users from MongoDB
  allUsers = await findAllUsers();

  const gameReviews = await getUserReviews(allUsers, game.id);

  return (
    <>
      {session ? (
        <div>
          {gameReviews && gameReviews.length > 0 ? (
            <div className="flex px-10 xl:px-64 lg:px-52 sm:px-24 px-6 pb-10 lg:py-12 pt-0 bg-slate-300 flex-col w-full">
              <span className="text-white z-10 text-2xl text-center font-extrabold">
                User Reviews:
              </span>
              <ul className="mt-6 bg-black border-2 rounded-2xl lg:p-12 p-10 lg:px-24 px-12 z-10">
                {gameReviews.map((review: any) => {
                  return (
                    <div key={review.reviewId}>
                      <span className="text-white text-lg text-orange-500">
                        {review.username}
                      </span>
                      <span className="text-slate-100 text-lg"> said: </span>
                      <li className="relative overflow-auto text-md px-4 mb-6 mt-2 py-3 rounded-xl bg-white">
                        {review.text} <br />
                        <strong>Date:</strong>{" "}
                        <span className="italic">{review.date}</span>
                      </li>
                    </div>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="my-4 mb-10 flex w-full justify-center items-center">
              <span className="bg-neutral-800 sm:text-lg text-md text-slate-200 z-20 py-3 px-6 rounded-lg">
                No reviews at this moment.
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="my-4 mb-10 flex w-full justify-center items-center">
          <span className="bg-neutral-600 hidden sm:text-lg text-md text-slate-200 z-20 py-3 px-6 rounded-lg">
            Sign-in required in order to preview the reviews
          </span>
        </div>
      )}
    </>
  );
};

export default UserReviews;
