"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiUser, FiFilm, FiLogOut } from "react-icons/fi";
import { FaGamepad } from "react-icons/fa";

const navItems = [
  { href: "/Account/info", label: "Account Details", icon: <FiUser /> },
  { href: "/Account/games", label: "Games", icon: <FaGamepad /> },
  { href: "/Account/movies", label: "Movies", icon: <FiFilm /> },
];

const UserOptions = () => {
  const pathname = usePathname();

  return (
    <div className="shrink-0 sm:w-52 w-full bg-[#0d0d18] border-b sm:border-b-0 sm:border-r border-white/10">
      <ul className="flex sm:flex-col flex-row sm:py-3">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link href={href} key={href} className="flex-1 sm:flex-none">
              <li
                className={`flex items-center gap-3 w-full px-5 sm:py-4 py-3 transition-all duration-200 cursor-pointer sm:border-l-2 border-b-2 sm:border-b-0 ${
                  active
                    ? "text-cyan-400 border-cyan-400 bg-cyan-400/5"
                    : "text-neutral-400 border-transparent hover:text-white hover:bg-white/5"
                } sm:justify-start justify-center`}
              >
                <span className="text-lg shrink-0">{icon}</span>
                <span className="sm:inline hidden text-md font-medium">
                  {label}
                </span>
              </li>
            </Link>
          );
        })}
        <li
          className="flex-1 sm:flex-none flex items-center gap-3 px-5 sm:py-4 py-3 text-neutral-400 hover:text-red-400 hover:bg-white/5 transition-all duration-200 cursor-pointer sm:border-l-2 border-b-2 sm:border-b-0 border-transparent sm:justify-start justify-center"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <span className="text-lg shrink-0">
            <FiLogOut />
          </span>
          <span className="sm:inline hidden text-sm font-medium">Sign out</span>
        </li>
      </ul>
    </div>
  );
};

export default UserOptions;
