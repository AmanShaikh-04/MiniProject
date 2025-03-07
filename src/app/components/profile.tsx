"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { auth, db } from "@/app/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

interface Student {
  [key: string]: any; // For displaying all fields in the modal
  firstName?: string;
  lastName?: string; // This is the "Surname"
  fatherName?: string; // This is the "Last Name"
  rollNo?: string;
  branch?: string;
  department?: string;
  yearOfStudy?: string;
  email?: string;
  profilePhoto?: string;
}

const Profile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Edit mode states for left column fields
  const [editFirstName, setEditFirstName] = useState(false);
  const [editSurname, setEditSurname] = useState(false);
  const [editLastName, setEditLastName] = useState(false);

  // Temporary states for edited values
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempSurname, setTempSurname] = useState("");
  const [tempLastName, setTempLastName] = useState("");

  useEffect(() => {
    // Listen for auth changes so user is valid on refresh
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const data = userDocSnap.data() as Student;
            setStudent(data);
            // Set temporary values for inline editing
            setTempFirstName(data.firstName || "");
            setTempSurname(data.lastName || "");
            setTempLastName(data.fatherName || "");
          } else {
            console.log("No user data found for uid", user.uid);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openModal = () => {
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    // Reset edit modes when closing
    setEditFirstName(false);
    setEditSurname(false);
    setEditLastName(false);
  };

  // Handlers for saving edited fields
  const handleSaveField = async (
    fieldKey: "firstName" | "lastName" | "fatherName",
    newValue: string,
  ) => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userDocRef, { [fieldKey]: newValue });
        setStudent((prev) => (prev ? { ...prev, [fieldKey]: newValue } : prev));
      } catch (error) {
        console.error(`Error updating ${fieldKey}:`, error);
      }
    }
  };

  const handleSaveFirstName = async () => {
    await handleSaveField("firstName", tempFirstName);
    setEditFirstName(false);
  };

  const handleSaveSurname = async () => {
    await handleSaveField("lastName", tempSurname);
    setEditSurname(false);
  };

  const handleSaveLastName = async () => {
    await handleSaveField("fatherName", tempLastName);
    setEditLastName(false);
  };

  if (loading) {
    return (
      <div className="mt-8 p-8 bg-gray-100 text-gray-900 rounded-2xl shadow-xl w-full max-w-lg mx-auto border border-gray-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative mt-8 p-8 bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-lg mx-auto border border-gray-200">
      {student ? (
        <div className="flex flex-col gap-6 sm:flex-row items-center justify-between">
          {/* Profile Image */}
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="relative w-36 h-36 rounded-full bg-indigo-300 overflow-hidden shadow-lg border-4 border-indigo-500">
              <Image
                src={student.profilePhoto || "/assets/logo.jpg"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* User Info */}
          <div className="flex-grow flex flex-col justify-center text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              {student.firstName} {student.lastName}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
              <div>
                <span className="block text-gray-600 uppercase">
                  Department
                </span>
                <span className="font-semibold text-gray-700">
                  {student.department || "—"}
                </span>
              </div>
              <div>
                <span className="block text-gray-600 uppercase">Branch</span>
                <span className="font-semibold text-gray-700">
                  {student.branch || "—"}
                </span>
              </div>
            </div>
          </div>

          {/* DETAILS Button */}
          <button
            onClick={openModal}
            className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            DETAILS
          </button>
        </div>
      ) : (
        <div className="text-center py-4">No user data found.</div>
      )}

      {/* Modal for displaying and editing details */}
      {showDetailsModal && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-2xl p-8 w-full max-w-3xl border border-indigo-200">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={closeModal}
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

            {/* Modal Header */}
            <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
              User Details
            </h2>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-24 h-24 rounded-full bg-indigo-300 overflow-hidden shadow-md border-4 border-indigo-500">
                <Image
                  src={student.profilePhoto || "/assets/logo.jpg"}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* First Name */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 text-sm uppercase font-bold">
                      First Name
                    </span>
                    <button
                      onClick={() => setEditFirstName(true)}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      {/* Pen Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6-6m2 2a2.121 2.121 0 113 3L10 21H7v-3L16.232 7.768z"
                        />
                      </svg>
                    </button>
                  </div>
                  {editFirstName ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tempFirstName}
                        onChange={(e) => setTempFirstName(e.target.value)}
                        className="border-b border-indigo-400 focus:outline-none text-base text-gray-800 flex-grow"
                      />
                      <button
                        onClick={handleSaveFirstName}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        {/* Check Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800 text-base">
                      {student.firstName || "—"}
                    </span>
                  )}
                </div>

                {/* Surname (lastName) */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 text-sm uppercase font-bold">
                      Surname
                    </span>
                    <button
                      onClick={() => setEditSurname(true)}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      {/* Pen Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6-6m2 2a2.121 2.121 0 113 3L10 21H7v-3L16.232 7.768z"
                        />
                      </svg>
                    </button>
                  </div>
                  {editSurname ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tempSurname}
                        onChange={(e) => setTempSurname(e.target.value)}
                        className="border-b border-indigo-400 focus:outline-none text-base text-gray-800 flex-grow"
                      />
                      <button
                        onClick={handleSaveSurname}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        {/* Check Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800 text-base">
                      {student.lastName || "—"}
                    </span>
                  )}
                </div>

                {/* Last Name (fatherName) */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between">
                    <span className="text-indigo-700 text-sm uppercase font-bold">
                      Last Name
                    </span>
                    <button
                      onClick={() => setEditLastName(true)}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      {/* Pen Icon */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536M9 11l6-6m2 2a2.121 2.121 0 113 3L10 21H7v-3L16.232 7.768z"
                        />
                      </svg>
                    </button>
                  </div>
                  {editLastName ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={tempLastName}
                        onChange={(e) => setTempLastName(e.target.value)}
                        className="border-b border-indigo-400 focus:outline-none text-base text-gray-800 flex-grow"
                      />
                      <button
                        onClick={handleSaveLastName}
                        className="ml-2 text-green-500 hover:text-green-700"
                      >
                        {/* Check Icon */}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span className="text-gray-800 text-base">
                      {student.fatherName || "—"}
                    </span>
                  )}
                </div>

                {/* Roll No (non-editable) */}
                <div className="flex flex-col">
                  <span className="text-indigo-700 text-sm uppercase font-bold">
                    Roll No
                  </span>
                  <span className="text-gray-800 text-base">
                    {student.rollNo || "—"}
                  </span>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Branch */}
                <div className="flex flex-col">
                  <span className="text-indigo-700 text-sm uppercase font-bold">
                    Branch
                  </span>
                  <span className="text-gray-800 text-base">
                    {student.branch || "—"}
                  </span>
                </div>
                {/* Department */}
                <div className="flex flex-col">
                  <span className="text-indigo-700 text-sm uppercase font-bold">
                    Department
                  </span>
                  <span className="text-gray-800 text-base">
                    {student.department || "—"}
                  </span>
                </div>
                {/* Year */}
                <div className="flex flex-col">
                  <span className="text-indigo-700 text-sm uppercase font-bold">
                    Year
                  </span>
                  <span className="text-gray-800 text-base">
                    {student.yearOfStudy || "—"}
                  </span>
                </div>
                {/* Email-Id */}
                <div className="flex flex-col">
                  <span className="text-indigo-700 text-sm uppercase font-bold">
                    Email-Id
                  </span>
                  <span className="text-gray-800 text-base">
                    {student.email || "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
