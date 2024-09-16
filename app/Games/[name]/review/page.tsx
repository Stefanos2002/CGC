import Link from "next/link";
import { IoReturnUpBack } from "react-icons/io5";

const basePosterUrl = `https://api.rawg.io/api/games/`;
const apiPosterKey = `key=076eda7a1c0e441eac147a3b0fe9b586`;

interface PostPage {
  id: number;
  slug: string;
  name: string;
  next: string;
  previous: string;
  ratings_count: number;
  ratings: [
    {
      id: number;
      title: string; //this is the one I want
      count: number;
    }
  ];
  background_image: string;
}

interface Post {
  page: number;
}

interface Rating {
  id: number;
  title: string;
  count: number;
}
interface CombinedParams extends PostPage, Post {}

const getGame = async (name: string) => {
  const res = await fetch(basePosterUrl + name + "?" + apiPosterKey);
  // https://api.rawg.io/api/games/grand-theft-auto-v?key=f0e283f3b0da46e394e48ae406935d25
  const data = await res.json();
  return data;
};

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

export default async function Games({ params }: { params: CombinedParams }) {
  const game = await getGame(params.name);
  const sortedRatings = game.ratings.sort(
    (a: Rating, b: Rating) => b.id - a.id
  );
  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   const errors: string[] = [];

  //   if (
  //     formData.username === initialData.username &&
  //     !formData.password.trim() &&
  //     !formData.passwordre.trim()
  //   ) {
  //     alert("Nothing to update");
  //     return; // No need to proceed further
  //   }

  //   const usernameRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d\W]{10,}$/;
  //   if (formData.username.trim() && !usernameRegex.test(formData.username)) {
  //     errors.push(
  //       "Username must be at least 10 characters long, contain at least one capital letter, one number, and may include symbols."
  //     );
  //   }

  //   // Password validation
  //   if (formData.password.trim() || formData.passwordre.trim()) {
  //     const passwordRegex = /^(?=.*[A-Z])[A-Za-z\d\W]{10,}$/;
  //     if (!passwordRegex.test(formData.password)) {
  //       errors.push(
  //         "Password must be at least 10 characters long, contain at least one capital letter, and may include symbols."
  //       );
  //     }

  //     if (formData.password !== formData.passwordre) {
  //       errors.push("Passwords do not match");
  //     }
  //   }

  //   if (errors.length > 0) {
  //     setErrorMessages(errors);
  //     return;
  //   }

  //   // Prepare the data object to be sent in the update
  //   const updatedData: any = {
  //     username: formData.username,
  //     email: formData.email,
  //   };

  //   // Only include password if it is not empty and valid
  //   if (formData.password.trim()) {
  //     const hashedPassword = await bcrypt.hash(formData.password, 10);
  //     updatedData.password = hashedPassword;
  //   }

  //   const response = await fetch(`/api/users/${userid}`, {
  //     method: "PUT",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(updatedData),
  //   });

  //   if (response.ok) {
  //     alert("Review sent successfully!");
  //   } else {
  //     alert("Error sending review");
  //   }
  // };

  return (
    <div className="bg-black bg-cover flex flex-col fixed overflow-hidden overflow-y-auto items-center h-screen w-full">
      <Link href={`/Games/${game.slug}`} className="w-full pointer-events-none">
        <button className=" ml-4 mt-4 pointer-events-auto left-0 text-2xl text-white transition duration-100 p-1 rounded-full hover:scale-110">
          ...Back to the Game
        </button>
      </Link>
      <form
        className="flex mt-10 mx-10 mb-20 flex-col relative bg-neutral-200 rounded-2xl"
        onSubmit={handleSubmit}
      >
        {/* header of review */}
        <div className="sm:p-8 p-4 flex flex-col gap-3 font-sans border-2 rounded-t-2xl bg-black w-full">
          <span className="text-orange-400 font-extrabold text-xl">
            Write a review
          </span>
          <span className="text-white text-4xl">{game.name}</span>
        </div>
        {/* start of reactions */}
        <div className="sm:p-5 p-3 flex flex-wrap flex-row gap-3 font-serif border rounded-b-xl bg-black w-full">
          {sortedRatings.map(
            (rating: { id: number; title: string }, index: number) => (
              <div
                role="button"
                key={index}
                className="flex transition-all duration-200 hover:bg-neutral-600 bg-black  active:bg-neutral-600 items-center gap-2 border rounded-full pr-6 p-2"
              >
                <span className="text-3xl">{getReaction(rating.id)}</span>
                <span className="text-white text-xl">{rating.title}</span>
              </div>
            )
          )}
        </div>
        {/* start of textarea */}
        <textarea
          className="text-xl sm:h-96 h-72 p-8 rounded-t-2xl outline-none bg-neutral-200"
          placeholder="Type Here..."
        ></textarea>
        <input
          role="button"
          className="text-xl transition-all rounded-b-2xl duration-200 bg-neutral-400 hover:bg-neutral-500 p-3"
          type="submit"
        ></input>
      </form>
    </div>
  );
}
