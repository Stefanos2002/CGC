"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoMenu } from "react-icons/io5";
import { FaXbox, FaPlaystation } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { SiEpicgames } from "react-icons/si";
import { IoIosArrowDown } from "react-icons/io";
import Link from "next/link";
import Logout from "../Logout";
import { useSession } from "next-auth/react";
import defaultAvatar from "@/public/assets/images/default_avatar.jpg";
import SearchBar from "./SearchBar";
import Image from "next/image";

const logos = [
  { component: <FaXbox />, key: 3, slug: "xbox" },
  { component: <FaPlaystation />, key: 2, slug: "playstation" },
  { component: <BsNintendoSwitch />, key: 7, slug: "nintendo" },
  { component: <SiEpicgames />, key: 1, slug: "pc" },
];

const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [showmenu, setShowMenu] = useState(false);
  const [openMenu, setisOpenMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { data: session, status } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isWideScreen, setIsWideScreen] = useState<boolean | undefined>(
    undefined,
  );

  // Handle window resize
  useEffect(() => {
    // Set initial `isWideScreen` value based on the window width after mount
    setIsWideScreen(window.innerWidth > 640);

    // Handle window resize to update `isWideScreen` on resize events
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 640);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //check if clicked outside of input container
  useEffect(() => {
    const mouseHandler = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setTimeout(() => {
          setShowProfile(false);
          setShowMenu(false);
        }, 50);
      }
    };
    document.addEventListener("mousedown", mouseHandler);
    return () => {
      document.removeEventListener("mousedown", mouseHandler);
    };
  }, []);

  const toggleMenu = () => {
    setShowMenu(!showmenu);
  };
  const toggleMenu2 = () => {
    setisOpenMenu(!openMenu);
  };
  const closeDropdown = () => {
    setShowMenu(false);
  };
  const toggleProfile = () => {
    setShowProfile(!showProfile);
  };
  const closeProfile = () => {
    setShowProfile(false);
  };

  // // Fetch the user's details from the database on component mount
  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (session?.user?.email) {
        try {
          // Fetch response using the email as a query param
          const response = await fetch(
            `/api/getUserDetails/${session.user.email}`,
          );

          if (!response.ok) {
            console.error("Error fetching user details:", response.statusText);
            return;
          }

          // Parse the response as JSON
          const data = await response.json();

          // Check if the data contains a valid id
          if (data?._id) {
            setUser(data);
          } else {
            console.log("No profile found for this user.");
          }
        } catch (error) {
          console.error("Failed to fetch profile details:", error);
        }
      }
    };

    fetchProfileDetails();
  }, [session?.user?.email]); // Only re-run this effect if the session changes\

  return (
    <nav className="w-full flex justify-between gap-6 items-center sticky top-0 bg-black h-20 z-20">
      <div className="pl-4 left-side-elements  h-full flex-1 items-center pointer-events-none">
        <div className="flex gap-9 items-center h-full">
          <Link
            href="/"
            className="title text-white text-4xl font-black pointer-events-auto italic font-sans"
          >
            CGC
          </Link>
          <Link
            href="/Movies/moviePage/1"
            className="title hover:scale-105 transition-all duration-200 text-cyan-400 text-2xl font-extrabold pointer-events-auto italic font-sans"
          >
            MOVIES
          </Link>
          {session && (
            <div
              className="relative pointer-events-none z-10 group text-white flex flex-col max-[900px]:hidden"
              ref={profileRef}
            >
              <div
                className="pointer-events-auto flex flex-row items-center justify-center gap-1 hover:cursor-pointer hover:brightness-75 w-auto h-auto"
                onClick={toggleProfile}
              >
                <Image
                  src={user?.profilePicture || defaultAvatar.src}
                  alt="image"
                  width={50}
                  height={50}
                  priority
                  className="rounded-full max-w-max object-cover"
                />
                <IoIosArrowDown className="text-white text-2xl" />
              </div>
              <div
                ref={profileRef}
                className={`pointer-events-auto absolute flex flex-col overflow-hidden -left-6 top-14 w-24 bg-white rounded-md shadow-lg transition-all duration-200 ${
                  showProfile ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
                style={{ transitionProperty: "max-height, opacity" }}
                onClick={closeProfile}
              >
                <ul className="py-2 divide-y text-black">
                  <Link href={`/Account/info`}>
                    <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">
                      Profile
                    </li>
                  </Link>
                  <li className="px-3 text-md py-4 hover:bg-gray-100 cursor-pointer">
                    <Logout />
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
      <SearchBar />
      {isWideScreen !== undefined &&
        (isWideScreen ? (
          <div className="right-side-elements flex items-center gap-3 pr-6 relative h-full">
            {!session ? (
              <div className="lg:flex hidden">
                <Link href={"/Authentication/Signup"}>
                  <button className="text-white font-black italic uppercase sm:text-xl text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                    SignUp
                  </button>
                </Link>
                <Link href={"/Authentication/Signin"}>
                  <button className="text-white font-black italic uppercase sm:text-xl text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                    LogIn
                  </button>
                </Link>
              </div>
            ) : (
              <div className="hidden"></div>
            )}
            <div
              ref={menuRef}
              style={{ transitionProperty: "transform" }}
              className={` items-center transition-all duration-300 ease-in-out flex gap-2 flex-row mt-0`}
            >
              <div className="lg:flex gap-2 hidden items-center">
                {logos.map((logo) => (
                  <Link key={logo.key} href={`/Games/${logo.slug}/page/1`}>
                    <div
                      className="text-stone-200 sm:text-3xl text-2xl transition delay-50 p-2 rounded-full hover:scale-110"
                      onClick={closeDropdown}
                    >
                      {logo.component}
                    </div>
                  </Link>
                ))}
                <Link href={"/Games/page/1"}>
                  <button className="font-black italic text-white uppercase sm:text-lg text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                    All Games
                  </button>
                </Link>
              </div>
              <button
                className={`text-white lg:hidden block rounded-full p-2 hover:bg-neutral-800 transition-all duration-200 ease-in-out text-5xl w-16 py-2 px-2 `}
                onClick={toggleMenu}
              >
                <IoMenu />
              </button>

              <ul
                style={{ transitionProperty: "max-height, opacity, transform" }}
                className={`${
                  showmenu ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
                }  bg-black w-28 py-3 absolute z-30 right-0 top-16 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg gap-5 flex items-center justify-center flex-col`}
              >
                {logos.map((logo) => (
                  <Link key={logo.key} href={`/Games/${logo.slug}/page/1`}>
                    <div
                      className="text-stone-200 sm:text-3xl text-2xl transition delay-50 p-2 rounded-full hover:scale-110"
                      onClick={closeDropdown}
                    >
                      {logo.component}
                    </div>
                  </Link>
                ))}
                {!session ? (
                  <div className="lg:hidden flex flex-col items-center justify-center gap-5">
                    <Link href={"/Authentication/Signup"}>
                      <button className="uppercase italic text-white font-black sm:text-xl text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                        Sign Up
                      </button>
                    </Link>
                    <Link href={"/Authentication/Signin"}>
                      <button className="uppercase italic text-white font-black sm:text-xl text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                        Log In
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="hidden"></div>
                )}
                <Link href={"/Games/page/1"}>
                  <button className="font-black italic text-white uppercase text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                    All Games
                  </button>
                </Link>
                {session && (
                  <div className="min-[900px]:hidden flex flex-col items-center gap-5">
                    <Link href={`/Account/info`}>
                      <button className="text-cyan-400 uppercase italic font-black text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                        My Profile
                      </button>
                    </Link>
                    <div className="text-stone-200 text-lg transition delay-50 p-2 rounded-full hover:scale-110">
                      <Logout />
                    </div>
                  </div>
                )}
              </ul>
            </div>
          </div>
        ) : (
          <div
            className={`menu flex flex-col drop-shadow-lg w-full absolute top-16 items-center  `}
          >
            <button
              onClick={toggleMenu2}
              className="text-black font-black uppercase order-2 bg-white w-full py-2 text-lg"
            >
              Menu
            </button>

            {/* Conditional rendering of the ul based on isOpen state */}

            <div
              className={`bg-black w-full gap-3 p-2 flex items-center justify-center flex-wrap text-slate-100 order-1 transition-all duration-300 ease-in-out ${
                openMenu ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
            >
              {logos.map((logo) => (
                <Link key={logo.key} href={`/Games/${logo.slug}/page/1`}>
                  <div
                    className="text-stone-200 text-3xl transition delay-50 p-2 rounded-full hover:scale-110"
                    onClick={closeDropdown}
                  >
                    {logo.component}
                  </div>
                </Link>
              ))}
              {!session ? (
                <div className="flex gap-5">
                  <Link href={"/Authentication/Signup"}>
                    <button className="text-white uppercase italic font-black text-md transition delay-50 rounded-full hover:scale-110">
                      SignUp
                    </button>
                  </Link>
                  <Link href={"/Authentication/Signin"}>
                    <button className="text-white uppercase italic font-black text-md transition delay-50  rounded-full hover:scale-110">
                      LogIn
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="hidden"></div>
              )}
              <Link href={"/Games/page/1"}>
                <button className="text-white uppercase italic font-black text-md transition delay-50  rounded-full hover:scale-110">
                  All Games
                </button>
              </Link>
              {session && (
                <div className="min-[900px]:hidden flex gap-3">
                  <Link href={`/Account/info`}>
                    <button className="text-cyan-400 italic font-black text-md transition delay-50 rounded-full hover:scale-110">
                      My Profile
                    </button>
                  </Link>
                  <div className="text-stone-200 text-md transition delay-50  rounded-full hover:scale-110">
                    <Logout />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
    </nav>
  );
};

export default NavBar;
