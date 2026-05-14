import Image from "next/image";
import Link from "next/link";
import { FaFacebook, FaGithub } from "react-icons/fa";
import { FaSquareInstagram, FaXTwitter } from "react-icons/fa6";

function Footer() {
  return (
    <div className="flex w-full lg:px-44 sm:px-20 px-6 items-center flex-col sticky h-auto bg-black mt-6">
      <div className="w-full pt-4 justify-between flex lg:flex-row flex-col items-center">
        <div className="flex lg:flex-row flex-col w-full lg:justify-normal justify-center items-center lg:gap-3 gap-0">
          <Image
            src="/assets/images/site-logo-cropped.webp"
            alt="site_logo"
            className="sm:h-20 h-16 object-cover mb-2 rounded-2xl"
            width={80}
            height={80}
          />
          <span className="title text-white sm:text-xl text-lg mb-2 font-black pointer-events-auto italic font-sans">
            CineGame Critic
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="sm:text-lg text-md mb-3 text-slate-100 font-bold">
            Follow Us:
          </span>
          <div className="flex flex-row mb-4 gap-4">
            <Link
              href={"https://github.com/WebDevTeam2/CGC.git"}
              className="text-4xl text-stone-950 bg-slate-200 rounded-full transition-all ease-in-out duration-300 hover:scale-110"
            >
              <FaGithub />
            </Link>
            <Link
              href={"https://www.instagram.com/cinegamecritic_official/"}
              className="text-4xl text-fuchsia-600 bg-white rounded-lg transition-all ease-in-out duration-300 hover:scale-110"
            >
              <FaSquareInstagram />
            </Link>
            <Link
              href={"https://www.facebook.com/profile.php?id=61567400382908"}
              className="text-4xl text-blue-700 bg-white rounded-full transition-all ease-in-out duration-300 hover:scale-110"
            >
              <FaFacebook />
            </Link>
            <Link
              href={"https://x.com/cinegamecritic"}
              className="text-4xl text-slate-100 bg-none rounded-full transition-all ease-in-out duration-300 hover:scale-110"
            >
              <FaXTwitter />
            </Link>
          </div>
        </div>
      </div>
      <div className="w-full bg-slate-200 h-[0.5px]"></div>
      <span className="text-sm text-center mt-5 text-slate-100 font-thin">
        © 2024 CineGame Critic. All rights reserved.
      </span>
      <span className="text-sm text-center mb-5 text-slate-100 font-thin">
        Game data provided by{" "}
        <Link className="text-blue-400" href={"https://rawg.io/"}>
          RAWG
        </Link>{" "}
        API. Movie data provided by{" "}
        <Link className="text-blue-400" href={"https://www.themoviedb.org/"}>
          TMDB
        </Link>{" "}
        API.
      </span>
    </div>
  );
}

export default Footer;
