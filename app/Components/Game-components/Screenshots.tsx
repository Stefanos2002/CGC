import Image from "next/image";
import { getScreenshots } from "@/app/Game Collection/functions";

const Screenshots = async ({ params }: { params: any }) => {
  const screenshots = await getScreenshots(params.name);

  return (
    <div className="flex w-full flex-col items-center gap-4 px-6 pb-16 pt-4">
      <span className="font-bold text-white text-2xl">Screenshots</span>
      {screenshots && screenshots.length > 0 ? (
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-6xl">
          {screenshots.map((item: any) => (
            <div key={item.id} className="relative w-full aspect-video">
              <Image
                alt={`game_screenshot_${item.id}`}
                src={item.image}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xl text-white text-center">
          No screenshots available.
        </span>
      )}
    </div>
  );
};

export default Screenshots;
