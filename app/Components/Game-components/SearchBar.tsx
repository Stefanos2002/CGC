"use client";
import { AiOutlineSearch } from "react-icons/ai";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  id: number;
  slug: string;
  name: string;
  released: string;
  background_image: string;
  parent_platforms: Platform[];
}

interface SearchBarProps {
  className?: string;
}

const platformIcon = (slug: string, id: number) => {
  const iconProps = { size: 16, className: "text-slate-300", key: id };
  switch (slug) {
    case "pc":
      return <FaWindows {...iconProps} />;
    case "playstation":
      return <FaPlaystation {...iconProps} />;
    case "xbox":
      return <FaXbox {...iconProps} />;
    case "nintendo":
      return <SiNintendoswitch {...iconProps} />;
    case "mac":
      return <FaApple {...iconProps} />;
    case "linux":
      return <FaLinux {...iconProps} />;
    case "android":
      return <FaAndroid {...iconProps} />;
    case "ios":
      return <FaApple {...iconProps} />;
    default:
      return null;
  }
};

const SearchBar: React.FC<SearchBarProps> = ({ className }) => {
  const [search, setSearch] = useState<PostResult[]>([]);
  const [inputValue, setInputValue] = useState(""); // State to manage input value
  const [visible, setVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const resultsRef = useRef<HTMLFormElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Debounced search function
  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSearch([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/searchGames?q=${encodeURIComponent(query)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setSearch(data.results || []);
      } else {
        setSearch([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearch([]);
    }
  };

  //handle case as you are writting in the search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setVisible(true);
    const lowercaseValue = value.toLowerCase();
    const searchElement = document.querySelector(".search") as HTMLElement;

    if (lowercaseValue === "") {
      setSearch([]);
      setSelectedIndex(-1);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      if (searchElement) {
        resetSearchElementStyles(searchElement);
      }
    } else {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer for debounced search
      debounceTimer.current = setTimeout(() => {
        performSearch(lowercaseValue);
      }, 300); // 300ms debounce

      setSelectedIndex(-1);
    }
  };

  const resetSearchElementStyles = (element: HTMLElement) => {
    element.style.width = ""; // Reset width
    element.style.margin = "";
    element.style.padding = "";
    element.style.right = "";
    element.style.position = "relative";
  };

  // const expandWidth = (element: HTMLElement) => {
  //   element.style.position = "absolute";
  //   element.style.width = "100vw"; // Example width for when typing
  //   element.style.zIndex = "20";
  //   element.style.padding = "0 20px 0 15px";
  // };

  // const handleResize = () => {
  //   const searchElement = document.querySelector(".search") as HTMLElement;
  //   if (!searchElement) return;

  //   if (window.innerWidth >= 1300) {
  //     resetSearchElementStyles(searchElement);
  //   } else if (window.innerWidth < 1300) {
  //     if (isTyping) {
  //       expandWidth(searchElement);
  //     } else {
  //       resetSearchElementStyles(searchElement);
  //     }
  //   } else if (inputValue) {
  //     expandWidth(searchElement);
  //   }
  // };

  // useEffect(() => {
  //   const searchElement = document.querySelector(".search") as HTMLElement;

  //   if (window.innerWidth < 1300) {
  //     if (isTyping) {
  //       expandWidth(searchElement);
  //     } else {
  //       resetSearchElementStyles(searchElement);
  //     }
  //   }

  //   window.addEventListener("resize", handleResize);
  //   return () => {
  //     window.removeEventListener("resize", handleResize);
  //   };
  // }, [inputValue, isTyping]);

  //check if clicked outside of input container
  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target as Node)
      ) {
        setTimeout(() => {
          setVisible(false);
        }, 50);
      }
    };
    document.addEventListener("mousedown", mouseHandler);
    return () => {
      document.removeEventListener("mousedown", mouseHandler);
    };
  }, []);

  // keys and enter functionality when rendering results
  useEffect(() => {
    let selectedIndex = -1;

    const handleKey = (e: KeyboardEvent) => {
      const links = document.querySelectorAll(".container");
      if (e.key === "ArrowDown" && selectedIndex < search.length - 1) {
        selectedIndex++;
        links.forEach((item, index) => {
          if (index === selectedIndex) {
            item.classList.add("scale-[1.03]", "text-stone-400");
          } else {
            item.classList.remove("scale-[1.03]", "text-stone-400");
          }
        });
      } else if (e.key === "ArrowUp" && selectedIndex > 0) {
        selectedIndex--;
        links.forEach((item, index) => {
          if (index === selectedIndex) {
            item.classList.add("scale-[1.03]", "text-stone-400");
          } else {
            item.classList.remove("scale-[1.03]", "text-stone-400");
          }
        });
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        e.preventDefault(); // Prevent form submission
        const selectedResult = search[selectedIndex];
        if (selectedResult) {
          window.location.href = `/Games/${selectedResult.slug}`;
        }
      }
      if (selectedIndex !== -1) {
        setInputValue(search[selectedIndex].name);
      }
    };

    const inputElement = document.querySelector(
      'input[type="search"]',
    ) as HTMLInputElement;

    if (inputElement) {
      inputElement.addEventListener("keydown", handleKey);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKey);
      }
    };
  }, [search, selectedIndex]);

  //function to auto complete the input if user clicks on title
  const handleAutoComplete = (selected: string) => {
    setSearch([]);
    setInputValue(selected);
    setSelectedIndex(-1);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedIndex >= 0 && search[selectedIndex]) {
      window.location.href = `/Games/${search[selectedIndex].slug}`;
    } else if (inputValue.trim()) {
      router.push(
        `/Games/page/1?search=${encodeURIComponent(inputValue.trim())}`,
      );
      setVisible(false);
    }
  };

  return (
    <form
      className={`search relative ${className ?? "w-[32rem] max-w-lg"}`}
      ref={resultsRef}
      onSubmit={handleSubmit}
    >
      <div className="sticky top-4 w-full text-lg">
        <input
          type="search"
          placeholder="Type Here"
          className="subpixel-antialiased text-[16px] h-12 w-full outline-none rounded-full bg-slate-200 pl-10 pr-11 text-slate-600"
          onChange={handleInputChange}
          value={inputValue}
        />
        <div
          className="absolute divide-y top-16 bg-black text-white rounded-2xl w-full"
          style={{
            height:
              visible && search.length > 0
                ? `${
                    search.length *
                      (window.innerWidth < 420
                        ? 5.5
                        : window.innerWidth < 550
                          ? 6.5
                          : 8.2)
                  }rem`
                : "0",
            transition: "height 0.2s ease-in-out",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {search.map((result, index) => (
            <Link
              key={index}
              href={`/Games/${result.slug}`}
              className="flex container items-center flex-row transition-all duration-300 ease-in-out hover:scale-[1.03] pl-2 sm:pl-6 hover:text-stone-400"
            >
              <div className="relative overflow-hidden w-20 h-14 min-[420px]:w-28 min-[420px]:h-20 sm:w-44 sm:h-32 flex-shrink-0 flex-grow-0">
                {result.background_image && (
                  <Image
                    src={result.background_image}
                    alt={result.name}
                    className="w-full h-full object-contain"
                    fill
                    sizes="(max-width: 419px) 80px, (max-width: 639px) 112px, 176px"
                  />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <div
                  onClick={() => handleAutoComplete(result.name)}
                  className="search-result pt-2 sm:pt-3 uppercase font-bold italic cursor-pointer text-[13px] sm:text-[16px] pl-2 pr-2 sm:pl-6 sm:pr-4 line-clamp-2"
                >
                  {result.name}
                </div>
                {result.parent_platforms?.length > 0 && (
                  <div className="pt-1 sm:pt-2 flex flex-row gap-1 sm:gap-2 flex-wrap pl-2 pr-2 sm:pl-6 sm:pr-4">
                    {result.parent_platforms.map(({ platform }) =>
                      platformIcon(platform.slug, platform.id),
                    )}
                  </div>
                )}
                <div className="py-1 sm:py-2 cursor-pointer text-[12px] sm:text-[15px] pl-2 pr-2 sm:pl-6 sm:pr-4">
                  Release Date: {result.released}
                </div>
              </div>
            </Link>
          ))}
        </div>
        <button className="absolute left-3 top-1/2 -translate-y-1/2 p-1 bg-slate-200 pointer-events-none">
          <AiOutlineSearch />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
