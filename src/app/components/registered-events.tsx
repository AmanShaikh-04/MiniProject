"use client";

import React, { useState, useEffect, useCallback } from "react";
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

  // Extracted function to fetch registered events.
  const fetchRegisteredEvents = useCallback(async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setEvents([]);
      setLoading(false);
      return;
    }
    try {
      const eventsCollection = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsCollection);
      const registeredEvents: Event[] = [];

      // For each event, check if a registration exists in its "registeredStudents" subcollection.
      for (const eventDoc of eventsSnapshot.docs) {
        if (!auth.currentUser) break; // re-check if user is still logged in
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
  }, []);

  // Listen for auth state changes.
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchRegisteredEvents();
    });
    return () => unsubscribe();
  }, [fetchRegisteredEvents]);

  // Listen for "registrationSuccess" events to refresh the registered events.
  useEffect(() => {
    const handleRegistrationSuccess = () => {
      fetchRegisteredEvents();
    };
    window.addEventListener("registrationSuccess", handleRegistrationSuccess);
    return () =>
      window.removeEventListener(
        "registrationSuccess",
        handleRegistrationSuccess,
      );
  }, [fetchRegisteredEvents]);

  // Open event detail modal by fetching full event details.
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

  // Show only the first 3 events.
  const eventsToShow = events.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        My Registered Events
      </h2>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-gray-500">Loading events...</p>
        </div>
      ) : events.length > 0 ? (
        <>
          <div
            className="space-y-6"
            style={{ maxHeight: "21rem", overflow: "auto" }}
          >
            {eventsToShow.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer"
                onClick={() => openEventDetail(event)}
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md border border-gray-300">
                  <Image
                    src={event.image}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {event.name}
                  </h3>
                  <p className="text-sm text-gray-600">{event.date}</p>
                  <p className="text-sm text-gray-600">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="border border-gray-200 rounded-md p-6">
          <p className="text-gray-500 text-center">
            Registered events will appear here.
          </p>
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
                  className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 cursor-pointer"
                  onClick={() => {
                    openEventDetail(event);
                    setShowAllModal(false);
                  }}
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md border border-gray-300">
                    <Image
                      src={event.image}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600">{event.date}</p>
                    <p className="text-sm text-gray-600">{event.time}</p>
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
                <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl overflow-auto max-h-full">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
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
                  <p className="mb-2 text-gray-700">
                    <span className="font-semibold">Date:</span>{" "}
                    {formatDate(eventDetail.startDate)} -{" "}
                    {formatDate(eventDetail.endDate)}
                  </p>
                  <p className="mb-2 text-gray-700">
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(eventDetail.startTime)}
                  </p>
                  {eventDetail.description && (
                    <p className="mb-4 text-gray-700">
                      {eventDetail.description}
                    </p>
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
            )
          )}
        </>
      )}
    </div>
  );
};

export default RegisteredEvents;
