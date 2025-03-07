"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { auth, db } from "@/app/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  image: string;
}

const RegisteredEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllModal, setShowAllModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventDetail, setEventDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Helper to format Firestore timestamps or date strings.
  const formatDate = (dateValue: any): string => {
    if (!dateValue) return "";
    const dateObj = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return dateObj.toLocaleDateString([], {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeValue: any): string => {
    if (!timeValue) return "";
    const dateObj = timeValue.toDate ? timeValue.toDate() : new Date(timeValue);
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      // Get the current user once at the start.
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setEvents([]);
        setLoading(false);
        return;
      }
      try {
        // Fetch all events from the "events" collection.
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const registeredEvents: Event[] = [];

        // For each event, check if a registration exists in its "registeredStudents" subcollection.
        for (const eventDoc of eventsSnapshot.docs) {
          // Re-check if user is still logged in before proceeding.
          if (!auth.currentUser) break;

          const eventId = eventDoc.id;
          const regDocRef = doc(
            db,
            "events",
            eventId,
            "registeredStudents",
            currentUser.uid,
          );
          const regDocSnap = await getDoc(regDocRef);
          if (regDocSnap.exists()) {
            const eventData = eventDoc.data();
            registeredEvents.push({
              id: eventId,
              name: eventData.eventName || "Unnamed Event",
              date: formatDate(eventData.startDate),
              time: formatTime(eventData.startTime),
              image: eventData.coverImage || "/assets/aiktclogo1.png",
            });
          }
        }
        setEvents(registeredEvents);
      } catch (error) {
        console.error("Error fetching registered events:", error);
      }
      setLoading(false);
    };

    // Listen for auth state changes to ensure a user is logged in.
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchRegisteredEvents();
    });
    return () => unsubscribe();
  }, []);

  // Open event detail modal by fetching full event details from Firestore.
  const openEventDetail = async (event: Event) => {
    setSelectedEvent(event);
    setDetailLoading(true);
    try {
      const eventRef = doc(db, "events", event.id);
      const eventSnap = await getDoc(eventRef);
      if (eventSnap.exists()) {
        setEventDetail(eventSnap.data());
      }
    } catch (error) {
      console.error("Error fetching event detail:", error);
    }
    setDetailLoading(false);
  };

  const closeEventDetail = () => {
    setSelectedEvent(null);
    setEventDetail(null);
  };

  // Show only the first 3 events in the fixed container.
  const eventsToShow = events.slice(0, 3);

  return (
    <div className="mt-8 p-6 bg-gray-100 text-gray-900 rounded-2xl shadow-lg border border-gray-300">
      <h2 className="text-xl font-bold border-b-4 border-indigo-500 pb-2 mb-6 uppercase tracking-wider">
        My Registered Events
      </h2>

      {loading ? (
        <div>Loading...</div>
      ) : events.length > 0 ? (
        <>
          {/* Fixed-height container (max 3 events) */}
          <div
            className="space-y-6"
            style={{ maxHeight: "calc(3 * 7rem)", overflow: "hidden" }}
          >
            {eventsToShow.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-6 p-4 bg-indigo-100 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-indigo-300 cursor-pointer"
                onClick={() => openEventDetail(event)}
              >
                <div className="relative w-20 h-20 rounded-full bg-indigo-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-indigo-500">
                  <Image
                    src={event.image}
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
            ))}
          </div>

          {/* Show All button if there are more than 3 events */}
          {events.length > 3 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Show All
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-600">
          Registered events will appear here.
        </div>
      )}

      {/* Modal for "Show All" registered events */}
      {showAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setShowAllModal(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl overflow-auto max-h-full">
            <h3 className="text-2xl font-bold mb-4">All Registered Events</h3>
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-6 p-4 bg-indigo-100 rounded-xl shadow-md hover:shadow-xl transition duration-300 border border-indigo-300 cursor-pointer"
                  onClick={() => {
                    openEventDetail(event);
                    setShowAllModal(false);
                  }}
                >
                  <div className="relative w-20 h-20 rounded-full bg-indigo-300 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-indigo-500">
                    <Image
                      src={event.image}
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
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllModal(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Event Detail */}
      {selectedEvent && (
        <>
          {detailLoading ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                Loading event details...
              </div>
            </div>
          ) : (
            eventDetail && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                  className="absolute inset-0 bg-black opacity-50"
                  onClick={closeEventDetail}
                ></div>
                <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl overflow-auto max-h-full">
                  <h3 className="text-2xl font-bold mb-4">
                    {eventDetail.eventName}
                  </h3>
                  {eventDetail.coverImage && (
                    <div className="relative w-full h-64 mb-4">
                      <Image
                        src={eventDetail.coverImage}
                        alt={eventDetail.eventName}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  )}
                  <p className="mb-2">
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(eventDetail.startDate)} -{" "}
                    {formatDate(eventDetail.endDate)}
                  </p>
                  <p className="mb-2">
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(eventDetail.startTime)}
                  </p>
                  {eventDetail.description && (
                    <p className="mb-4">{eventDetail.description}</p>
                  )}
                  <div className="text-right">
                    <button
                      onClick={closeEventDetail}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredEvents;
