import { getGameBySlug, getUserReviews } from "@/app/Game Collection/functions";
import { findAllUsers } from "@/app/User Collection/connection";
import { getServerSession } from "next-auth";
import { authOptions } from "@/authDbConnection/authOptions";
import React from "react";

const UserReviews = async ({ params }: { params: any }) => {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const game = await getGameBySlug(params.name);
  const allUsers = await findAllUsers();
  const gameReviews = await getUserReviews(allUsers, game.id);

  return (
    <section>
      <h2 className="text-white text-2xl font-thin mb-6 px-6 xl:px-16">
        User Reviews
      </h2>

      {gameReviews && gameReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-6 xl:px-16">
          {gameReviews.map((review: any) => (
            <div
              key={review.reviewId}
              className="flex flex-col gap-3 bg-neutral-900/80 border border-neutral-700/60 rounded-2xl p-5 hover:border-neutral-600 transition-colors duration-200"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-orange-400 font-semibold truncate">
                  {review.username}
                </span>
                <span className="text-neutral-500 text-sm italic shrink-0">
                  {review.date}
                </span>
              </div>
              <div className="w-full h-px bg-neutral-700/50" />
              <p className="text-neutral-300 text-sm leading-relaxed">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center py-10 px-6 xl:px-16">
          <span className="bg-neutral-900/60 border border-neutral-700/60 text-neutral-400 text-md py-4 px-8 rounded-xl">
            No reviews yet — be the first to share your thoughts!
          </span>
        </div>
      )}
    </section>
  );
};

export default UserReviews;
