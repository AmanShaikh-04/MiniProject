"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "John Doe",
      role: "Student, Engineering",
      quote:
        "The student committee has been instrumental in enhancing my university experience. The events they organize are both educational and entertaining.",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Student, Architecture",
      quote:
        "As a first-year student, the committee helped me connect with peers and resources that made my transition to university life much smoother.",
    },
    {
      id: 3,
      name: "Alex Johnson",
      role: "Student, Pharmacy",
      quote:
        "The workshops organized by the committee have provided practical skills that complement our academic curriculum perfectly.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to start the interval
  const startAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current); // Clear existing interval
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 5000);
  };

  // Restart the timer whenever a new testimonial is selected
  const handleTestimonialChange = (index: number) => {
    setCurrentIndex(index);
    startAutoSlide();
  };

  useEffect(() => {
    startAutoSlide(); // Start auto-slide on mount

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="bg-background pb-16 flex justify-center items-center">
      <div className="max-w-7xl flex flex-col md:flex-row items-center md:items-start gap-18">
        {/* Left Side - Testimonials */}
        <div className="md:w-[65%] flex flex-col items-start">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTestimonial.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="w-full rounded-2xl p-8 shadow-2xl bg-white flex items-center"
            >
              {/* Profile Image */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-gray-300">
                  <Image
                    src="/assets/aiktclogo1.png"
                    alt="Profile Image"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* Text Content */}
              <div className="ml-6">
                <p className="text-xl font-semibold text-gray-800">
                  {currentTestimonial.name}
                </p>
                <p className="text-md text-gray-500">
                  {currentTestimonial.role}
                </p>
                <motion.p
                  key={currentTestimonial.quote}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-4 text-gray-700 italic leading-relaxed text-lg"
                >
                  "{currentTestimonial.quote}"
                </motion.p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Dots - Timer Restarts on Click */}
          <div className="mt-6 flex justify-center w-full gap-3">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => handleTestimonialChange(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-gray-800 scale-125"
                    : "bg-gray-400"
                }`}
                whileHover={{ scale: 1.3 }}
                aria-label={`Go to testimonial ${index + 1}`}
              ></motion.button>
            ))}
          </div>
        </div>

        {/* Right Side - Centered "Our Testimonials" Text */}
        <div className="md:w-[35%] flex flex-col items-center justify-center text-center h-full mt-12">
          <div className="flex flex-col items-center">
            <h2 className="text-4xl font-bold text-gray-900">
              Our Testimonials
            </h2>
            <p className="text-gray-600 mt-3 text-lg max-w-md">
              Hear from students who have benefited from our events and
              community!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
