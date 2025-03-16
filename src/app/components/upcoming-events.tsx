"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { db, auth } from "@/app/firebase";
import {
  collection,
  getDocs,
  getDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

type RegStep = "confirm" | "password" | "success";

interface EventData {
  id: string;
  eventName: string;
  organisingCommittee: string;
  eventPlace?: string;
  description?: string;
  branches?: string[];
  years?: string[];
  departments?: string[];
  startDate?: any;
  endDate?: any;
  startTime?: any;
  coverImage?: string;
  [key: string]: any;
}

const UpcomingEventsSection = () => {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);

  // Registration Modal States
  const [registrationEvent, setRegistrationEvent] = useState<EventData | null>(
    null,
  );
  const [registrationStep, setRegistrationStep] = useState<RegStep>("confirm");
  const [registrationPassword, setRegistrationPassword] = useState("");
  const [registrationError, setRegistrationError] = useState("");

  // Fetch events regardless of user authentication status
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

  // --- Helper functions for date/time formatting ---
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "";
    const dateObj = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    return dateObj.toLocaleDateString([], {
      month: "numeric",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeValue: any) => {
    if (!timeValue) return "";
    const dateObj = timeValue.toDate ? timeValue.toDate() : new Date(timeValue);
    return dateObj.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Reauthentication and Registration Submission ---
  const handleReauthentication = async () => {
    setRegistrationError("");
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setRegistrationError("No logged-in user.");
      return;
    }
    const isGoogleUser = currentUser.providerData.some(
      (provider) => provider.providerId === "google.com",
    );
    try {
      if (isGoogleUser) {
        const googleProvider = new GoogleAuthProvider();
        await reauthenticateWithPopup(currentUser, googleProvider);
      } else {
        const credential = EmailAuthProvider.credential(
          currentUser.email,
          registrationPassword,
        );
        await reauthenticateWithCredential(currentUser, credential);
      }

      // Fetch user details from the "student" collection instead of "users".
      const userDocRef = doc(db, "student", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("User details not found in database");
      }
      const userData = userDocSnap.data();

      // Map keys as stored in your student collection.
      const fatherName = userData.fatherName || "";
      const studentName = userData.firstName || "";
      const surnameName = userData.lastName || "";

      if (!registrationEvent) {
        setRegistrationError("No registration event selected.");
        return;
      }
      // Store registration details in the event's "registeredStudents" subcollection.
      await setDoc(
        doc(
          db,
          "events",
          registrationEvent.id,
          "registeredStudents",
          currentUser.uid,
        ),
        {
          studentId: currentUser.uid,
          studentEmail: currentUser.email,
          fatherName: fatherName,
          studentName: studentName,
          surnameName: surnameName,
          studentFullName: `${studentName} ${surnameName}`,
          registrationDate: serverTimestamp(),
        },
      );
      setRegistrationStep("success");
    } catch (error: any) {
      console.error("Reauthentication error:", error);
      setRegistrationError(
        isGoogleUser
          ? "Google reauthentication failed. Please try again."
          : "Incorrect password. Please try again.",
      );
    }
  };

  // Modified close function: if registration was successful, dispatch event to refresh registered-events.
  const closeRegistrationModal = () => {
    if (registrationStep === "success") {
      window.dispatchEvent(new CustomEvent("registrationSuccess"));
    }
    setRegistrationEvent(null);
    setRegistrationStep("confirm");
    setRegistrationPassword("");
    setRegistrationError("");
  };

  // --- Main Render ---
  return (
    <>
      {/* DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className="relative bg-gradient-to-br from-blue-100 via-white to-blue-50 border border-blue-200 rounded-3xl shadow-2xl p-10 w-full max-w-5xl mx-4">
            <button
              className="absolute top-6 right-6 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedEvent(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {selectedEvent.eventName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg leading-relaxed">
              <div className="flex justify-center items-center">
                {selectedEvent.coverImage ? (
                  <Image
                    src={selectedEvent.coverImage}
                    alt="Event Cover"
                    width={500}
                    height={350}
                    className="object-cover rounded-md border border-gray-200"
                  />
                ) : (
                  <Image
                    src="/assets/aiktclogo1.png"
                    alt="Default Event"
                    width={500}
                    height={350}
                    className="object-cover rounded-md border border-gray-200"
                  />
                )}
              </div>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">Organising Committee:</span>{" "}
                  {selectedEvent.organisingCommittee || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Event Place:</span>{" "}
                  {selectedEvent.eventPlace || "N/A"}
                </p>
                <p>
                  <span className="font-semibold">Start Date:</span>{" "}
                  {formatDate(selectedEvent.startDate)}
                </p>
                <p>
                  <span className="font-semibold">End Date:</span>{" "}
                  {formatDate(selectedEvent.endDate)}
                </p>
                <p>
                  <span className="font-semibold">Timing:</span>{" "}
                  {formatTime(selectedEvent.startTime)}
                </p>
                {selectedEvent.branches && (
                  <p>
                    <span className="font-semibold">Branches:</span>{" "}
                    {selectedEvent.branches.join(", ")}
                  </p>
                )}
                {selectedEvent.years && (
                  <p>
                    <span className="font-semibold">Years:</span>{" "}
                    {selectedEvent.years.join(", ")}
                  </p>
                )}
                {selectedEvent.departments && (
                  <p>
                    <span className="font-semibold">Departments:</span>{" "}
                    {selectedEvent.departments.join(", ")}
                  </p>
                )}
              </div>
            </div>
            {selectedEvent.description && (
              <div className="mt-8 text-xl leading-relaxed">
                <span className="font-semibold block mb-2">Description:</span>
                <p className="text-gray-800">{selectedEvent.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REGISTRATION MODAL */}
      {registrationEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeRegistrationModal}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={closeRegistrationModal}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {registrationStep === "confirm" && (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Confirm Registration
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  Are you sure you want to register for{" "}
                  <span className="font-semibold">
                    {registrationEvent.eventName}
                  </span>
                  ?
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={closeRegistrationModal}
                    className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setRegistrationStep("password")}
                    className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
                  >
                    Confirm
                  </button>
                </div>
              </>
            )}

            {registrationStep === "password" && (
              <>
                {auth.currentUser &&
                auth.currentUser.providerData.some(
                  (provider) => provider.providerId === "google.com",
                ) ? (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Reauthenticate with Google
                    </h3>
                    <p className="text-lg text-gray-700 mb-4">
                      Please reauthenticate using your Google account.
                    </p>
                    {registrationError && (
                      <p className="text-red-600 text-lg mb-3">
                        {registrationError}
                      </p>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={closeRegistrationModal}
                        className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReauthentication}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
                      >
                        Reauthenticate with Google
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      Enter Your Password
                    </h3>
                    <p className="text-lg text-gray-700 mb-4">
                      Please enter your account password for confirmation.
                    </p>
                    <input
                      type="password"
                      value={registrationPassword}
                      onChange={(e) => setRegistrationPassword(e.target.value)}
                      placeholder="Your password"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {registrationError && (
                      <p className="text-red-600 text-lg mb-3">
                        {registrationError}
                      </p>
                    )}
                    <div className="flex justify-end gap-4">
                      <button
                        onClick={closeRegistrationModal}
                        className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleReauthentication}
                        className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
                      >
                        Submit
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            {registrationStep === "success" && (
              <>
                <h3 className="text-2xl font-bold text-green-700 mb-4">
                  Registration Successful!
                </h3>
                <p className="text-lg text-gray-800 mb-6">
                  You have been successfully registered for{" "}
                  <span className="font-semibold">
                    {registrationEvent.eventName}
                  </span>
                  .
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={closeRegistrationModal}
                    className="bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition-colors"
                  >
                    OK
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MAIN EVENTS SECTION */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">
            Upcoming Events
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
                </div>
                <div className="flex flex-col space-y-3">
                  <button
                    onClick={() => {
                      if (!auth.currentUser) {
                        router.push("/login");
                      } else {
                        setSelectedEvent(event);
                      }
                    }}
                    className="bg-blue-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-blue-700 transition-colors duration-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => {
                      if (!auth.currentUser) {
                        router.push("/login");
                      } else {
                        setRegistrationEvent(event);
                        setRegistrationStep("confirm");
                        setRegistrationPassword("");
                        setRegistrationError("");
                      }
                    }}
                    className="bg-green-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-green-700 transition-colors duration-300"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default UpcomingEventsSection;
