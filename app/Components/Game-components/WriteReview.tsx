"use client";
import React, { useEffect, useState } from "react";
import Footer from "../Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PostResult } from "@/app/Constants/constants";

const reactions = [
  { id: 5, reaction: "😃" },
  { id: 4, reaction: "🙂" },
  { id: 3, reaction: "🤔" },
  { id: 1, reaction: "😔" },
];

const getReaction = (id: number) => {
  const reaction = reactions.find((reaction) => reaction.id === id);
  return reaction ? reaction.reaction : "❓";
};

interface Info {
  game: PostResult;
}

const WriteReview: React.FC<Info> = ({ game }) => {
  const { data: session } = useSession();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [reviewText, setReviewText] = useState<string>("");
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const router = useRouter();

  const handleReactionClick = (title: string) => {
    setSelectedReaction(title);
  };

  useEffect(() => {
    const fetchUser = async () => {
      if (session?.user?.email) {
        const response = await fetch(
          `/api/getUserDetails/${session.user.email}`,
        );
        const data = await response.json();
        if (data._id) {
          setUser(data);
        } else {
          console.error("Error fetching user details:", response.statusText);
        }
      }
    };
    fetchUser();
  }, [session?.user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const reviewData = {
      gameId: game?.id,
      gameName: game?.name,
      selectedReaction,
      reviewText,
      date: new Date(),
    };

    try {
      const response = await fetch(`/api/review/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setTimeout(() => {
          router.push(`/Games/${game.slug}`);
          router.refresh();
        }, 2000);
      } else {
        console.error("Error submitting review:", data.error);
        alert(data.message || "Failed to add review");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sortedRatings = (game.ratings ?? []).sort((a, b) => b.id - a.id);

  if (isSubmitted) {
    return (
      <div className="relative z-10 w-full min-h-screen flex items-center justify-center px-4">
        <div className="text-slate-200 text-lg text-center bg-black/70 backdrop-blur-md p-10 rounded-2xl border border-neutral-700 shadow-xl shadow-black/50">
          Your review has been submitted successfully!
          <br />
          Going back to the game…
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <div className="flex flex-col items-center pt-8 pb-12 px-4 flex-1">
        <div className="w-full max-w-2xl mb-4">
          <Link
            href={`/Games/${game.slug}`}
            className="text-neutral-400 hover:text-white text-md transition-colors duration-200"
          >
            ← Back to {game.name}
          </Link>
        </div>
        <form
          className="flex flex-col w-full max-w-2xl bg-black/70 backdrop-blur-md rounded-2xl border border-neutral-700 shadow-xl shadow-black/50"
          onSubmit={handleSubmit}
        >
          <div className="p-6 border-b border-neutral-700">
            <span className="text-orange-400 font-extrabold text-xs uppercase tracking-widest block mb-2">
              Write a review
            </span>
            <span className="text-white text-2xl font-semibold">
              {game.name}
            </span>
          </div>
          <div className="p-5 flex flex-wrap gap-3 border-b border-neutral-700">
            {sortedRatings.map((rating: any) => (
              <div
                role="button"
                onClick={() => handleReactionClick(rating.title)}
                key={rating.id}
                className={`flex transition-all duration-200 cursor-pointer ${
                  selectedReaction === rating.title
                    ? "bg-neutral-600 border-neutral-500"
                    : "bg-neutral-900 border-neutral-700"
                } hover:bg-neutral-600 items-center gap-2 border rounded-full pr-5 pl-3 py-2`}
              >
                <span className="text-xl">{getReaction(rating.id)}</span>
                <span className="text-white text-sm">{rating.title}</span>
              </div>
            ))}
          </div>
          <textarea
            className="text-base pt-6 pb-6 px-6 min-h-[220px] outline-none bg-neutral-900/80 text-neutral-100 placeholder:text-neutral-500 resize-none rounded-none"
            placeholder="Share your thoughts…"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <button
            className="text-base transition-all rounded-b-2xl duration-200 bg-neutral-700 hover:bg-neutral-600 text-white p-3 font-medium"
            type="submit"
          >
            Submit Review
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default WriteReview;
