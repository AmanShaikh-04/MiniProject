"use client";

import React, { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";
import Image from "next/image";

interface Event {
  id: string;
  eventName: string;
  organisingCommittee: string;
  eventPlace?: string;
  description?: string;
  startDate?: any;
  endDate?: any;
  coverImage?: string;
  registrationFee?: string;
}

interface HostEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HostEventsModal: React.FC<HostEventsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchHostEvents();
    }
  }, [isOpen]);

  const fetchHostEvents = async () => {
    if (!auth.currentUser) return;

    try {
      const eventsRef = collection(db, "events");
      const q = query(
        eventsRef,
        where("createdBy", "==", auth.currentUser.uid),
      );
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Event[];
      setEvents(eventsList);
    } catch (error) {
      console.error("Error fetching host events:", error);
    }
  };

  const handleDeleteClick = (event: Event) => {
    setSelectedEvent(event);
    setError("");
    setPassword("");
    setIsDeleting(true);
    setShowDetails(false); // Close details view if open
  };

  const handleDetailsClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from bubbling up to parent
    setSelectedEvent(event);
    setIsDeleting(false); // Close delete confirmation if open
    setShowDetails(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent || !auth.currentUser) return;

    // Determine authentication method upfront
    const isGoogleUser = auth.currentUser.providerData.some(
      (provider) => provider.providerId === "google.com",
    );

    try {
      if (isGoogleUser) {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(auth.currentUser, googleProvider);
      } else {
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email!,
          password,
        );
        await reauthenticateWithCredential(auth.currentUser, credential);
      }

      // Delete event
      await deleteDoc(doc(db, "events", selectedEvent.id));

      // Update events list
      setEvents(events.filter((e) => e.id !== selectedEvent.id));
      setSelectedEvent(null);
      setIsDeleting(false);
      setShowDetails(false);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      setError(
        isGoogleUser
          ? "Google reauthentication failed. Please try again."
          : "Incorrect password. Please try again.",
      );
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const dateObj = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return dateObj.toLocaleDateString("en-GB");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-4">
        <button
          onClick={() => {
            setSelectedEvent(null);
            setIsDeleting(false);
            setShowDetails(false);
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Events</h2>

        {isDeleting && selectedEvent ? (
          <div className="p-6 bg-white rounded-lg">
            <h3 className="text-xl font-semibold mb-4">
              Delete {selectedEvent.eventName}?
            </h3>
            <p className="text-gray-600 mb-4">
              Please confirm your password to delete this event.
            </p>
            {!auth.currentUser?.providerData.some(
              (provider) => provider.providerId === "google.com",
            ) && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-2 border rounded-lg mb-4"
              />
            )}
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setSelectedEvent(null);
                  setIsDeleting(false);
                  setShowDetails(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Event
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden shadow-md border border-gray-300">
                  <img
                    src={event.coverImage || "/assets/aiktclogo1.png"}
                    alt={event.eventName}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">
                    {event.eventName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {event.organisingCommittee}
                  </p>
                  <p className="text-sm text-gray-600">{event.eventPlace}</p>
                  <div className="text-sm text-gray-500">
                    <p>Start: {formatDate(event.startDate)}</p>
                    <p>End: {formatDate(event.endDate)}</p>
                  </div>
                  {event.registrationFee && (
                    <p className="text-sm font-medium text-indigo-600 mt-2">
                      Registration Fee: ₹{event.registrationFee}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={(e) => handleDetailsClick(event, e)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleDeleteClick(event)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      {showDetails && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {selectedEvent.eventName} Details
            </h3>
            <div className="space-y-4">
              {selectedEvent.coverImage && (
                <div className="w-full aspect-video relative rounded-xl overflow-hidden border border-gray-100 shadow-md mb-4">
                  <img
                    src={selectedEvent.coverImage}
                    alt={selectedEvent.eventName}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <p className="text-gray-600">
                <span className="font-semibold">Organizer:</span>{" "}
                {selectedEvent.organisingCommittee}
              </p>
              {selectedEvent.eventPlace && (
                <p className="text-gray-600">
                  <span className="font-semibold">Location:</span>{" "}
                  {selectedEvent.eventPlace}
                </p>
              )}
              <p className="text-gray-600">
                <span className="font-semibold">Starts:</span>{" "}
                {formatDate(selectedEvent.startDate)}
              </p>
              <p className="text-gray-600">
                <span className="font-semibold">Ends:</span>{" "}
                {formatDate(selectedEvent.endDate)}
              </p>
              {selectedEvent.description && (
                <p className="text-gray-600">
                  <span className="font-semibold">Description:</span>{" "}
                  {selectedEvent.description}
                </p>
              )}
              {selectedEvent.registrationFee && (
                <p className="text-sm font-medium text-indigo-600 mt-2">
                  Registration Fee: ₹{selectedEvent.registrationFee}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HostEventsModal;
