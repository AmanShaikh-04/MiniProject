"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  hostId: string;
  imageUrl?: string;
}

interface PastEventsProps {
  hostId?: string; // Optional: if not provided, will use current user
  initialLimit?: number;
}

export default function PastEvents({
  hostId,
  initialLimit = 4,
}: PastEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [displayLimit, setDisplayLimit] = useState(initialLimit);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // This is a mock function to simulate data fetching
    // Replace with actual data fetching logic later
    const fetchPastEvents = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 700));

        // Mock data - will be replaced with actual API call
        const mockEvents: Event[] = [
          {
            id: "1",
            title: "Annual Conference 2024",
            date: "2024-09-15",
            location: "Chicago, IL",
            description: "Annual industry conference",
            hostId: hostId || "current-user",
            imageUrl: "/placeholder-event.jpg",
          },
          {
            id: "2",
            title: "Summer Workshop",
            date: "2024-07-20",
            location: "Boston, MA",
            description: "Summer training workshop",
            hostId: hostId || "current-user",
            imageUrl: "/placeholder-event.jpg",
          },
          {
            id: "3",
            title: "Spring Networking",
            date: "2024-05-10",
            location: "Seattle, WA",
            description: "Spring networking event",
            hostId: hostId || "current-user",
            imageUrl: "/placeholder-event.jpg",
          },
          {
            id: "4",
            title: "Winter Retreat",
            date: "2024-02-15",
            location: "Denver, CO",
            description: "Winter team retreat",
            hostId: hostId || "current-user",
            imageUrl: "/placeholder-event.jpg",
          },
        ];

        setEvents(mockEvents);
        setHasMore(mockEvents.length > initialLimit);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching past events:", err);
        setError("Failed to load past events");
        setLoading(false);
      }
    };

    fetchPastEvents();
  }, [hostId, initialLimit]);

  const loadMore = () => {
    setDisplayLimit((prev) => prev + initialLimit);
  };

  const displayedEvents = events.slice(0, displayLimit);

  if (loading && events.length === 0) {
    return (
      <div className="border border-gray-300 rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Past Events:</h2>
        <div className="flex justify-center items-center h-48">
          <p>Loading past events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-gray-300 rounded-md p-6">
        <h2 className="text-xl font-semibold mb-4">My Past Events:</h2>
        <div className="flex justify-center items-center h-48">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md p-6">
      <h2 className="text-xl font-semibold mb-4">My Past Events:</h2>

      {displayedEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {displayedEvents.map((event) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-yellow-200 rounded-full mb-2 overflow-hidden">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-yellow-800">Event</span>
                      </div>
                    )}
                  </div>
                  <div className="border border-gray-300 rounded-md p-4 w-full hover:bg-gray-50 transition">
                    <h3 className="font-medium text-center truncate">
                      {event.title}
                    </h3>
                    <p className="text-sm text-center text-gray-600">
                      {new Date(event.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {hasMore && displayLimit < events.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={loadMore}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Show More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="border border-gray-300 rounded-md p-4">
          <p className="text-gray-500 text-center">No past events</p>
        </div>
      )}
    </div>
  );
}
