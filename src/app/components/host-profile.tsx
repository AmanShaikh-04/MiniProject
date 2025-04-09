"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { auth, db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import HostEventsModal from "./host-events-modal";

interface Student {
  [key: string]: any;
  firstName?: string;
  lastName?: string; // Surname
  fatherName?: string; // Last Name
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
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Temporary values for editing
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempSurname, setTempSurname] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempRollNo, setTempRollNo] = useState("");
  const [tempBranch, setTempBranch] = useState("");
  const [tempDepartment, setTempDepartment] = useState("");
  const [tempYear, setTempYear] = useState("");

  // Profile photo changes (local only)
  const [newProfilePhoto, setNewProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch student profile from the "student" collection
  const fetchProfile = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "student", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let data: Student = {};
        if (userDocSnap.exists()) {
          data = userDocSnap.data() as Student;
        }
        // Fallback: use auth.currentUser details if fields are missing
        const user = auth.currentUser;
        if (!data.firstName && user?.displayName) {
          const names = user.displayName.split(" ");
          data.firstName = names[0] || "";
          if (!data.lastName) {
            data.lastName = names.slice(1).join(" ");
          }
        }
        if (!data.email && user?.email) {
          data.email = user.email;
        }
        if (!data.profilePhoto && user?.photoURL) {
          data.profilePhoto = user.photoURL;
        }
        // Set defaults if still missing
        data.firstName = data.firstName || "Student";
        data.lastName = data.lastName || "";
        data.email = data.email || "email@example.com";
        data.profilePhoto = data.profilePhoto || "/assets/logo.jpg";

        setStudent(data);

        // Initialize temporary states for editing
        setTempFirstName(data.firstName || "");
        setTempSurname(data.lastName || "");
        setTempLastName(data.fatherName || "");
        setTempRollNo(data.rollNo || "");
        setTempBranch(data.branch || "");
        setTempDepartment(data.department || "");
        setTempYear(data.yearOfStudy || "");

        setNewProfilePhoto(null);
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchProfile();
    });
    return () => unsubscribe();
  }, []);

  const openModal = () => {
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowDetailsModal(false);
    setEditMode(false);
    setRequestSent(false);
  };

  const handleDeleteClick = () => {
    setShowEventsModal(true);
  };

  // Confirm user wants to request changes
  const handleEditClick = () => {
    if (!requestSent) {
      setShowEditConfirmation(true);
    }
  };

  // User confirms "Yes" => enable edit mode
  const confirmEdit = () => {
    setShowEditConfirmation(false);
    setEditMode(true);
    setRequestSent(false);
  };

  // User cancels the confirmation
  const cancelEditConfirmation = () => {
    setShowEditConfirmation(false);
  };

  // Cancel editing => revert local changes
  const handleCancelEdit = () => {
    if (student) {
      setTempFirstName(student.firstName || "");
      setTempSurname(student.lastName || "");
      setTempLastName(student.fatherName || "");
      setTempRollNo(student.rollNo || "");
      setTempBranch(student.branch || "");
      setTempDepartment(student.department || "");
      setTempYear(student.yearOfStudy || "");
    }
    setNewProfilePhoto(null);
    setEditMode(false);
    setRequestSent(false);
  };

  // Handle file selection for new photo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setNewProfilePhoto(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // On Save => just show "Request sent" (do NOT update Firestore)
  const handleSaveChanges = () => {
    setRequestSent(true);
  };

  if (loading) {
    return (
      <div className="relative mt-8 p-8 bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-lg mx-auto">
        Loading...
      </div>
    );
  }

  return (
    <>
      <div className="relative mt-8 p-8 bg-white text-gray-900 rounded-3xl shadow-xl w-full max-w-lg mx-auto">
        {student ? (
          <div className="flex flex-col gap-6 sm:flex-row items-center justify-between">
            {/* Profile Image */}
            <div className="flex items-center justify-center flex-shrink-0">
              <div className="relative w-36 h-36 rounded-full bg-indigo-300 overflow-hidden shadow-lg border-4 border-indigo-500">
                <Image
                  src={
                    newProfilePhoto
                      ? newProfilePhoto
                      : student.profilePhoto || "/assets/logo.jpg"
                  }
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Basic Info */}
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

            {/* Action Button */}
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

        {/* DETAILS MODAL */}
        {showDetailsModal && student && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeModal}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Close Icon */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
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

              <h2 className="text-3xl font-extrabold text-indigo-700 mb-6 text-center">
                Student Details
              </h2>

              {/* Profile Pic */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-24 h-24 rounded-full bg-indigo-200 overflow-hidden shadow-md border-4 border-indigo-500">
                  <Image
                    src={
                      newProfilePhoto
                        ? newProfilePhoto
                        : student.profilePhoto || "/assets/logo.jpg"
                    }
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Change Photo Button (only in edit mode) */}
              {editMode && (
                <div className="flex justify-center mb-6">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    Change Photo
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
              )}

              {/* DETAILS TABLE */}
              <div className="space-y-3">
                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    First Name
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempFirstName}
                      onChange={(e) => setTempFirstName(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.firstName || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Surname
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempSurname}
                      onChange={(e) => setTempSurname(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.lastName || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Last Name
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempLastName}
                      onChange={(e) => setTempLastName(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.fatherName || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Roll No
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempRollNo}
                      onChange={(e) => setTempRollNo(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.rollNo || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Branch
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempBranch}
                      onChange={(e) => setTempBranch(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.branch || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Department
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempDepartment}
                      onChange={(e) => setTempDepartment(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.department || "—"}
                    </span>
                  )}
                </div>

                <div
                  className={`grid grid-cols-2 items-center ${editMode ? "gap-x-2 gap-y-2" : "gap-x-8 gap-y-2"}`}
                >
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Year
                  </span>
                  {editMode ? (
                    <input
                      type="text"
                      className="border border-gray-300 rounded px-2 py-1 focus:outline-none w-full"
                      value={tempYear}
                      onChange={(e) => setTempYear(e.target.value)}
                    />
                  ) : (
                    <span className="text-gray-700">
                      {student.yearOfStudy || "—"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 items-center gap-x-8 gap-y-2">
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Email-Id
                  </span>
                  <span className="text-gray-700">{student.email || "—"}</span>
                </div>
              </div>

              {/* Request Sent Message */}
              {requestSent && (
                <p className="mt-4 text-center text-green-600 font-semibold">
                  Request sent successfully!
                </p>
              )}

              {/* Footer Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row justify-center sm:justify-between items-center gap-4">
                {!editMode ? (
                  <button
                    onClick={handleEditClick}
                    className="w-32 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    onClick={handleCancelEdit}
                    className="w-32 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    Cancel Edit
                  </button>
                )}

                {editMode && (
                  <button
                    onClick={handleSaveChanges}
                    className="w-32 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-transform transform hover:scale-105"
                  >
                    Save
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Confirmation Popup */}
        {showEditConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={cancelEditConfirmation}
            ></div>
            <div className="relative bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Are you sure you want to request changes to your profile?
              </h3>
              <div className="flex justify-end gap-4">
                <button
                  onClick={cancelEditConfirmation}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-md"
                >
                  No
                </button>
                <button
                  onClick={confirmEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Button Group: Create Event & Delete Event */}
      <div className="flex justify-center gap-6 mt-8 w-full max-w-lg mx-auto">
        <Link
          href="/event-register"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          Create Event
        </Link>
        <button
          onClick={handleDeleteClick}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          Delete Event
        </button>
      </div>
      {/* Events Modal */}
      <HostEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
      />
    </>
  );
};

export default Profile;
