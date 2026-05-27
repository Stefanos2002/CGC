import { Collection, Db, MongoClient, ObjectId } from "mongodb";
import clientPromise from "../../authDbConnection/mongo/page";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { User, Library, MovieReview, Review, ShowReview } from "../Constants/constants";

let client: MongoClient | undefined;
let db: Db | undefined;
let users: Collection<User> | undefined;

async function init(): Promise<void> {
  try {
    client = await clientPromise;
    db = client.db();
    users = db.collection("users");
  } catch (error) {
    console.error("Error during initialization:", error);
    throw new Error("Failed to establish connection to database");
  }
}

export const addUser = async (data: User) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Generate a verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Destructure username and email from the data
    const { username, email, password } = data;

    // Check if the username or email already exists
    const { usernameExists, emailExists } = await checkUserExists(
      username || "",
      email
    );

    if (usernameExists && emailExists) {
      throw new Error("Username and Email already exist");
    } else if (usernameExists) {
      throw new Error("Username already exists");
    } else if (emailExists) {
      throw new Error("Email already exists");
    }

    // Insert the new user data into the MongoDB collection
    const result = await users.insertOne({
      username,
      email,
      password,
      profilePicture: "",
      user_reviews: [],
      verificationToken,
      isVerified: false,
      provider: "credentials",
    });

    await sendVerificationEmail(email, verificationToken);

    return {
      message:
        "User added successfully. Please check your email for verification.",
      result,
    };
  } catch (error) {
    console.error("Failed to add user:", error);
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    }
    // Re-throw the error in case it's not an instance of Error
    throw error;
  }
};

export const addUserOath = async (data: User) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    const { name, email } = data;

    const emailExists = await users.findOne({ email });
    if (emailExists) {
      throw new Error("Email already exists");
    }

    // Insert the new user data into the MongoDB collection
    const result = await users.insertOne({
      email,
      name,
      profilePicture: data.profilePicture || "",
      user_reviews: [],
      isVerified: true,
      provider: data.provider || "",
    });

    return {
      message: "User added successfully.",
      result,
    };
  } catch (error) {
    console.error("Failed to add user:", error);
    if (error instanceof Error) {
      throw new Error(`${error.message}`);
    }
    // Re-throw the error in case it's not an instance of Error
    throw error;
  }
};

//FUNCTION SENDING VERIFICATION TO EMAIL
const sendVerificationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Only for development; not recommended for production
    },
  });

  const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/verify?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your email address",
    text: `Please verify your email by clicking on the following link: ${verificationUrl}`,
    html: `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h1 style="color: #4CAF50;">Verify Your Email Address</h1>
      <p>Please verify your email by clicking on the following link:</p>
      <a href="${verificationUrl}" style="color: #ffffff; background-color: #4CAF50; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  `, // HTML content of the email
  };

  await transporter.sendMail(mailOptions);
};

//FUNCTION CHECKS USER EXISTANCE (USERNAME AND EMAIL FOR ERROR CLARIFICATION)
export const checkUserExists = async (username: string, email: string) => {
  if (!users) throw new Error("Users collection is not initialized");
  try {
    const usernameExists = await users.findOne({ username });
    const emailExists = await users.findOne({ email });

    return {
      usernameExists: !!usernameExists,
      emailExists: !!emailExists,
    };
  } catch (error) {
    console.error("Failed to check user existence:", error);
    throw new Error("Failed to check user existence");
  }
};

//FUNCTION CALLED IN THE API (SIGNUP)
export const verifyUserEmail = async (token: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    console.log("Token received:", token);
    const user = await users.findOne({ verificationToken: token });
    console.log("User found:", user);

    // Find the user by the verification token and update their status to verified
    const updatedUser = await users.findOneAndUpdate(
      { verificationToken: token }, // Find the user with the token
      {
        $set: { isVerified: true }, // Set the user as verified
        $unset: { verificationToken: "" }, // Remove the verification token
      },
      { returnDocument: "after" } // Return the updated document after the update
    );
    //here will be the logic of redirect
    if (!updatedUser) {
      return { status: 400, message: "Invalid token" };
    }

    return {
      status: 200,
      message: "Email verified successfully!",
      user: updatedUser,
    };
  } catch (error) {
    console.error("Error verifying email:", error);
    return { status: 500, message: "Error verifying email" };
  }
};

//FUNCTION USED IN SIGNIN
export const logUser = async (email: string, password: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const user = await users.findOne({ email });
    if (!user) {
      return { status: 400, message: "User does not exist" };
    }

    // Check if the user's email is verified
    if (!user.isVerified) {
      return { status: 400, message: "Email is not verified" };
    }

    // Compare the hashed password with the plain-text password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );
    if (!isPasswordCorrect) {
      return { status: 400, message: "Username or password is incorrect" };
    }

    return {
      status: 200,
      _id: user._id.toString(),
      username: user.username,
      profilePicture: user.profilePicture,
      email: user.email,
      password: user.password,
    };
  } catch (error) {
    console.error("Error verifying user:", error);
    return { status: 500, message: "Error verifying user" };
  }
};

//FUNCTION TO FIND USER BY EMAIL
export const findUserByEmail = async (email: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users.findOne({ email });
};

//FIND ALL USERS FROM DB (USED FOR RENDERING ALL REVIEWS FOR A GAME)
export const findAllUsers = async () => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  return await users.find({}).toArray();
};

//FUNCTION TO UPDATE USER IMAGE
export const updateUserImage = async (
  email: string,
  profilePicture: string
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  // Update the user profile with the new profile picture URL
  const result = await users.findOneAndUpdate(
    { email }, // Find user by email
    { $set: { profilePicture } }, // Update the profilePicture field
    { returnDocument: "after" } // Return the updated document
  );

  return result?.profilePicture;
};

// FUNCTION TO FETCH USER DETAILS SPECIFIC FOR PROFILE
export const fetchUserDets = async (email: string) => {
  if (!users) await init(); // Initialize the database if not already done
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const user = await users.findOne({ email });

    if (!user) {
      console.error("User not found");
      throw new Error("User not found");
    }

    return {
      _id: user._id.toString(), // Convert _id to string to avoid BSON issues on the client-side
      profilePicture: user.profilePicture || null, // Return the profile picture or null if not set
      library: user.library || null,
      watchlist: user.watchlist || [],
    };
  } catch (error) {
    console.error("Error fetching profile picture:", error);
    throw new Error("Failed to fetch profile picture");
  }
};

export const findUserById = async (id: string) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");
  try {
    const objectId = new ObjectId(id);
    const result = await users.findOne({ _id: objectId });
    return result;
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw new Error("Failed to fetch user by id");
  }
};

//FUNCTION TO UPDATE USER FIELDS
export const updateUserById = async (
  id: string,
  updatedFields: { username?: string; password?: string }
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const objectId = new ObjectId(id);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $set: updatedFields }, // Use $set to only update the provided fields
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error updating user by id:", error);
    throw new Error("Failed to update user by id");
  }
};

//FUNTION ADDING A MOVIE TO WATCHLIST
export const addToWatchlist = async (userId: string, item: {id: number; media_type:string}) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $addToSet: { watchlist: item } }, // Use $addToSet to add the movieId to the watchlist array
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD GAME TO LIBRARY
export const addToList = async (
  userId: string,
  gameId: number,
  gameName: string,
  gamePic: string,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const libraryId = Math.floor(Math.random() * 900000) + 100000;

  const newAddition: Library = {
    libraryId: libraryId,
    gameId: gameId,
    gameName: gameName,
    gamePic: gamePic,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };
  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $addToSet: { library: newAddition } }, // Use $addToSet to add the elements
      { returnDocument: "after" } // Return the updated document
    );
    return result;
  } catch (error) {
    console.error("Error adding to List:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD MOVIE REVIEW
export const addMovieReview = async (
  userId: string,
  movieId: number,
  movieName: string,
  text: string,
  rating: number,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  const newReview: MovieReview = {
    reviewId: reviewId,
    movieId: movieId,
    movieName: movieName,
    text: text,
    rating: rating,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_movie_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADD SHOW REVIEW
export const addShowReview = async (
  userId: string,
  showId: number,
  showName: string,
  text: string,
  rating: number,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  const newReview: ShowReview = {
    reviewId: reviewId,
    showId: showId,
    showName: showName,
    text: text,
    rating: rating,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };

  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_show_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

//ADDING USER REVIEW
export const addUserReview = async (
  userId: string,
  gameId: number,
  gameName: string,
  reaction: string,
  text: string,
  date: Date
) => {
  if (!users) await init();
  if (!users) throw new Error("Users collection is not initialized");

  const reviewId = Math.floor(Math.random() * 900000) + 100000;
  // Create a new review object
  const newReview: Review = {
    reviewId: reviewId,
    gameId: gameId,
    gameName: gameName,
    reaction: reaction,
    text: text,
    date: new Date(date).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // Change to true if you want AM/PM
    }),
  };
  try {
    const objectId = new ObjectId(userId);
    const result = await users.findOneAndUpdate(
      { _id: objectId },
      { $push: { user_reviews: newReview } },
      { returnDocument: "after" }
    );
    return result;
  } catch (error) {
    console.error("Error adding to reviews:", error);
    throw new Error("Failed to update user by id");
  }
};

// FUNCTION TO DELETE USER FROM PROFILE
export const deleteUserById = async (userId: string) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Delete the user from the collection
    const result = await users.deleteOne({ _id: objectId });

    if (result.deletedCount === 1) {
      return { message: "User deleted successfully" };
    } else {
      return { message: "User not found" };
    }
  } catch (error) {
    console.error("Failed to delete user:", error);
    throw new Error("Failed to delete user");
  }
};

//FUNCTION TO REMOVE GAME FROM PROFILE
export const removeGame = async (userId: string, libraryId: number) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Update the user's library by removing the game with the specified gameId
    const result = await users.updateOne(
      { _id: objectId }, // Find the user by _id
      { $pull: { library: { libraryId: libraryId } } } // Remove the game from the library array
    );

    if (result.modifiedCount === 1) {
      return { message: "Game removed from library successfully" };
    } else {
      return { message: "Game not found or no changes made" };
    }
  } catch (error) {
    console.error("Failed to remove game:", error);
    throw new Error("Failed to remove game");
  }
};

//FUNCTION TO REMOVE REVIEW FROM PROFILE
export const removeReview = async (userId: string, reviewId: number) => {
  try {
    if (!users) await init();
    if (!users) throw new Error("Users collection is not initialized");

    // Convert userId string to ObjectId
    const objectId = new ObjectId(userId);

    // Update the user's library by removing the game with the specified gameId
    const result = await users.updateOne(
      { _id: objectId }, // Find the user by _id
      { $pull: { user_reviews: { reviewId: reviewId } } } // Remove the game from the library array
    );

    if (result.modifiedCount === 1) {
      return { message: "Review has been succesfully removed." };
    } else {
      return { message: "Review not found or no changes made" };
    }
  } catch (error) {
    console.error("Failed to remove review:", error);
    throw new Error("Failed to remove review");
  }
};
