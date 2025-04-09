"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { auth, db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  createdBy: string;
  status: "upcoming" | "past" | "cancelled";
  imageUrl?: string;
}

interface ListedEventsProps {
  hostId?: string;
  limit?: number;
}

// Define a type for the raw event data from Firestore
interface RawEvent {
  id: string;
  eventName?: string;
  title?: string;
  name?: string;
  eventPlace?: string;
  location?: string;
  venue?: string;
  description?: string;
  desc?: string;
  details?: string;
  createdBy?: string;
  hostId?: string;
  creator?: string;
  status?: string;
  eventStatus?: string;
  coverImage?: string;
  image?: string;
  imageUrl?: string;
  startDate?: any;
  date?: any;
  eventDate?: any;
  scheduledDate?: any;
}

export default function ListedEvents({ hostId, limit = 5 }: ListedEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Helper function to extract a date string from various possible date fields
  const extractDate = (data: RawEvent): string => {
    const dateFields: (keyof RawEvent)[] = [
      "startDate",
      "date",
      "eventDate",
      "scheduledDate",
    ];
    for (const field of dateFields) {
      if (data[field]) {
        const dateValue = data[field];
        if (dateValue && dateValue.seconds) {
          return new Date(dateValue.seconds * 1000).toISOString();
        }
        if (typeof dateValue === "string") {
          try {
            return new Date(dateValue).toISOString();
          } catch (e) {
            // Silent fail
          }
        }
        if (typeof dateValue === "number") {
          return new Date(dateValue).toISOString();
        }
      }
    }
    return "";
  };

  // Fetch events created by the current host
  const fetchEvents = async (currentHostId: string) => {
    try {
      const eventsRef = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsRef);
      const allEventsData = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RawEvent[];

      setRawEvents(allEventsData);

      const processedEvents: Event[] = allEventsData.map((data) => ({
        id: data.id,
        title: data.eventName || data.title || data.name || "Untitled Event",
        date: extractDate(data),
        location: data.eventPlace || data.location || data.venue || "",
        description: data.description || data.desc || data.details || "",
        createdBy: data.createdBy || data.hostId || data.creator || "",
        status: (data.status || data.eventStatus || "upcoming") as
          | "upcoming"
          | "past"
          | "cancelled",
        imageUrl: data.coverImage
          ? data.coverImage.startsWith("data:")
            ? data.coverImage
            : `data:image/png;base64,${data.coverImage}`
          : data.image || data.imageUrl || "/assets/default.jpg",
      }));

      // Filter to only show events created by the current user
      const hostEvents = processedEvents.filter((event) => {
        const eventCreator = String(event.createdBy || "").trim();
        const hostIdToMatch = String(currentHostId || "").trim();

        // Check for exact match
        const isExactMatch = eventCreator === hostIdToMatch;

        // For empty creator fields, consider as not matching
        if (!eventCreator) {
          return false;
        }

        return isExactMatch;
      });

      setEvents(hostEvents);
    } catch (err) {
      setError(
        `Failed to load events: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Wait for authentication and fetch events
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);

        // Use the current user ID, ignoring any hostId prop
        const actualHostId = user.uid;

        fetchEvents(actualHostId);
      } else {
        setLoading(false);
        setError("You must be logged in to view your events");
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, [hostId]);

  const displayedEvents = showAll ? events : events.slice(0, limit);

  const openEventDetail = (event: Event) => {
    setSelectedEvent(event);
    setEventDetail(null);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setEventDetail(null);
  };

  // Render a single event card with updated styling and modal trigger.
  const renderEvent = (event: Event) => (
    <div
      key={event.id}
      onClick={() => openEventDetail(event)}
      className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer"
    >
      <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md border border-gray-300">
        <Image
          src={event.imageUrl || "/assets/default.jpg"}
          alt={event.title}
          unoptimized
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-800">{event.title}</h3>
        <p className="text-sm text-gray-600">
          {event.date
            ? new Date(event.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "No date available"}
        </p>
        <p className="text-sm text-gray-600">{event.location}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          My Listed Events
        </h2>
        <p className="text-gray-500">Loading events...</p>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          My Listed Events
        </h2>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {displayedEvents.length > 0 ? (
          <div
            className="space-y-6"
            style={{ maxHeight: "calc(3 * 7rem)", overflowY: "auto" }}
          >
            {displayedEvents.map((event) => renderEvent(event))}
          </div>
        ) : (
          <div className="border border-gray-200 rounded-md p-6">
            <p className="text-gray-500 text-center">No events listed yet</p>
          </div>
        )}

        {events.length > limit && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              {showAll ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>

      {/* Modal for displaying event details */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={closeEventDetail}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl overflow-auto max-h-full">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedEvent.title}
            </h3>
            {(eventDetail?.coverImage || selectedEvent.imageUrl) && (
              <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden shadow-md">
                <Image
                  src={
                    eventDetail?.coverImage
                      ? eventDetail.coverImage.startsWith("data:")
                        ? eventDetail.coverImage
                        : `data:image/png;base64,${eventDetail.coverImage}`
                      : selectedEvent.imageUrl || "/assets/default.jpg"
                  }
                  alt={selectedEvent.title}
                  unoptimized
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="mb-2 text-gray-700">
              <span className="font-semibold">Date:</span>{" "}
              {selectedEvent.date
                ? new Date(selectedEvent.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "No date available"}
            </p>
            <p className="mb-2 text-gray-700">
              <span className="font-semibold">Location:</span>{" "}
              {selectedEvent.location}
            </p>
            {selectedEvent.description && (
              <p className="mb-4 text-gray-700">{selectedEvent.description}</p>
            )}
            <div className="text-right">
              <button
                onClick={closeEventDetail}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
