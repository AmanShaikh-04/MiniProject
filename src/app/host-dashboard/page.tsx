"use client";

import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import HostProfile from "../components/host-profile";
import RegisteredEvents from "../components/registered-events";
import ListedEvents from "../components/listed-events";
import UpcomingEvents from "../components/upcoming-events";
import PastEvents from "../components/past-events";
import Payment from "../components/payment";

export default function HostDashboardPage() {
  // Mock user state - replace with actual authentication later
  const [isAuthenticated] = useState(true);
  const [currentUserId] = useState("user-123");
  const [loading] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Please log in to view your dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Host Profile */}
          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <HostProfile />
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <Payment />
          </div>

          {/* Registered Events */}
          <div>
            <RegisteredEvents />
          </div>

          {/* Listed Events */}
          <div>
            <ListedEvents hostId={currentUserId} limit={3} />
          </div>
        </div>

        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <UpcomingEvents />
        </div>

        <div className="mt-8 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
          <PastEvents />
        </div>
      </main>
      <Footer />
    </div>
  );
}
