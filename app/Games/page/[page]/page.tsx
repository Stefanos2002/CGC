import Link from "next/link";
import Image from "next/image";
import React from "react";
import Buttons from "@/app/components/Game-components/Buttons";
import MainPage from "@/app/components/Game-components/MainPage";
import NavBar from "@/app/components/Game-components/NavBar";
import SearchBar from "@/app/components/Game-components/SearchBar";
import { pageSize } from "@/app/constants/constants";
import {
  fetchAndCombineDataSimple,
  paginateGames,
  fetchGameDetails,
} from "@/app/utils/heplers";

interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}
interface Post {
  page: number;
  results: PostResult[];
  onSearch: (name: string) => void;
}

interface PostResult {
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  description: string;
  description_raw: string;
  parent_platforms: Platform[];
}

const Posts = async ({ params }: { params: Post }) => {
  try {
    const gameData = await fetchAndCombineDataSimple();
    const paginatedGames = paginateGames(gameData, params.page, pageSize);

    const platforms = Array.from(
      new Set(
        gameData.flatMap((game) =>
          game.parent_platforms.map((p) => JSON.stringify(p.platform))
        )
      )
    ).map((str) => ({ platform: JSON.parse(str) }));

    //fetch game description only for the paginated games not for all the games
    const detailedGames = await Promise.all(
      paginatedGames.map((item) => fetchGameDetails(item))
    );

    return (
      <div>
        <MainPage>
          <NavBar parent_platforms={platforms} />
          <SearchBar games={gameData} />
          {/* <Sort games={gameData} onSorted={handle} /> */}
          <ul className="relative flex mt-12 mb-12 w-full flex-col items-center justify-center xl:gap-12 gap-16">
            {detailedGames.map((item) => (
              <li
                key={item.id}
                className="text-slate-200 text-balance text-xl hover:scale-110 xl:w-3/5 w-4/5  transition-all duration-500 ease-in-out"
              >
                <Link
                  href={`/Games/${item.slug}`}
                  className="relative flex group border-2 md:h-60 h-[33rem] border-white rounded-lg transition-all duration-300"
                >
                  <div className="bg-black rounded-lg bg-opacity-[.7] relative flex flex-col md:flex-row md:gap-0 gap-2 transition-all duration-400">
                    <div className="relative overflow-hidden md:pb-56 pb-72 md:pr-96">
                      <Image
                        src={item.background_image}
                        alt={item.name}
                        fill={true}
                        style={{ objectFit: "cover" }}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="border-r-4 rounded-l-lg border-white transition duration-500 ease-in-out"
                      />
                    </div>
                    {/* item name on hover */}
                    <div
                      className="h-0 opacity-0 group-hover:opacity-100 absolute flex group-hover:h-10 max-w-80 items-center border border-black bg-black rounded-b-xl text-md ml-3 p-1"
                      style={{
                        transition:
                          "height 0.5s ease-in-out, opacity 0.5s ease-in-out",
                      }}
                    >
                      <span className="text-white truncate">{item.name}</span>
                    </div>
                    <div className="overflow-hidden pl-4 pt-3 leading-9 ">
                      <span className="">{item.description_raw}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <Buttons gamesLength={gameData.length} />
        </MainPage>
      </div>
    );
  } catch (error) {
    console.log("Error fetching render:", error);
    return <div>Error fetching game data</div>;
  }
};
// Export the Posts component
export default Posts;
