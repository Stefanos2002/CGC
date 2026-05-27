import Image from "next/image";
import Link from "next/link";
import React from "react";
import {
  FaWindows,
  FaPlaystation,
  FaXbox,
  FaApple,
  FaLinux,
  FaAndroid,
} from "react-icons/fa";
import { SiNintendoswitch } from "react-icons/si";

interface Platform {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

interface PostResult {
  _id: string;
  id: number;
  slug: string;
  name: string;
  released: string;
  tba: boolean;
  background_image: string;
  rating: number;
  rating_top: number;
  metacritic: number;
  description: string;
  description_raw: string;
  parent_platforms: Platform[];
}

interface GameListProps {
  paginatedGames: PostResult[];
}

const GameList: React.FC<GameListProps> = ({ paginatedGames }) => {
  return (
    <>
      <ul className="grid grid-cols-1 min-[550px]:grid-cols-2 min-[850px]:grid-cols-3 gap-6 mt-12 mb-12 w-full px-6 xl:px-16">
        {paginatedGames.map(
          (item, index) => (
              <li key={`${item._id}-${index}`}>
                <Link
                  href={`/Games/${item.slug}`}
                  className="flex flex-col group rounded-lg overflow-hidden border border-white/20 hover:border-white/60 hover:scale-[1.02] transition-all duration-300"
                >
                  <div className="relative w-full aspect-video flex-shrink-0">
                    <Image
                      src={item.background_image}
                      alt={item.name}
                      className="object-cover group-hover:scale-105 transition duration-500 ease-in-out"
                      fill
                    />
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3 bg-black/60">
                    <span className="text-slate-200 font-black text-[17px] leading-snug line-clamp-2">
                      {item.name}
                    </span>
                    {item.released && (
                      <span className="text-slate-400 text-sm">
                        {new Date(item.released).getFullYear()}
                      </span>
                    )}
                    {item.parent_platforms?.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {item.parent_platforms.map(({ platform }) => {
                          const iconProps = {
                            size: 18,
                            className: "text-slate-300",
                          };
                          switch (platform.slug) {
                            case "pc":
                              return (
                                <FaWindows key={platform.id} {...iconProps} />
                              );
                            case "playstation":
                              return (
                                <FaPlaystation
                                  key={platform.id}
                                  {...iconProps}
                                />
                              );
                            case "xbox":
                              return (
                                <FaXbox key={platform.id} {...iconProps} />
                              );
                            case "nintendo":
                              return (
                                <SiNintendoswitch
                                  key={platform.id}
                                  {...iconProps}
                                />
                              );
                            case "mac":
                              return (
                                <FaApple key={platform.id} {...iconProps} />
                              );
                            case "linux":
                              return (
                                <FaLinux key={platform.id} {...iconProps} />
                              );
                            case "android":
                              return (
                                <FaAndroid key={platform.id} {...iconProps} />
                              );
                            case "ios":
                              return (
                                <FaApple key={platform.id} {...iconProps} />
                              );
                            default:
                              return null;
                          }
                        })}
                      </div>
                    )}
                  </div>
                </Link>
              </li>
            ),
        )}
      </ul>
    </>
  );
};

export default GameList;
