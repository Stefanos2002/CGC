import "./globals.css";
import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import SessionWrapper from "./Components/SessionWrapper";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "../app/api/uploadthing/core";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });
const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.cinegame-critic.com"),
  title: {
    default: "CineGame Critic - Reviews of Movies & Games",
    template: "%s | CineGame Critic",
  },
  description:
    "CineGame Critic provides the latest reviews and ratings for movies and video games. Stay updated with our curated reviews from critics.",
  keywords: [
    "movies",
    "games",
    "reviews",
    "articles",
    "information",
    "entertainment",
    "ratings",
    "film critique",
    "video game critique",
  ],
  authors: [
    {
      name: "Stefanos Kaloulis",
      url: "https://www.linkedin.com/in/stefanos-kaloulis-b4ba792b6",
    },
    {
      name: "Apostolos Kyrgidhs",
      url: "https://www.linkedin.com/in/apostolos-kyrgidis/",
    },
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "CineGame Critic",
    title: "CineGame Critic - Reviews of Movies & Games",
    description:
      "CineGame Critic provides the latest reviews and ratings for movies and video games. Stay updated with our curated reviews from critics.",
    url: "https://www.cinegame-critic.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "CineGame Critic - Reviews of Movies & Games",
    description:
      "CineGame Critic provides the latest reviews and ratings for movies and video games.",
  },
  icons: {
    icon: [
      {
        url: "/assets/images/site-logo-cropped.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/assets/images/site-logo-cropped.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/assets/images/site-logo-cropped.png",
        sizes: "672x672",
        type: "image/png",
      },
    ],
  },
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
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "CineGame Critic",
                url: "https://www.cinegame-critic.com",
                logo: "https://www.cinegame-critic.com/assets/images/site-logo-cropped.png",
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
