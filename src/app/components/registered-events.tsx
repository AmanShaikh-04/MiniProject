// components/RegisteredEvents.tsx
import React from "react";
import Image from "next/image";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  image?: string;
}

interface RegisteredEventsProps {
  events: Event[];
}

const RegisteredEvents: React.FC<RegisteredEventsProps> = ({ events = [] }) => {
  return (
    <div className="mt-8 p-6 bg-gray-100 text-gray-900 rounded-2xl shadow-lg border border-gray-300">
      <h2 className="text-xl font-bold border-b-4 border-indigo-500 pb-2 mb-6 uppercase tracking-wider">
        My Registered Events
      </h2>

      <div className="space-y-6">
        {events.length > 0
          ? events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-6 p-4 bg-indigo-100 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-indigo-300"
              >
                <div className="relative w-20 h-20 rounded-full bg-indigo-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-indigo-500">
                  <Image
                    src="/assets/aiktclogo1.png"
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 bg-indigo-400 p-4 rounded-lg shadow-inner text-white">
                  <div className="text-lg font-semibold tracking-wide">
                    {event.name}
                  </div>
                  <div className="text-sm text-white/80 font-light">
                    {event.date} | {event.time}
                  </div>
                </div>
              </div>
            ))
          : Array.from({ length: 3 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="flex items-center gap-6 p-4 bg-indigo-100 rounded-xl shadow-md animate-pulse border border-indigo-300"
              >
                <div className="relative w-20 h-20 rounded-full bg-indigo-300 flex items-center justify-center flex-shrink-0 border border-indigo-500">
                  <Image
                    src="/assets/aiktclogo1.png"
                    alt="Placeholder"
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 bg-indigo-500 p-4 rounded-lg text-white">
                  <div className="h-5 bg-indigo-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-indigo-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default RegisteredEvents;
