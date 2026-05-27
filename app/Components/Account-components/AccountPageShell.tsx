import Link from "next/link";
import UserOptions from "./UserOptions";
import Footer from "../Footer";

interface Props {
  show: boolean;
  isLoaded: boolean;
  maxWidth?: string;
  children: React.ReactNode;
}

const AccountPageShell = ({
  show,
  isLoaded,
  maxWidth = "max-w-2xl",
  children,
}: Props) => (
  <div className="min-h-screen back-img flex flex-col items-center">
    <div className="w-full px-4 pt-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors duration-200 text-sm"
      >
        ← Home
      </Link>
    </div>
    {show && (
      <div className="w-full px-4 mt-6 mb-12">
        <div
          className={`${maxWidth} mx-auto flex sm:flex-row flex-col rounded-2xl shadow-2xl bg-[#13131f]/80 backdrop-blur-sm border border-white/10 overflow-hidden`}
        >
          <UserOptions />
          <div className="flex flex-col items-center px-6 sm:px-8 py-8 flex-1 min-w-0">
            {children}
          </div>
        </div>
      </div>
    )}
    {isLoaded && <Footer />}
  </div>
);

export default AccountPageShell;
