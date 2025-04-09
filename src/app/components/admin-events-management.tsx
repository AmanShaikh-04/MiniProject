"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db, auth } from "@/app/firebase";
import {
  collection,
  getDocs,
  getDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

// Props interface for the component
interface AdminEventsManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

// An interface for events
interface EventData {
  id: string;
  eventName: string;
  organisingCommittee: string;
  eventPlace?: string;
  description?: string;
  startDate?: any;
  endDate?: any;
  startTime?: any;
  endTime?: any;
  coverImage?: string;
  registrationFee?: string;
  createdBy?: string;
  [key: string]: any;
}

// Utility functions for formatting dates and times.
const formatDate = (dateValue: any) => {
  if (!dateValue) return "";
  const dateObj = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
  return dateObj.toLocaleDateString("en-GB");
};

const formatTime = (timeValue: any) => {
  if (!timeValue) return "";
  const dateObj = timeValue.toDate ? timeValue.toDate() : new Date(timeValue);
  return dateObj.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const AdminEventsManagement: React.FC<AdminEventsManagementProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // Deletion modal step:
  // "confirm" asks if the admin wants to delete,
  // "password" prompts for password for non-Google users,
  // "success" indicates deletion success.
  const [deletionStep, setDeletionStep] = useState<
    "confirm" | "password" | "success"
  >("confirm");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Fetch all events (no filtering) on component mount.
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsCollection = collection(db, "events");
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsList = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as EventData[];
        setEvents(eventsList);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  // Opens deletion confirmation modal.
  const openDeleteModal = (event: EventData) => {
    setSelectedEvent(event);
    setDeletionStep("confirm");
    setDeletePassword("");
    setDeleteError("");
  };

  // Closes deletion modal.
  const closeDeleteModal = () => {
    setSelectedEvent(null);
    setDeletionStep("confirm");
    setDeletePassword("");
    setDeleteError("");
  };

  // Handle the deletion process.
  const handleDelete = async () => {
    if (!selectedEvent || !auth.currentUser) return;

    const currentUser = auth.currentUser;
    const isGoogleUser = currentUser.providerData.some(
      (provider) => provider.providerId === "google.com",
    );

    try {
      // For Google users, perform popup reauthentication.
      if (isGoogleUser) {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, googleProvider);
      } else {
        // For non-Google admin, ensure password is provided.
        if (!deletePassword) {
          setDeleteError("Please enter your password.");
          return;
        }
        const credential = EmailAuthProvider.credential(
          currentUser.email!,
          deletePassword,
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Delete the event document from Firestore.
      await deleteDoc(doc(db, "events", selectedEvent.id));

      // Remove the deleted event from the list.
      setEvents((prevEvents) =>
        prevEvents.filter((event) => event.id !== selectedEvent.id),
      );
      setDeletionStep("success");
      setDeleteError("");
      // Optionally, close the modal after a delay.
      setTimeout(() => {
        closeDeleteModal();
      }, 1500);
    } catch (error: any) {
      console.error("Error deleting event:", error);
      setDeleteError(
        isGoogleUser
          ? "Google reauthentication failed. Please try again."
          : "Incorrect password. Please try again.",
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Events</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-10">
          Manage Events
        </h2>
        <div className="space-y-8">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white shadow-md rounded-lg p-5 border border-gray-200 flex flex-col md:flex-row items-start md:items-center gap-8"
            >
              <div className="flex-shrink-0">
                <div className="relative w-72 h-44 sm:w-70 sm:h-38 overflow-hidden rounded-md border border-gray-300 flex items-center justify-center bg-gray-50">
                  {event.coverImage ? (
                    <Image
                      src={event.coverImage}
                      alt="Event Cover"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Image
                      src="/assets/aiktclogo1.png"
                      alt="Default Event"
                      fill
                      className="object-contain p-2"
                    />
                  )}
                </div>
              </div>
              <div className="flex-grow text-lg leading-relaxed">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  {event.eventName}
                </h3>
                <p className="text-gray-700 mb-3">
                  <span className="font-medium">Organising Committee:</span>{" "}
                  {event.organisingCommittee}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-8 mb-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Start Date:</span>{" "}
                    {formatDate(event.startDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">End Date:</span>{" "}
                    {formatDate(event.endDate)}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Timing:</span>{" "}
                    {formatTime(event.startTime)}
                  </p>
                </div>
                <p className="text-gray-700">
                  <span className="font-medium">Registration Fee:</span>{" "}
                  {event.registrationFee || "Free"}
                </p>
              </div>
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setSelectedEvent(event)}
                  className="bg-blue-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-blue-700 transition-colors duration-300"
                >
                  Details
                </button>
                <button
                  onClick={() => openDeleteModal(event)}
                  className="bg-red-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-red-700 transition-colors duration-300"
                >
                  Delete Event
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deletion Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black bg-opacity-50">
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            {deletionStep === "confirm" && (
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Delete {selectedEvent.eventName}?
                </h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete this event? This action cannot
                  be undone.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // For non-Google users, move to password step.
                      if (
                        !auth.currentUser?.providerData.some(
                          (provider) => provider.providerId === "google.com",
                        )
                      ) {
                        setDeletionStep("password");
                      } else {
                        // For Google users, attempt deletion immediately.
                        handleDelete();
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {deletionStep === "password" && (
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Enter Your Password
                </h3>
                <p className="text-gray-700 mb-4">
                  Please enter your account password to confirm deletion.
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {deleteError && (
                  <p className="text-red-600 text-lg mb-3">{deleteError}</p>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeDeleteModal}
                    className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors"
                  >
                    Delete Event
                  </button>
                </div>
              </div>
            )}

            {deletionStep === "success" && (
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-green-700 mb-4">
                  Event Deleted Successfully!
                </h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEvent && deletionStep === "confirm" && (
        <div className="fixed inset-0 z-40 flex items-center justify-center overflow-auto bg-black bg-opacity-40">
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl mx-4">
            <button
              onClick={() => setSelectedEvent(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {selectedEvent.eventName} Details
            </h3>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-1/2 h-64 overflow-hidden rounded-md border border-gray-200">
                <Image
                  src={selectedEvent.coverImage || "/assets/aiktclogo1.png"}
                  alt="Event Cover"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Organising Committee:</span>{" "}
                  {selectedEvent.organisingCommittee}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Place:</span>{" "}
                  {selectedEvent.eventPlace || "N/A"}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Start:</span>{" "}
                  {formatDate(selectedEvent.startDate)}{" "}
                  {formatTime(selectedEvent.startTime)}
                </p>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">End:</span>{" "}
                  {formatDate(selectedEvent.endDate)}{" "}
                  {formatTime(selectedEvent.endTime)}
                </p>
                {selectedEvent.description && (
                  <p className="text-gray-700">
                    <span className="font-medium">Description:</span>{" "}
                    {selectedEvent.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEventsManagement;
