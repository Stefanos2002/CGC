export const dynamic = 'force-dynamic';
import { addShowReview } from "@/app/User Collection/connection";
import { NextRequest, NextResponse } from "next/server";

//Function to add the rating to the TMDB API
async function postRatingToTmdb(
  showId: string,
  rating: number,
  guestSessionId: string
) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${showId}/rating?${process.env.MOVIE_API_KEY}&guest_session_id=${guestSessionId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          value: rating,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to post rating to TMDb: ${response.statusText}`);
    }
    const responseData = await response.json();

    return responseData;
  } catch (error) {
    console.error("Error posting rating to TMDb:", error);
    throw new Error("Failed to post rating to TMDb");
  }
}

// Adding a review in Movies and posting the rating to TMDb
export async function POST(req: NextRequest) {
  try {
    const { userId, showId, showName, review, rating } = await req.json(); //We take the userId, movieid, movieName, review, and rating from the form

    //we store the review in the database
    const result = await addShowReview(
      userId,
      showId,
      showName,
      review,
      rating,
      new Date()
    );
    if (!result?._id) {
      return NextResponse.json("User not found or review not added", {
        status: 400,
      });
    }

    //We get a guest session id from the TMDB API so that we can post the rating to TMDB
    const guestSessionResponse = await fetch(
      `https://api.themoviedb.org/3/authentication/guest_session/new?${process.env.MOVIE_API_KEY}`
    );
    const guestSessionData = await guestSessionResponse.json();
    const guestSessionId = guestSessionData.guest_session_id;

    if (!guestSessionId) {
      return NextResponse.json("Failed to create a guest session", {
        status: 500,
      });
    }

    //We post the rating to TMDB
    await postRatingToTmdb(showId, rating, guestSessionId);

    return NextResponse.json({
      message: "Review added and rating posted to TMDb successfully",
    });
  } catch (error) {
    console.error("Error adding review and posting rating:", error);
    return NextResponse.json("Internal Server Error", { status: 500 });
  }
}
