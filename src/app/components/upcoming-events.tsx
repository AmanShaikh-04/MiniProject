import React from "react";
import Image from "next/image";
import Link from "next/link";

const UpcomingEventsSection = () => {
  // Sample upcoming events data
  const upcomingEvents = [
    {
      id: 1,
      title: "Spring Orientation",
      description:
        "Welcome event for new students with campus tours, information sessions, and networking opportunities.",
    },
    {
      id: 2,
      title: "Research Symposium",
      description:
        "Annual showcase of student and faculty research projects across all departments.",
    },
    {
      id: 3,
      title: "Industry Panel Discussion",
      description:
        "Q&A session with industry leaders discussing career paths and emerging trends.",
    },
    {
      id: 4,
      title: "Cultural Festival",
      description:
        "Celebration of diversity featuring performances, food, and interactive cultural exhibits.",
    },
  ];

  return (
    <section className="bg-background py-12">
      <div className="container mx-auto px-25">
        <h2 className="text-3xl font-bold text-left text-gray-800 mb-8">
          Upcoming Events
        </h2>

        <div className="space-y-8">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 flex flex-col md:flex-row items-start md:items-center"
            >
              {/* Event Image */}
              <div className="w-32 h-32 flex-shrink-0 overflow-hidden rounded-lg border border-gray-300 mr-6">
                <Image
                  src="/assets/aiktclogo1.png"
                  alt="Event"
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>

              {/* Event Description */}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-700 mb-4">{event.description}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-2 mt-4 md:mt-0 md:ml-4">
                <button className="bg-gray-800 text-white rounded px-6 py-2 text-sm hover:bg-gray-900 transition duration-300">
                  Details
                </button>
                <button className="bg-blue-600 text-white rounded px-6 py-2 text-sm hover:bg-blue-700 transition duration-300">
                  Register
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
