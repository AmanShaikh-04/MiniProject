"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth, db } from "@/app/firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
} from "firebase/auth";

type DeleteStep = "confirm" | "password" | "success";

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

interface EventData {
  id: string;
  eventName: string;
  organisingCommittee: string;
  eventPlace?: string;
  description?: string;
  coverImage?: string;
  startDate?: any;
  endDate?: any;
  startTime?: any;
  endTime?: any;
  registrationFee?: string;
  cancellationDate?: any;
  // other fields as needed
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

/* ===== EVENT DETAILS MODAL ===== */
interface EventDetailsModalProps {
  event: EventData;
  onClose: () => void;
}
const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        onClick={onClose}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl mx-4 border border-blue-100">
        <button
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200"
          onClick={onClose}
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
              {event.eventName}
            </h2>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/5">
            <div className="w-full aspect-video relative rounded-xl overflow-hidden border border-gray-100 shadow-md">
              <Image
                src={event.coverImage || "/assets/aiktclogo1.png"}
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
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"
                  />
                </svg>
                <p className="font-medium text-gray-700">
                  {event.organisingCommittee || "N/A"}
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
                  {event.eventPlace || "Location not specified"}
                </p>
              </div>
            </div>
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
                    {formatDate(event.startDate)}
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
                    {formatTime(event.startTime)}
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
                    {formatDate(event.endDate)}
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
                    {formatTime(event.endTime)}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mt-3">
              <span className="font-medium">Registration Fee:</span>{" "}
              {event.registrationFee || "Free"}
            </p>
            {event.description && (
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
                    {event.description}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ===== ALL EVENTS DELETE MODAL ===== */
interface AllEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForDelete: (event: EventData) => void;
  onSelectForDetails: (event: EventData) => void;
  events: EventData[];
  loading: boolean;
}
const AllEventsModal: React.FC<AllEventsModalProps> = ({
  isOpen,
  onClose,
  onSelectForDelete,
  onSelectForDetails,
  events,
  loading,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-extrabold text-indigo-700">
            All Events
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900"
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
        </div>
        {loading ? (
          <p>Loading events...</p>
        ) : events.length ? (
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
                    onClick={() => onSelectForDetails(event)}
                    className="bg-blue-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-blue-700 transition-colors duration-300"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => onSelectForDelete(event)}
                    className="bg-red-600 text-white rounded-md px-6 py-3 text-base font-medium hover:bg-red-700 transition-colors duration-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No events found.</p>
        )}
      </div>
    </div>
  );
};

/* ===== DELETE CONFIRMATION MODAL ===== */
interface DeleteModalProps {
  event: EventData;
  deleteStep: DeleteStep;
  deletePassword: string;
  deleteError: string;
  onCancel: () => void;
  onStepChange: (step: DeleteStep) => void;
  onPasswordChange: (val: string) => void;
  onDelete: () => void;
}
const DeleteConfirmationModal: React.FC<DeleteModalProps> = ({
  event,
  deleteStep,
  deletePassword,
  deleteError,
  onCancel,
  onStepChange,
  onPasswordChange,
  onDelete,
}) => {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onCancel}
      ></div>
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onCancel}
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
        {deleteStep === "confirm" && (
          <>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{event.eventName}</span>?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={onCancel}
                className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => onStepChange("password")}
                className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </>
        )}
        {deleteStep === "password" && (
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
                {deleteError && (
                  <p className="text-red-600 text-lg mb-3">{deleteError}</p>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors"
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
                  value={deletePassword}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  placeholder="Your password"
                  className="w-full border border-gray-300 rounded-md px-4 py-2 mb-3 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {deleteError && (
                  <p className="text-red-600 text-lg mb-3">{deleteError}</p>
                )}
                <div className="flex justify-end gap-4">
                  <button
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 rounded-md px-4 py-2 hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDelete}
                    className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}
          </>
        )}
        {deleteStep === "success" && (
          <>
            <h3 className="text-2xl font-bold text-green-700 mb-4">
              Deletion Successful!
            </h3>
            <p className="text-lg text-gray-800 mb-6">
              The event has been deleted.
            </p>
            <div className="flex justify-end">
              <button
                onClick={onCancel}
                className="bg-green-600 text-white rounded-md px-4 py-2 hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ===== ADMIN PROFILE COMPONENT ===== */
const AdminProfile: React.FC = () => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Temporary states for editing profile info
  const [tempFirstName, setTempFirstName] = useState("");
  const [tempSurname, setTempSurname] = useState("");
  const [tempLastName, setTempLastName] = useState("");
  const [tempRollNo, setTempRollNo] = useState("");
  const [tempBranch, setTempBranch] = useState("");
  const [tempDepartment, setTempDepartment] = useState("");
  const [tempYear, setTempYear] = useState("");

  const [newProfilePhoto, setNewProfilePhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state for showing events list (for deletion)
  const [showEventsModal, setShowEventsModal] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  // Delete modal state
  const [selectedDeleteEvent, setSelectedDeleteEvent] =
    useState<EventData | null>(null);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("confirm");
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Event details modal state
  const [selectedDetailEvent, setSelectedDetailEvent] =
    useState<EventData | null>(null);

  const router = useRouter();

  // Fetch admin profile from "student" collection
  const fetchProfile = async () => {
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, "student", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        let data: Student = {};
        if (userDocSnap.exists()) {
          data = userDocSnap.data() as Student;
        }
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
        data.firstName = data.firstName || "Admin";
        data.lastName = data.lastName || "";
        data.email = data.email || "email@example.com";
        data.profilePhoto = data.profilePhoto || "/assets/logo.jpg";

        setStudent(data);
        setTempFirstName(data.firstName || "");
        setTempSurname(data.lastName || "");
        setTempLastName(data.fatherName || "");
        setTempRollNo(data.rollNo || "");
        setTempBranch(data.branch || "");
        setTempDepartment(data.department || "");
        setTempYear(data.yearOfStudy || "");
        setNewProfilePhoto(null);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    }
    setLoading(false);
  };

  // Fetch all events for deletion modal
  const fetchEvents = async () => {
    setEventsLoading(true);
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
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchProfile();
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showEventsModal) {
      fetchEvents();
    }
  }, [showEventsModal]);

  const openDetailsModal = () => setShowDetailsModal(true);
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setEditMode(false);
    setRequestSent(false);
  };

  const handleEditClick = () => {
    if (!requestSent) setShowEditConfirmation(true);
  };
  const confirmEdit = () => {
    setShowEditConfirmation(false);
    setEditMode(true);
    setRequestSent(false);
  };
  const cancelEditConfirmation = () => setShowEditConfirmation(false);
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
  const handleSaveChanges = () => setRequestSent(true);

  // --- Delete Reauthentication & Deletion ---
  const handleDeleteReauthentication = async () => {
    setDeleteError("");
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      setDeleteError("No logged-in user.");
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
          deletePassword,
        );
        await reauthenticateWithCredential(currentUser, credential);
      }
      // After successful reauthentication, delete the event document.
      if (selectedDeleteEvent) {
        await deleteDoc(doc(db, "events", selectedDeleteEvent.id));
        setDeleteStep("success");
        // Optionally, refresh the events list.
        fetchEvents();
      }
    } catch (error: any) {
      console.error("Delete reauthentication error:", error);
      setDeleteError(
        isGoogleUser
          ? "Google reauthentication failed. Please try again."
          : "Incorrect password. Please try again.",
      );
    }
  };

  const closeDeleteModal = () => {
    setSelectedDeleteEvent(null);
    setDeleteStep("confirm");
    setDeletePassword("");
    setDeleteError("");
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
      {/* ADMIN PROFILE SECTION */}
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
              onClick={openDetailsModal}
              className="absolute bottom-4 right-4 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-lg shadow-lg transition-transform transform hover:scale-105"
            >
              DETAILS
            </button>
          </div>
        ) : (
          <div className="text-center py-4">No user data found.</div>
        )}

        {/* DETAILS MODAL (Profile Details) */}
        {showDetailsModal && student && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeDetailsModal}
            ></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeDetailsModal}
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
                Admin Details
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
              {/* PROFILE DETAILS TABLE */}
              <div className="space-y-3">
                {/* First Name */}
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
                {/* Surname */}
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
                {/* Last Name */}
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
                {/* Roll No */}
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
                {/* Branch */}
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
                {/* Department */}
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
                {/* Year */}
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
                {/* Email */}
                <div className="grid grid-cols-2 items-center gap-x-8 gap-y-2">
                  <span className="font-semibold text-indigo-700 uppercase text-sm">
                    Email-Id
                  </span>
                  <span className="text-gray-700">{student.email || "—"}</span>
                </div>
              </div>
              {requestSent && (
                <p className="mt-4 text-center text-green-600 font-semibold">
                  Request sent successfully!
                </p>
              )}
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

      {/* Bottom Buttons: Create Event & Delete Event */}
      <div className="flex justify-center gap-6 mt-8 w-full max-w-lg mx-auto">
        <Link
          href="/event-register"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          Create Event
        </Link>
        <button
          onClick={() => setShowEventsModal(true)}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-md transition-colors"
        >
          Delete Event
        </button>
      </div>

      {/* All Events Delete Modal */}
      <AllEventsModal
        isOpen={showEventsModal}
        onClose={() => setShowEventsModal(false)}
        onSelectForDelete={(event) => {
          setSelectedDeleteEvent(event);
          setDeleteStep("confirm");
          setDeletePassword("");
          setDeleteError("");
        }}
        onSelectForDetails={(event) => {
          // When Details is clicked from the events list, open event details modal.
          setSelectedDetailEvent(event);
        }}
        events={events}
        loading={eventsLoading}
      />

      {/* Delete Confirmation Modal */}
      {selectedDeleteEvent && (
        <DeleteConfirmationModal
          event={selectedDeleteEvent}
          deleteStep={deleteStep}
          deletePassword={deletePassword}
          deleteError={deleteError}
          onCancel={closeDeleteModal}
          onStepChange={(step) => setDeleteStep(step)}
          onPasswordChange={(val) => setDeletePassword(val)}
          onDelete={handleDeleteReauthentication}
        />
      )}

      {/* Event Details Modal */}
      {selectedDetailEvent && (
        <EventDetailsModal
          event={selectedDetailEvent}
          onClose={() => setSelectedDetailEvent(null)}
        />
      )}
    </>
  );
};

export default AdminProfile;
