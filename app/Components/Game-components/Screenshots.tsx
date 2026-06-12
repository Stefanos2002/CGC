import { getScreenshots } from "@/app/Game Collection/functions";
import dynamic from "next/dynamic";

const ScreenshotsGallery = dynamic(() => import("./ScreenshotsGallery"), {
  ssr: false,
});

const Screenshots = async ({ params }: { params: any }) => {
  const screenshots = await getScreenshots(params.name);

  return (
    <div className="flex w-full flex-col items-center gap-4 px-6 pb-16 pt-4">
      <span className="font-bold text-white text-2xl">Screenshots</span>
      <ScreenshotsGallery screenshots={screenshots || []} />
    </div>
  );
};

export default Screenshots;
