"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

const images: string[] = [
  "/assets/1.jpg",
  "/assets/2.png",
  "/assets/3.png",
  "/assets/4.jpg",
  "/assets/5.jpg",
  "/assets/6.jpg",
  "/assets/7.png",
  "/assets/8.jpg",
  "/assets/9.jpg",
  "/assets/10.jpg",
];

const totalImages = images.length;

const GallerySection = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lastInteractionTime, setLastInteractionTime] = useState<number>(
    Date.now(),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - lastInteractionTime >= 2000) {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [lastInteractionTime]);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLastInteractionTime(Date.now());
  };

  return (
    <section className="bg-background py-16 px-6">
      <div className="container mx-auto max-w-6xl relative">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Gallery
        </h2>

        <div className="relative flex items-center justify-center h-[70vh] overflow-hidden">
          {images.map((image, index: number) => {
            const isActive = index === currentIndex;
            const leftStack = [
              (currentIndex - 2 + totalImages) % totalImages,
              (currentIndex - 1 + totalImages) % totalImages,
            ];
            const rightStack = [
              (currentIndex + 1) % totalImages,
              (currentIndex + 2) % totalImages,
            ];

            let positionX = 0;
            let zIndex = 5;
            let scale = 0.8;
            let opacity = 1;

            if (index === leftStack[0]) {
              positionX = -300;
              zIndex = 10;
              scale = 0.85;
              opacity = 0.9;
            }
            if (index === leftStack[1]) {
              positionX = -150;
              zIndex = 15;
              scale = 0.9;
              opacity = 0.95;
            }
            if (index === rightStack[0]) {
              positionX = 150;
              zIndex = 15;
              scale = 0.9;
              opacity = 0.95;
            }
            if (index === rightStack[1]) {
              positionX = 300;
              zIndex = 10;
              scale = 0.85;
              opacity = 0.9;
            }
            if (isActive) {
              positionX = 0;
              scale = 1;
              zIndex = 20;
              opacity = 1;
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity, scale, x: positionX, zIndex }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 1,
                }}
                className="absolute h-[70%] w-[70%] rounded-lg shadow-lg flex items-center justify-center  cursor-pointer"
                style={{ zIndex }}
                onClick={() => handleImageClick(index)}
              >
                <Image
                  src={image}
                  alt={`Gallery Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
