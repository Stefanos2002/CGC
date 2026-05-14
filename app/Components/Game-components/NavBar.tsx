"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaXbox, FaPlaystation } from "react-icons/fa";
import { BsNintendoSwitch } from "react-icons/bs";
import { SiEpicgames } from "react-icons/si";
import { IoIosArrowDown } from "react-icons/io";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";
import Link from "next/link";
import Logout from "../Logout";
import { useSession } from "next-auth/react";
import defaultAvatar from "@/public/assets/images/default_avatar.jpg";
import siteLogo from "@/public/assets/images/logo.webp";
import SearchBar from "./SearchBar";
import Image from "next/image";
import GlareHover from "@/components/GlareHover";
import { TbMenuDeep } from "react-icons/tb";

const logos = [
  { component: <FaXbox />, key: 3, slug: "xbox" },
  { component: <FaPlaystation />, key: 2, slug: "playstation" },
  { component: <BsNintendoSwitch />, key: 7, slug: "nintendo" },
  { component: <SiEpicgames />, key: 1, slug: "pc" },
];

const NavBar = () => {
  const [user, setUser] = useState<any>(null);
  const [showmenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { data: session } = useSession();
  const profileRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener("mousedown", mouseHandler);
  }, []);

  useEffect(() => {
    const fetchProfileDetails = async () => {
      if (!session?.user?.email) return;
      try {
        const response = await fetch(`/api/getUserDetails/${session.user.email}`);
        if (!response.ok) return;
        const data = await response.json();
        if (data?._id) setUser(data);
      } catch (error) {
        console.error("Failed to fetch profile details:", error);
      }
    };
    fetchProfileDetails();
  }, [session?.user?.email]);

  const toggleMenu = () => setShowMenu((p) => !p);
  const closeDropdown = () => setShowMenu(false);
  const toggleProfile = () => setShowProfile((p) => !p);
  const closeProfile = () => setShowProfile(false);

  return (
    <nav className="w-full flex justify-between items-center sticky top-0 bg-black h-20 z-20">
      {/* Left: logo + avatar */}
      <div className="pl-4 flex items-center h-full gap-4 shrink-0 pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center justify-center">
          <GlareHover
            glareColor="#ffffff"
            glareOpacity={0.4}
            glareAngle={-30}
            glareSize={300}
            transitionDuration={800}
            height="60px"
            width="60px"
            borderRadius="100%"
            background="none"
            playOnce={false}
          >
            <Image
              src={siteLogo}
              alt="site_logo"
              width={56}
              height={56}
              className="object-contain rounded-full"
            />
          </GlareHover>
        </Link>
        {session && (
          <div
            className="relative pointer-events-none z-10 text-white max-[900px]:hidden"
            ref={profileRef}
          >
            <div
              className="pointer-events-auto flex flex-row items-center gap-1 cursor-pointer hover:brightness-75"
              onClick={toggleProfile}
            >
              <Image
                src={user?.profilePicture || defaultAvatar.src}
                alt="image"
                width={50}
                height={50}
                priority
                className="rounded-full object-cover"
              />
              <IoIosArrowDown className="text-white text-2xl" />
            </div>
            <div
              className={`pointer-events-auto absolute flex flex-col overflow-hidden -left-6 top-14 w-24 bg-white rounded-md shadow-lg transition-all duration-200 ${
                showProfile ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
              style={{ transitionProperty: "max-height, opacity" }}
              onClick={closeProfile}
            >
              <ul className="py-2 divide-y text-black">
                <Link href="/Account/info">
                  <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer">Profile</li>
                </Link>
                <li className="px-3 text-md py-4 hover:bg-gray-100 cursor-pointer">
                  <Logout />
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Center: search bar — hidden below md (768px) */}
      <div className="hidden md:flex flex-1 justify-center px-4">
        <SearchBar />
      </div>

      {/* Right: search icon (mobile only), register, hamburger */}
      <div className="flex items-center gap-2 pr-4 shrink-0" ref={menuRef}>
        <button
          className="md:hidden text-white text-2xl p-2 rounded-full hover:bg-neutral-800 transition-all duration-200"
          onClick={() => setShowSearch(true)}
          aria-label="Open search"
        >
          <AiOutlineSearch />
        </button>

        {!session && (
          <Link href="/Authentication/Signup">
            <button className="text-neutral-900 tracking-wide border bg-neutral-200 sm:text-lg text-sm transition delay-50 p-2 rounded-2xl hover:scale-105">
              Register
            </button>
          </Link>
        )}

        <button
          className="text-white rounded-full hover:bg-neutral-800 transition-all duration-200 text-4xl p-1.5"
          onClick={toggleMenu}
          aria-label="Open menu"
        >
          <TbMenuDeep strokeWidth={1} />
        </button>

        <ul
          style={{ transitionProperty: "max-height, opacity" }}
          className={`${
            showmenu ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
          } bg-black w-28 py-3 absolute z-30 right-0 top-16 transition-all duration-300 ease-in-out overflow-hidden rounded-b-lg gap-5 flex items-center justify-center flex-col`}
        >
          {logos.map((logo) => (
            <Link key={logo.key} href={`/Games/page/1?console=${logo.slug}`}>
              <div
                className="text-stone-200 sm:text-3xl text-2xl transition delay-50 p-2 rounded-full hover:scale-110"
                onClick={closeDropdown}
              >
                {logo.component}
              </div>
            </Link>
          ))}
          <Link href="/Games/page/1">
            <button
              className="font-bold text-white text-lg transition delay-50 p-2 rounded-full hover:scale-105"
              onClick={closeDropdown}
            >
              All Games
            </button>
          </Link>
          {session && (
            <div className="min-[900px]:hidden flex flex-col items-center gap-5">
              <Link href="/Account/info">
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

      {/* Mobile search overlay */}
      {showSearch && (
        <div className="md:hidden absolute inset-0 bg-black flex items-center gap-2 px-3 z-30">
          <SearchBar className="w-full" />
          <button
            className="text-white text-2xl p-2 shrink-0 rounded-full hover:bg-neutral-800 transition-all duration-200"
            onClick={() => setShowSearch(false)}
            aria-label="Close search"
          >
            <AiOutlineClose />
          </button>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
