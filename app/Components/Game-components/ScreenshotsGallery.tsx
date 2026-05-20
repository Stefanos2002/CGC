"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { GrPrevious, GrNext } from "react-icons/gr";

interface Screenshot {
  id: number;
  image: string;
}

interface ScreenshotsArray {
  screenshots: Screenshot[];
}

const ScreenshotsGallery = ({ screenshots }: ScreenshotsArray) => {
  const [openModal, setOpenModal] = useState<Boolean>(false);
  const [index, setIndex] = useState<number>(0);
  const [selectedImg, setSelectedImg] = useState<string>(screenshots[0].image);

  const handleOpen = (index: number) => {
    setIndex(index);
    setOpenModal(true);
    setSelectedImg(screenshots[index]?.image);
  };
  const handleClose = () => {
    setOpenModal(false);
  };

  const handleNext = () => {
    const newIndex = (index + 1) % screenshots.length;
    setIndex(newIndex);
    setSelectedImg(screenshots[newIndex]?.image);
  };

  const handlePrevious = () => {
    const newIndex = (index - 1 + screenshots.length) % screenshots.length;
    setIndex(newIndex);
    setSelectedImg(screenshots[newIndex]?.image);
  };

  useEffect(() => {
    if (openModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [openModal]);
  return (
    <>
      {screenshots && screenshots.length > 0 ? (
        <div className="grid grid-cols-1 min-[500px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 w-full max-w-6xl">
          {screenshots.map((item: any, idx: number) => (
            <div
              key={item.id}
              onClick={() => handleOpen(idx)}
              className="relative transition-all duration-200 hover:scale-105 cursor-pointer w-full aspect-video"
            >
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
      {openModal ? (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center gap-10 p-4">
          <button
            onClick={handleClose}
            className="absolute top-10 right-10 text-white text-3xl"
          >
            X
          </button>
          <button className="text-white text-2xl">
            <GrPrevious onClick={handlePrevious} />
          </button>
          <div>
            <Image
              alt={`screenshot-${index}`}
              src={selectedImg || screenshots[0].image}
              width={650}
              height={650}
            />
          </div>

          <button className="text-white text-2xl">
            <GrNext onClick={handleNext} />
          </button>
        </div>
      ) : (
        <div className="hidden"></div>
      )}
    </>
  );
};

export default ScreenshotsGallery;
