"use client";
import React, { MouseEvent, useState } from "react";
import AccountPageShell from "./AccountPageShell";
import dynamic from "next/dynamic";

const PopupForLib = dynamic(() => import("../Game-components/PopupForLib"), { ssr: false });
import Image from "next/image";
import { useAccountUser } from "./useAccountUser";

type GameData = { reviewId?: number; libraryId?: number } | null;

const AccountGames = () => {
  const { user, setUser, isLoaded } = useAccountUser();
  const [popupLib, setPopupLib] = useState(false);
  const [popupRev, setPopupRev] = useState(false);
  const [data, setData] = useState<GameData>(null);

  const handleDeleteRev = async (
    event: MouseEvent<HTMLButtonElement>,
    reviewId: number,
  ) => {
    event.preventDefault();
    setPopupRev(true);
    setData({ reviewId });
  };

  const confirmDeleteRev = async () => {
    try {
      const response = await fetch(`/api/users/${user._id}/deleteFromRev`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user._id, reviewId: data?.reviewId }),
      });
      if (response.ok) {
        alert("Review removed from list");
        setUser((prev: any) => ({
          ...prev,
          user_reviews: prev.user_reviews?.filter(
            (g: any) => g.reviewId !== data?.reviewId,
          ),
        }));
        setPopupRev(false);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error("Failed to remove review:", error);
      alert("An error occurred while removing the review.");
    }
  };

  const handleDeleteLib = async (
    event: MouseEvent<HTMLButtonElement>,
    libraryId: number,
  ) => {
    event.preventDefault();
    setPopupLib(true);
    setData({ libraryId });
  };

  const confirmDeleteLib = async () => {
    try {
      const response = await fetch(`/api/users/${user._id}/deleteFromLib`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userid: user._id, libraryId: data?.libraryId }),
      });
      if (response.ok) {
        alert("Game was removed from library");
        setUser((prev: any) => ({
          ...prev,
          library: prev.library?.filter(
            (g: any) => g.libraryId !== data?.libraryId,
          ),
        }));
        setPopupLib(false);
      } else {
        const err = await response.json();
        alert(`Error: ${err.message}`);
      }
    } catch (error) {
      console.error("Failed to remove game:", error);
      alert("An error occurred while removing the game.");
    }
  };

  return (
    <AccountPageShell show={!!user} isLoaded={isLoaded} maxWidth="max-w-4xl">
      <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-cyan-400/30 ring-offset-2 ring-offset-[#13131f] mb-8">
        <Image
          src={user?.profilePicture || "/assets/images/default_avatar.jpg"}
          alt="User Avatar"
          className="object-cover"
          priority
          fill
        />
      </div>

      <div className="flex flex-col gap-10 w-full">
        {/* Reviews */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            My Reviews
          </h3>
          {user?.user_reviews?.length > 0 ? (
            <ul className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {user.user_reviews
                .slice()
                .sort(
                  (a: any, b: any) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((review: any) => (
                  <li
                    key={review.reviewId}
                    className="relative p-4 rounded-xl bg-[#1e1e2e] border border-white/10 text-start"
                  >
                    <button
                      onClick={(e) => handleDeleteRev(e, review.reviewId)}
                      className="absolute right-3 top-3 px-2 py-0.5 text-xs text-white rounded bg-red-700 hover:bg-red-800 transition-colors cursor-pointer"
                    >
                      ✕
                    </button>
                    {popupRev && (
                      <PopupForLib
                        onConfirm={confirmDeleteRev}
                        onCancel={() => setPopupRev(false)}
                      />
                    )}
                    <div className="pr-10">
                      <p className="font-black text-white text-md">
                        {review.gameName}
                      </p>
                      <p className="text-neutral-400 text-sm mt-1">
                        <span className="text-neutral-300">Reaction:</span>{" "}
                        {review.reaction}
                      </p>
                      <p className="text-neutral-400 text-sm mt-0.5 line-clamp-2">
                        <span className="text-neutral-300">Review:</span>{" "}
                        {review.text}
                      </p>
                      <p className="text-neutral-500 text-sm mt-1">
                        {review.date}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-neutral-500 text-sm">No reviews yet.</p>
          )}
        </div>

        {/* Library */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
            My Game Library
          </h3>
          {user?.library?.length > 0 ? (
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {user.library
                .slice()
                .sort(
                  (a: any, b: any) =>
                    new Date(b.date).getTime() - new Date(a.date).getTime(),
                )
                .map((list: any) => (
                  <li
                    key={list.libraryId}
                    className="relative rounded-xl overflow-hidden bg-[#1e1e2e] border border-white/10 group"
                  >
                    <button
                      onClick={(e) => handleDeleteLib(e, list.libraryId)}
                      className="absolute z-20 right-2 top-2 px-2 py-0.5 text-xs text-white rounded bg-red-700/90 hover:bg-red-800 transition-opacity opacity-0 group-hover:opacity-100 duration-200 cursor-pointer"
                    >
                      ✕
                    </button>
                    {popupLib && (
                      <PopupForLib
                        onConfirm={confirmDeleteLib}
                        onCancel={() => setPopupLib(false)}
                      />
                    )}
                    <div className="relative w-full h-36">
                      <Image
                        src={list.gamePic}
                        alt={list.gameName}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    </div>
                    <div className="p-2.5">
                      <p className="font-semibold text-white text-sm truncate">
                        {list.gameName}
                      </p>
                      <p className="text-neutral-500 text-sm mt-0.5">
                        {new Date(list.date).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-neutral-500 text-sm">No games saved.</p>
          )}
        </div>
      </div>
    </AccountPageShell>
  );
};

export default AccountGames;
