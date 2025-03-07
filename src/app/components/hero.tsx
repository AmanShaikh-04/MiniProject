"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/app/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const HeroSection = () => {
  const [authLoaded, setAuthLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user role only if auth is loaded and a user is present
  useEffect(() => {
    if (!authLoaded || !user) {
      setUserRole(null);
      return;
    }

    let isMounted = true;
    const fetchUserRole = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (!isMounted) return;
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role || null);
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        // The error likely means a Firestore call was attempted while unauthenticated.
        // Setting role to null avoids further issues.
        setUserRole(null);
      }
    };

    fetchUserRole();
    return () => {
      isMounted = false;
    };
  }, [authLoaded, user]);

  // Set defaults: when no user is logged in, the button shows "LOGIN"
  let redirectUrl = "/login";
  let buttonText = "LOGIN";

  if (user) {
    if (userRole === "student") {
      redirectUrl = "/student-dashboard";
      buttonText = "REGISTER";
    } else if (userRole === "host") {
      redirectUrl = "/event-register";
      buttonText = "REGISTER";
    } else if (userRole === "admin") {
      redirectUrl = "/admin-dashboard";
      buttonText = "REGISTER";
    } else {
      // In case a logged-in user has no role, you could still direct them to login or handle this differently.
      redirectUrl = "/login";
      buttonText = "REGISTER";
    }
  }

  return (
    <section className="bg-background py-16 flex flex-col items-center">
      <div className="container mx-auto px-6 lg:px-12 grid md:grid-cols-2 items-center gap-12">
        {/* Left Section */}
        <div className="text-center px-9 flex flex-col items-center pl-6 md:pl-10">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Student Committee Management System
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-lg text-center">
            A streamlined platform for student enrollment and event
            registration, offering an intuitive interface for seamless
            management, tracking, and engagement.
          </p>
          <div className="mt-8 flex justify-center w-full">
            <Link
              href={redirectUrl}
              className="bg-blue-500 text-white px-8 py-3 rounded-lg shadow-md transition-all duration-300 hover:bg-opacity-90 hover:scale-105 active:scale-95"
            >
              {buttonText}
            </Link>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex justify-center">
          <Image
            src="/assets/aiktclogo1.png"
            alt="AIKTC Logo"
            width={350}
            height={350}
            className="max-w-full h-auto object-contain"
          />
        </div>
      </div>

      {/* Schools Logos Section */}
      <div className="bg-violet-200 rounded-4xl w-full mt-10 py-5 px-6">
        <div className="rounded-lg flex justify-between items-center">
          <Image
            src="/assets/School-of-Arch.png"
            alt="School of Architecture"
            width={280}
            height={100}
            className="h-20 object-contain"
          />
          <Image
            src="/assets/School-of-Engg-logo.png"
            alt="School of Engineering & Technology"
            width={280}
            height={100}
            className="h-20 object-contain"
          />
          <Image
            src="/assets/School-Of-Pharm.png"
            alt="School of Pharmacy"
            width={280}
            height={100}
            className="h-20 object-contain"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
