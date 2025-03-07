"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/firebase";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
      // Redirect to homepage ("/") after logout.
      router.push("/");
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  // Updated navigation links with "Contact Us" coming before "Login"/"Logout".
  const desktopMenuItems = [
    { href: "/", label: "Home" },
    { href: "/#about-us", label: "About Us" },
    { href: "/#upcoming-events", label: "Events" },
    { href: "/#faq", label: "Contact Us" },
    user
      ? { label: "Logout", onClick: () => setShowLogoutModal(true) }
      : { href: "/login", label: "Login" },
  ];

  const mobileMenuItems = [
    { href: "/", label: "Home" },
    { href: "/#about-us", label: "About Us" },
    { href: "/#upcoming-events", label: "Events" },
    { href: "/#faq", label: "Contact Us" },
    user
      ? {
          label: "Logout",
          onClick: () => {
            setShowLogoutModal(true);
            setIsMenuOpen(false);
          },
        }
      : { href: "/login", label: "Login" },
  ];

  return (
    <>
      <nav className="bg-violet-300 shadow-md py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/logo.png"
              alt="AIKTC Logo"
              width={50}
              height={50}
              className="rounded-md ml-6 cursor-pointer transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <div className="hidden md:flex space-x-6">
            {desktopMenuItems.map((item) =>
              item.onClick ? (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="text-gray-700 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-violet-500"
                >
                  {item.label}
                </button>
              ) : (
                <Link
                  key={item.href}
                  href={item.href!}
                  className="text-gray-700 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md hover:bg-violet-500"
                >
                  {item.label}
                </Link>
              ),
            )}
          </div>
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
        {isMenuOpen && (
          <div className="md:hidden bg-violet-200">
            <div className="container mx-auto px-4 py-4 space-y-3">
              {mobileMenuItems.map((item) =>
                item.onClick ? (
                  <button
                    key={item.label}
                    onClick={() => {
                      item.onClick!();
                      setIsMenuOpen(false);
                    }}
                    className="block text-gray-700 hover:text-white hover:bg-violet-500 transition-colors duration-300 px-3 py-2 rounded-md"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className="block text-gray-700 hover:text-white hover:bg-violet-500 transition-colors duration-300 px-3 py-2 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          {/* Modal content */}
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-700">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
