// import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import SessionWrapper from "./Components/SessionWrapper";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../app/api/uploadthing/core";
import { Metadata } from "./Constants/constants";
import { cn } from "@/lib/utils";

// const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

//Metadata of site, all help increasing of SEO
export const metadata: Metadata = {
  title: "CineGame Critic - Reviews of Movies & Games",
  description:
    "CineGame Critic provides the latest reviews and ratings for movies and video games. Stay updated with our curated reviews from critics.",
  keywords:
    "movies, games, reviews, articles, information, entertainment, ratings, film critique, video game critique",
  authors: [
    {
      name: "Stefanos Kaloulis",
      url: "www.linkedin.com/in/stefanos-kaloulis-b4ba792b6", // Optional: link to author profile
    },
    {
      name: "Apostolos Kyrgidhs",
      url: "www.linkedin.com/in/apostolos-kyrgidis/", // Optional: link to author profile
    },
  ],
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionWrapper>
      <html
        lang="en"
        className={cn(roboto.className, "font-sans", roboto.variable)}
      >
        <head>
          <title>
            {typeof metadata.title === "string"
              ? metadata.title
              : "Default Title"}
          </title>
          <meta
            name="description"
            content={
              typeof metadata.description === "string"
                ? metadata.description
                : "Default description goes here"
            }
          />
          {metadata.authors.map((author, index) => (
            <meta key={index} name="author" content={author.name} />
          ))}
          <meta
            name="robots"
            content={
              typeof metadata.robots === "string"
                ? metadata.robots
                : "index, follow"
            }
          />
          <link
            rel="icon"
            href="/assets/images/site-logo-cropped.png"
            sizes="32x32"
            type="image/png"
          />
          <link
            rel="icon"
            href="/assets/images/site-logo-cropped.png"
            sizes="48x48"
            type="image/png"
          />
          <link
            rel="icon"
            href="/assets/images/site-logo-cropped.png"
            sizes="672x672"
            type="image/png"
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "CineGame Critic",
                url: "https://www.cinegamecritic.com", // Replace with your actual site URL
                logo: "https://www.cinegamecritic.com/assets/images/site-logo-cropped.png", // Replace with the actual path to your logo
                sameAs: [
                  "https://www.linkedin.com/in/stefanos-kaloulis-b4ba792b6",
                  "https://www.linkedin.com/in/apostolos-kyrgidis/",
                ],
              }),
            }}
          />
        </head>
        <body>
          <NextSSRPlugin
            /**
             * The `extractRouterConfig` will extract **only** the route configs
             * from the router to prevent additional information from being
             * leaked to the client. The data passed to the client is the same
             * as if you were to fetch `/api/uploadthing` directly.
             */
            routerConfig={extractRouterConfig(ourFileRouter)}
          />
          {children}
          <NextTopLoader
            color="#2299DD"
            initialPosition={0.08}
            crawlSpeed={200}
            height={3}
            crawl={true}
            showSpinner={false}
            easing="ease"
            speed={200}
            shadow="0 0 10px #2299DD,0 0 5px #2299DD"
            template='<div class="bar" role="bar"><div class="peg"></div></div>'
            zIndex={1600}
            showAtBottom={false}
          />
        </body>
      </html>
    </SessionWrapper>
  );
}
