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
import RazorpayCheckout from "./RazorpayCheckout";

type RegStep = "confirm" | "password" | "payment" | "success";

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
  endTime?: any;
  coverImage?: string;
  cancellationDate?: any;
  createdAt?: any;
  createdBy?: string;
  isDateRangeEnabled?: boolean;
  isTimeRangeEnabled?: boolean;
  refundAmount?: string;
  refundDate?: any;
  refundOption?: boolean;
  registrationFee?: string; // stored in rupees (e.g., "500" means Rs.500)
  registrationFeeOption?: boolean;
  [key: string]: any;
}

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

      // Fetch user details from "student" collection.
      const userDocRef = doc(db, "student", currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error("User details not found in database");
      }
      const userData = userDocSnap.data();

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
      // Check registration fee. If fee > 0, move to payment step; otherwise, mark as success.
      const fee = parseInt(registrationEvent?.registrationFee || "0");
      if (fee > 0) {
        setRegistrationStep("payment");
      } else {
        setRegistrationStep("success");
      }
    } catch (error: any) {
      console.error("Reauthentication error:", error);
      setRegistrationError(
        isGoogleUser
          ? "Google reauthentication failed. Please try again."
          : "Incorrect password. Please try again.",
      );
    }
  };

  const closeRegistrationModal = () => {
    if (registrationStep === "success") {
      window.dispatchEvent(new CustomEvent("registrationSuccess"));
    }
    setRegistrationEvent(null);
    setRegistrationStep("confirm");
    setRegistrationPassword("");
    setRegistrationError("");
  };

  return (
    <>
      {/* DETAILS MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={() => setSelectedEvent(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl mx-4 border border-blue-100">
            <button
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200"
              onClick={() => setSelectedEvent(null)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
            <div className="flex flex-wrap items-start mb-4 md:mb-6">
              <div className="w-full md:pr-4">
                <div className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-2">
                  Event Details
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {selectedEvent.eventName}
                </h2>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/5">
                <div className="w-full aspect-video relative rounded-xl overflow-hidden border border-gray-100 shadow-md">
                  <Image
                    src={selectedEvent.coverImage || "/assets/aiktclogo1.png"}
                    alt="Event Cover"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    <p className="font-medium text-gray-700">
                      {selectedEvent.organisingCommittee || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="font-medium text-gray-700">
                      {selectedEvent.eventPlace || "Location not specified"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    setRegistrationEvent(selectedEvent);
                    setRegistrationStep("confirm");
                  }}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Register Now
                </button>
              </div>
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">Start</p>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedEvent.startDate)}
                      </p>
                    </div>
                    <div className="flex items-center mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatTime(selectedEvent.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">End</p>
                    <div className="flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatDate(selectedEvent.endDate)}
                      </p>
                    </div>
                    <div className="flex items-center mt-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-gray-800">
                        {formatTime(selectedEvent.endTime)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                    <p className="text-sm text-gray-500 mb-1">
                      Registration Fee
                    </p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {selectedEvent.registrationFee || "Free"}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-500 mb-1">Refund Amount</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-blue-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                        />
                      </svg>
                      {selectedEvent.refundAmount || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                    <p className="text-sm text-gray-500 mb-1">Refund Date</p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-yellow-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDate(selectedEvent.refundDate) || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                    <p className="text-sm text-gray-500 mb-1">
                      Cancellation Deadline
                    </p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-red-600 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {formatDate(selectedEvent.cancellationDate) || "N/A"}
                    </p>
                  </div>
                </div>
                {selectedEvent.description && (
                  <div className="mt-3">
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-blue-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        About This Event
                      </h3>
                      <div className="max-h-24 overflow-y-auto pr-1 text-sm text-gray-700 leading-relaxed">
                        {selectedEvent.description}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
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

            {registrationStep === "payment" && (
              <>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Pay Registration Fee
                </h3>
                <p className="text-lg text-gray-700 mb-4">
                  Please complete your payment to confirm your registration.
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
                  {/* Convert rupees to paise */}
                  <RazorpayCheckout
                    amount={
                      parseInt(registrationEvent?.registrationFee || "0") * 100
                    }
                    onPaymentSuccess={async (response) => {
                      const currentUser = auth.currentUser;
                      if (currentUser && registrationEvent) {
                        try {
                          await setDoc(
                            doc(
                              db,
                              "events",
                              registrationEvent.id,
                              "registeredStudents",
                              currentUser.uid,
                              "payments",
                              response.razorpay_payment_id,
                            ),
                            {
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_signature: response.razorpay_signature,
                              paymentDate: serverTimestamp(),
                            },
                          );
                        } catch (error) {
                          console.error(
                            "Error storing payment details:",
                            error,
                          );
                          setRegistrationError(
                            "Failed to store payment details.",
                          );
                          return;
                        }
                      }
                      setRegistrationStep("success");
                    }}
                    onPaymentError={(error) => {
                      setRegistrationError("Payment failed. Please try again.");
                    }}
                  />
                </div>
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
                  </span>{" "}
                  and your payment has been confirmed.
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
                  <p className="text-gray-700">
                    <span className="font-medium">Registration Fee:</span>{" "}
                    {event.registrationFee || "Free"}
                  </p>
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
