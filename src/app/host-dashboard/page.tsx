"use client";

import React, { useState } from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import HostProfile from "../components/host-profile";
import RegisteredEvents from "../components/registered-events";
import ListedEvents from "../components/listed-events";
import UpcomingEvents from "../components/upcoming-events";
import PastEvents from "../components/past-events";

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column - Host Profile */}
          <div>
            <HostProfile />
          </div>
          {/* Right Column - Listed Events */}
          <div className="col-span-2">
            <ListedEvents hostId={currentUserId} limit={3} />
          </div>
        </div>
        <div className="mt-6">
          <RegisteredEvents />
        </div>
        <div className="mt-6">
          <UpcomingEvents />
        </div>
        <div className="mt-6">
          <PastEvents />
        </div>
      </main>
      <Footer />
    </div>
  );
}
