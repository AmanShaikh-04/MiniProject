import React from "react";
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
    <section className="bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start">
          {/* Left Section - Title and About */}
          <div className="w-full md:w-1/2 text-center">
            <h1 className=" text-7xl font font-heading my-15">
              Student Committee Management System
            </h1>

            {/* About Us Box */}

            <h2 className=" text-2xl font-semibold font-body mb-12 mx-6">
              Student Committee Management System is a streamlined platform for
              student enrollment and event registration, offering an intuitive
              interface for seamless management, tracking, and engagement.
            </h2>

            {/* Login Button */}
            <div className="flex justify-center">
              <Link
                href="/login"
                className="inline-block bg-primary border border-gray-300 rounded px-8 py-2 text-gray-700 font-button font-bold
               transition-transform duration-300 ease-in-out 
               hover:scale-105 hover:shadow-lg hover:text-white active:scale-95"
              >
                Login
              </Link>
            </div>
          </div>

          {/* Right Section - Image Placeholder */}
          <div className="w-full md:w-1/2">
            <div className="rounded-lg flex items-center justify-center">
              <Image
                src="/assets/aiktclogo1.png"
                alt="AIKTC Logo"
                width={500}
                height={500}
                className="h-full object-contain"
              />
            </div>
          </div>
        </div>

        {/* Schools */}

        <div className="bg-accent rounded-4xl w-full mt-20">
          <div className="rounded-lg flex justify-evenly p-5 h-38 ">
            <Image
              src="/assets/School-of-Arch.png"
              alt="AIKTC Logo"
              width={300}
              height={100}
              className="h-full object-contain"
            />
            <Image
              src="/assets/School-of-Engg-logo.png"
              alt="AIKTC Logo"
              width={300}
              height={100}
              className="h-full object-contain"
            />
            <Image
              src="/assets/School-Of-Pharm.png"
              alt="AIKTC Logo"
              width={300}
              height={100}
              className="h-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
