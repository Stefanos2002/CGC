/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.cinegame-critic.com",
  generateRobotsTxt: true,
  exclude: [
    "/api/*",
    "/Authentication/*",
    "/Account/*",
    "/Verified",
    "/Games/construction",
  ],
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 5000,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/api/", "/Account/", "/Authentication/"] },
    ],
  },
  additionalPaths: async (config) => [
    // Movies
    { loc: "/Movies/Movies-trending", changefreq: "daily", priority: 0.9 },
    { loc: "/Movies/moviePage/1", changefreq: "daily", priority: 0.8 },
    { loc: "/Movies/moviePage/2", changefreq: "daily", priority: 0.7 },
    { loc: "/Movies/moviePage/3", changefreq: "daily", priority: 0.7 },
    { loc: "/Movies/Upcoming-Movies/1", changefreq: "weekly", priority: 0.7 },
    // TV Shows
    { loc: "/Movies/TVShows/Trending", changefreq: "daily", priority: 0.9 },
    { loc: "/Movies/TVShows/TVShowsPage/1", changefreq: "daily", priority: 0.8 },
    { loc: "/Movies/TVShows/TVShowsPage/2", changefreq: "daily", priority: 0.7 },
    { loc: "/Movies/TVShows/Upcoming-tvshows/1", changefreq: "weekly", priority: 0.7 },
    // Games listing pages
    { loc: "/Games/page/1", changefreq: "weekly", priority: 0.8 },
    { loc: "/Games/page/2", changefreq: "weekly", priority: 0.7 },
    { loc: "/Games/page/3", changefreq: "weekly", priority: 0.7 },
  ],
};
