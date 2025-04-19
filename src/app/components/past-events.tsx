import React from "react";
import { Calendar, Clock } from "lucide-react";

const PastEvents = () => {
  const events = [
    {
      id: 1,
      title: "Bonhomie 2025",
      description: "Sports event uniting student's to show their talent.",
      date: "2024-02-15",
      image: "/assets/1.jpg",
    },
    {
      id: 2,
      title: "Algorithm 9.0",
      description: "32 Hours coding event for students.",
      date: "2024-02-10",
      image: "/assets/10.jpg",
    },
    {
      id: 3,
      title: "Parade",
      description: "March Parade of students to display unity.",
      date: "2024-02-05",
      image: "/assets/4.jpg",
    },
    {
      id: 4,
      title: "Git & Github",
      description: "Event to educate students about software's.",
      date: "2024-02-01",
      image: "/assets/3.jpg",
    },
  ];

  // Helper function to format date with proper type annotation
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full p-8 bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-12">
          <div className="w-2 h-8 bg-indigo-600 rounded-full mr-3"></div>
          <h2 className="text-3xl font-bold text-gray-800">Past Events</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="group transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image Circle */}
              <div className="relative flex justify-center">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-lg z-10 bg-indigo-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <img
                    src={event.image}
                    alt={`${event.title} image`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-2xl shadow-md p-6 pt-16 -mt-14 relative z-0 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="flex items-center text-indigo-600 text-sm">
                    <Calendar size={16} className="mr-1" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <button className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium hover:bg-indigo-700 transition-colors duration-300 w-full max-w-xs">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PastEvents;
