"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-accent shadow-md py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <div className="border border-gray-300 rounded-md p-2">
              <span className="font-bold text-gray-700">LOGO</span>
            </div>
          </Link>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link href="/" className="text-gray-700 hover:text-gray-900">
            Home
          </Link>
          <Link href="/about-us" className="text-gray-700 hover:text-gray-900">
            About Us
          </Link>
          <Link href="/events" className="text-gray-700 hover:text-gray-900">
            Events
          </Link>
          <Link href="/login" className="text-gray-700 hover:text-gray-900">
            Login
          </Link>
          <Link
            href="/contact-us"
            className="text-gray-700 hover:text-gray-900"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container mx-auto px-4 pt-2 pb-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about-us"
              className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/events"
              className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Events
            </Link>
            <Link
              href="/login"
              className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/contact-us"
              className="block text-gray-700 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
