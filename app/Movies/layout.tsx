//Components
import Nav from "@/app/Components/Movie-components/Nav";
import SessionWrapper from "../Components/SessionWrapper";
import { ThemeProvider } from "../DarkTheme/ThemeContext";
//layout
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./movieStyles.css";
import Footer from "../Components/Footer";

const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Movies",
  description:
    "Browse movies on CineGame Critic — discover trending films, upcoming releases, and filter by genre. Read user reviews and add titles to your watchlist.",
};

export default function MoviesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <ThemeProvider>
        <div className={`${roboto.className}`}>
          <Nav />
          {children}
          <Footer />
        </div>
      </ThemeProvider>
    </SessionWrapper>
  );
}
