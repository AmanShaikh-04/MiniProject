// components/Profile.tsx
import React from "react";
import Link from "next/link";
import Image from "next/image";

interface ProfileProps {
  name?: string;
  age?: string;
  profileImage?: string;
}

const Profile: React.FC<ProfileProps> = ({
  name = "",
  age = "",
  profileImage = "/assets/logo.jpg",
}) => {
  return (
    <div className="mt-8 p-8 bg-gray-100 text-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-auto border border-gray-300">
      <div className="flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="relative w-36 h-36 rounded-full bg-indigo-300 flex items-center justify-center overflow-hidden shadow-lg border-4 border-indigo-500">
          <Image
            src={profileImage}
            alt="Profile"
            fill
            className="object-cover"
          />
        </div>

        {/* Profile Info */}
        <div className="mt-6 w-full">
          <div className="bg-indigo-100 p-4 rounded-lg shadow-md text-left border border-indigo-300">
            <div className="mb-4">
              <label className="block text-indigo-500 uppercase text-sm mb-1">
                Name:
              </label>
              <div className="border-b border-indigo-400 pb-1 text-lg font-semibold tracking-wide">
                {name || "—————————"}
              </div>
            </div>
            <div>
              <label className="block text-indigo-500 uppercase text-sm mb-1">
                Age:
              </label>
              <div className="border-b border-indigo-400 pb-1 text-lg font-semibold tracking-wide">
                {age || "—————————"}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 text-indigo-500 font-semibold text-sm tracking-wider">
          Student Committee Management System
        </div>

        <Link
          href="/profile/detail"
          className="mt-6 inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-transform transform hover:scale-105"
        >
          VIEW DETAILS
        </Link>
      </div>
    </div>
  );
};

export default Profile;
