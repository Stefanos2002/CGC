"use client";
import { AiOutlineSearch } from "react-icons/ai";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { IoStarSharp } from "react-icons/io5";
import Image from "next/image";

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
}

interface SearchBarProps {
  // No props needed anymore
}

const convertToStars = (rating: number) => {
  const stars: JSX.Element[] = [];
  const whole = Math.floor(rating);
  const remainder = rating - whole;
  const percentage_r = `${remainder * 100}%`;

  // Define colors based on rating range
  const getColor = (rating: number) => {
    if (rating < 3) return "darkorange";
    if (rating < 4) return "#C4B454";
    return "darkgreen";
  };

  const color = getColor(rating);

  // Add full stars
  for (let i = 0; i < whole; i++) {
    stars.push(
      <IoStarSharp
        key={i}
        style={{
          background: color,
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  // Add partial star if there's a remainder
  if (remainder > 0) {
    stars.push(
      <IoStarSharp
        key="partial"
        style={{
          background: `linear-gradient(to right, ${color} ${percentage_r}, grey ${percentage_r})`,
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  // Add empty stars to complete 5
  while (stars.length < 5) {
    stars.push(
      <IoStarSharp
        key={stars.length}
        style={{
          background: "grey",
          fontSize: "24px",
          padding: "2px",
        }}
      />,
    );
  }

  return stars;
};

const SearchBar: React.FC<SearchBarProps> = () => {
  const [search, setSearch] = useState<PostResult[]>([]);
  const [inputValue, setInputValue] = useState(""); // State to manage input value
  const [visible, setVisible] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1); // State to manage the selected index
  const [isLoading, setIsLoading] = useState(false);
  const resultsRef = useRef<HTMLFormElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = async (query: string) => {
    if (query.length < 2) {
      setSearch([]);
      return;
    }

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  //handle case as you are writting in the search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIsTyping(value.length > 0);
    setInputValue(value);
    setVisible(true);
    const lowercaseValue = value.toLowerCase();
    const searchElement = document.querySelector(".search") as HTMLElement;

    if (lowercaseValue === "") {
      setSearch([]);
      setSelectedIndex(-1);
      setIsLoading(false);
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

  const expandWidth = (element: HTMLElement) => {
    element.style.position = "absolute";
    element.style.width = "100vw"; // Example width for when typing
    element.style.zIndex = "20";
    element.style.padding = "0 20px 0 15px";
  };

  const handleResize = () => {
    const searchElement = document.querySelector(".search") as HTMLElement;
    if (!searchElement) return;

    if (window.innerWidth >= 1300) {
      resetSearchElementStyles(searchElement);
    } else if (window.innerWidth < 1300) {
      if (isTyping) {
        expandWidth(searchElement);
      } else {
        resetSearchElementStyles(searchElement);
      }
    } else if (inputValue) {
      expandWidth(searchElement);
    }
  };

  useEffect(() => {
    const searchElement = document.querySelector(".search") as HTMLElement;

    if (window.innerWidth < 1300) {
      if (isTyping) {
        expandWidth(searchElement);
      } else {
        resetSearchElementStyles(searchElement);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [inputValue, isTyping]);

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
    const spans = document.querySelectorAll(".search-result");
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && selectedIndex < search.length - 1) {
        selectedIndex++;
        //adding color for each selection
        spans.forEach((span, index) => {
          if (index === selectedIndex) {
            span.classList.add("text-stone-400");
          } else {
            span.classList.remove("text-stone-400");
          }
        });
      } else if (e.key === "ArrowUp" && selectedIndex > 0) {
        selectedIndex--;
        //adding color for each selection
        spans.forEach((span, index) => {
          if (index === selectedIndex) {
            span.classList.add("text-stone-400");
          } else {
            span.classList.remove("text-stone-400");
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
    }
  };

  return (
    <form
      className="search relative w-full"
      ref={resultsRef}
      onSubmit={handleSubmit}
    >
      <div className="sticky top-4 w-full text-lg">
        <input
          type="search"
          placeholder="Type Here"
          className="subpixel-antialiased h-12 w-full outline-none rounded-full bg-slate-200 pl-10 pr-11 text-slate-600"
          onChange={handleInputChange}
          value={inputValue}
        />
        <div
          className="absolute divide-y top-16 bg-black text-white rounded-2xl w-full"
          style={{
            height:
              visible && search.length > 0
                ? `${
                    search.length === 1
                      ? 8.5
                      : search.length * (window.innerWidth < 550 ? 4.3 : 8.2)
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
              className="flex flex-row transition-all duration-300 ease-in-out hover:scale-[1.02] pl-6 hover:text-stone-400"
            >
              <div className="relative overflow-hidden sm:w-44 sm:h-32 min-[420px]:w-40 min-[420px]:h-28 w-36 h-24 flex-shrink-0 flex-grow-0">
                {result.background_image && (
                  <Image
                    src={result.background_image}
                    alt={result.name}
                    className="w-full h-full object-contain"
                    fill
                  />
                )}
              </div>
              <div className="flex flex-col">
                <div
                  onClick={() => handleAutoComplete(result.name)}
                  className="search-result pt-3 uppercase font-bold italic cursor-pointer text-[16px] pl-6 pr-4"
                >
                  {result.name}
                </div>
                <div className="pt-3 flex flex-row items-center italic cursor-pointer text-black font-black text-[16px] pl-6 pr-4">
                  <span className="flex gap-[0.9px] text-white rounded-md p-1">
                    {convertToStars(result.rating)}
                  </span>
                </div>
                <div className="py-2 cursor-pointer text-[15px] pl-6 pr-4">
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
