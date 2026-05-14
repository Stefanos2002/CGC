import { Manrope } from "next/font/google";

const manrope = Manrope({ subsets: ["latin"] });

export default function GamesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={manrope.className}>{children}</div>;
}
