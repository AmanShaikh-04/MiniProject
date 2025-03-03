// src/app/student-dashboard/page.tsx
import React from "react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import Profile from "../components/profile";
import RegisteredEvents from "../components/registered-events";
import UpcomingEvents from "../components/upcoming-events";

// Sample data
const sampleEvents = [
  { id: "1", name: "Annual Sports Day", date: "March 15", time: "10:00 AM" },
  { id: "2", name: "Coding Competition", date: "March 20", time: "2:00 PM" },
  { id: "3", name: "Cultural Evening", date: "April 5", time: "6:00 PM" },
];

export default function StudentDashboard() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Profile */}
          <div>
            <Profile
              name="John Doe"
              age="21"
              // profileImage="/profile.jpg" // Uncomment and add path when you have actual images
            />
          </div>

          {/* Right Column - Registered Events */}
          <div>
            <RegisteredEvents events={sampleEvents} />
          </div>
        </div>
        <div className="mt-6">
          <UpcomingEvents />
        </div>
      </main>

      <Footer />
    </div>
  );
}
