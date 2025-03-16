"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  FormEvent,
  RefObject,
} from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseApp from "../firebase";

interface EventData {
  eventName: string;
  organisingCommittee: string;
  eventPlace: string;
  description: string;
  branches: string[];
  years: string[];
  departments: string[];
  startDate: Date | null;
  endDate: Date | null;
  startTime: Date | null;
  endTime: Date | null;
  coverImage: string;
  createdBy: string;
  registrationFeeOption: boolean;
  registrationFee: string;
  refundOption: boolean;
  refundAmount: string;
  refundDate: Date | null;
  cancellationDate: Date | null;
  isDateRangeEnabled: boolean;
  isTimeRangeEnabled: boolean;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  label: string;
  options: DropdownOption[];
  values: string[];
  isOpen: boolean;
  toggleOpen: () => void;
  onChange: (selected: string[]) => void;
  innerRef: RefObject<HTMLDivElement | null>;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  values,
  isOpen,
  toggleOpen,
  onChange,
  innerRef,
}) => {
  let displayText = `Select ${label}`;
  if (values.length === options.length && options.length > 0) {
    displayText = "All";
  } else if (values.length > 0) {
    displayText = values.join(", ");
  }

  const handleOptionChange = (optionValue: string) => {
    if (optionValue === "all") {
      if (values.length !== options.length) {
        onChange(options.map((opt) => opt.value));
      } else {
        onChange([]);
      }
    } else {
      if (values.includes(optionValue)) {
        onChange(values.filter((v) => v !== optionValue));
      } else {
        onChange([...values, optionValue]);
      }
    }
  };

  return (
    <div ref={innerRef} className="relative w-full">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>
      <div
        onClick={toggleOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition-all duration-300 focus:outline-none shadow-sm"
      >
        <span
          className={
            values.length ? "text-gray-800" : "text-gray-400 font-light"
          }
        >
          {displayText}
        </span>
        <svg
          className={`w-5 h-5 text-indigo-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
          <label
            key="all"
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
            onClick={() => handleOptionChange("all")}
          >
            <div
              className={`w-5 h-5 rounded border flex items-center justify-center ${values.length === options.length ? "bg-indigo-500 border-indigo-500" : "border-gray-300"}`}
            >
              {values.length === options.length && (
                <svg
                  className="w-4 h-4 text-white"
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
              )}
            </div>
            <span className="ml-3 font-medium">All</span>
          </label>
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-50 transition-colors"
                onClick={() => handleOptionChange(option.value)}
              >
                <div
                  className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? "bg-indigo-500 border-indigo-500" : "border-gray-300"}`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-white"
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
                  )}
                </div>
                <span className="ml-3">{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default function EventRegistrationForm() {
  const router = useRouter();
  const db = getFirestore(firebaseApp);
  const auth = getAuth(firebaseApp);
  const [isUserAuthorized, setIsUserAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData>({
    eventName: "",
    organisingCommittee: "",
    eventPlace: "",
    description: "",
    branches: [],
    years: [],
    departments: [],
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    coverImage: "",
    createdBy: "",
    registrationFeeOption: false,
    registrationFee: "",
    refundOption: false,
    refundAmount: "",
    refundDate: null,
    cancellationDate: null,
    isDateRangeEnabled: false, // default off
    isTimeRangeEnabled: false,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);
  const branchRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const departmentRef = useRef<HTMLDivElement | null>(null);
  const [modalMessage, setModalMessage] = useState("");
  const [currentUserUid, setCurrentUserUid] = useState<string | null>(null);

  const datePickerWrapperClass = "w-full";
  const datePickerClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg hover:border-indigo-400 transition-all duration-300 focus:outline-none shadow-sm";

  // When start date changes, if no cancellation date is set, default to 2 days earlier
  useEffect(() => {
    if (eventData.startDate && !eventData.cancellationDate) {
      const defaultCancellation = new Date(
        eventData.startDate.getTime() - 2 * 24 * 60 * 60 * 1000,
      );
      setEventData((prev) => ({
        ...prev,
        cancellationDate: defaultCancellation,
      }));
    }
  }, [eventData.startDate]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setCurrentUserUid(user.uid);
      setEventData((prevData) => ({
        ...prevData,
        createdBy: user.uid,
      }));
      const checkUserRole = async () => {
        try {
          const hostRef = doc(db, "host", user.uid);
          const adminRef = doc(db, "admin", user.uid);
          const hostSnap = await getDoc(hostRef);
          const adminSnap = await getDoc(adminRef);
          if (hostSnap.exists() || adminSnap.exists()) {
            setIsUserAuthorized(true);
          } else {
            setIsUserAuthorized(false);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          setIsUserAuthorized(false);
        } finally {
          setLoading(false);
        }
      };
      checkUserRole();
    } else {
      setLoading(false);
    }
  }, [auth, db]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (branchRef.current && !branchRef.current.contains(e.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
      if (yearRef.current && !yearRef.current.contains(e.target as Node)) {
        setIsYearDropdownOpen(false);
      }
      if (
        departmentRef.current &&
        !departmentRef.current.contains(e.target as Node)
      ) {
        setIsDepartmentDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setEventData((prev) => ({ ...prev, coverImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mandatory fields check
    if (
      !eventData.eventName ||
      !eventData.organisingCommittee ||
      !eventData.eventPlace ||
      !eventData.description ||
      eventData.branches.length === 0 ||
      eventData.years.length === 0 ||
      eventData.departments.length === 0 ||
      !eventData.startDate ||
      !eventData.coverImage
    ) {
      setModalMessage("Please fill in all required fields.");
      return;
    }
    if (eventData.isDateRangeEnabled && !eventData.endDate) {
      setModalMessage("Please fill in all required fields.");
      return;
    }
    if (eventData.registrationFeeOption && !eventData.registrationFee) {
      setModalMessage("Please fill in all required fields.");
      return;
    }
    if (
      eventData.refundOption &&
      (!eventData.refundAmount || !eventData.refundDate)
    ) {
      setModalMessage("Please fill in all required fields.");
      return;
    }
    if (eventData.isTimeRangeEnabled) {
      if (!eventData.startTime || !eventData.endTime) {
        setModalMessage("Please fill in all required fields.");
        return;
      }
    } else {
      if (!eventData.startTime) {
        setModalMessage("Please fill in all required fields.");
        return;
      }
    }
    if (
      eventData.isDateRangeEnabled &&
      eventData.startDate &&
      eventData.endDate &&
      eventData.startDate > eventData.endDate
    ) {
      setModalMessage("Start Date must be before End Date.");
      return;
    }
    if (eventData.refundOption && !eventData.refundDate) {
      setModalMessage("Please select a refund deadline date.");
      return;
    }
    if (!eventData.cancellationDate) {
      setModalMessage("Please select a registration cancellation date.");
      return;
    }
    // Validate cancellation date is between (startDate - 5 days) and (startDate - 2 days)
    if (eventData.startDate && eventData.cancellationDate) {
      const minCancellation = new Date(
        eventData.startDate.getTime() - 5 * 24 * 60 * 60 * 1000,
      );
      const maxCancellation = new Date(
        eventData.startDate.getTime() - 2 * 24 * 60 * 60 * 1000,
      );
      if (
        eventData.cancellationDate < minCancellation ||
        eventData.cancellationDate > maxCancellation
      ) {
        setModalMessage(
          "Registration cancellation date must be between 5 days and 2 days before the event start date.",
        );
        return;
      }
    }
    if (
      eventData.isTimeRangeEnabled &&
      eventData.startTime &&
      eventData.endTime &&
      eventData.startTime > eventData.endTime
    ) {
      setModalMessage("Start Time must be before End Time.");
      return;
    }
    try {
      const dataToSubmit = {
        ...eventData,
        createdBy: currentUserUid,
        createdAt: new Date(),
      };
      await addDoc(collection(db, "events"), dataToSubmit);
      setModalMessage("Event registered successfully!");
      setTimeout(() => {
        router.push("/host-dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error adding event:", error);
      setModalMessage("Error registering event. Please try again.");
    }
  };

  const branchOptions: DropdownOption[] = [
    { value: "CSE", label: "Computer Science" },
    { value: "ECE", label: "Electronics" },
    { value: "MECH", label: "Mechanical" },
    { value: "CIVIL", label: "Civil" },
  ];

  const yearOptions: DropdownOption[] = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" },
  ];

  const departmentOptions: DropdownOption[] = [
    { value: "IT", label: "Information Technology" },
    { value: "CS", label: "Computer Science" },
    { value: "EXTC", label: "Electronics" },
    { value: "MECH", label: "Mechanical" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 to-blue-100">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-indigo-700 text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isUserAuthorized) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-50 to-blue-100 px-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You do not have permission to access this form. Please contact the
            administrator.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-40 backdrop-blur-sm"
            onClick={() => setModalMessage("")}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl p-6 z-10 max-w-sm w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Notification
              </h3>
              <p className="text-lg mb-6 text-gray-700">{modalMessage}</p>
              <button
                className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
                onClick={() => setModalMessage("")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-12 px-4">
        <div className="w-full max-w-5xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-indigo-600">
            <h2 className="text-center text-3xl font-bold text-gray-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-indigo-600 mr-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Register Your Event
            </h2>
          </div>
          <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3"></div>
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Other event inputs remain unchanged */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Event Name
                      </label>
                      <input
                        type="text"
                        name="eventName"
                        value={eventData.eventName}
                        onChange={handleInputChange}
                        placeholder="Enter event name"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Organising Committee
                      </label>
                      <input
                        type="text"
                        name="organisingCommittee"
                        value={eventData.organisingCommittee}
                        onChange={handleInputChange}
                        placeholder="Enter organizing committee"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Event Place
                      </label>
                      <input
                        type="text"
                        name="eventPlace"
                        value={eventData.eventPlace}
                        onChange={handleInputChange}
                        placeholder="Enter event location"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Event Image
                    </label>
                    <div
                      className={`h-72 w-full border-2 ${previewImage ? "border-solid border-gray-200" : "border-dashed border-indigo-300"} rounded-xl transition-all duration-300 overflow-hidden group relative ${!previewImage && "hover:border-indigo-500 hover:bg-indigo-50"}`}
                    >
                      {previewImage ? (
                        <div className="relative h-full">
                          <img
                            src={previewImage}
                            alt="Cover Preview"
                            className="h-full w-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-300">
                            <label
                              htmlFor="coverImageUpload"
                              className="opacity-0 group-hover:opacity-100 px-4 py-2 bg-white text-indigo-600 rounded-lg cursor-pointer transform transition-all duration-300 hover:scale-105 font-medium"
                            >
                              Change Image
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center">
                          <svg
                            className="w-16 h-16 text-indigo-400 mb-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <label
                            htmlFor="coverImageUpload"
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg cursor-pointer transition-all duration-300 hover:bg-indigo-700 shadow-md"
                          >
                            Upload Image
                          </label>
                          <p className="text-gray-500 text-sm mt-2">
                            Max. size: 500KB
                          </p>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        id="coverImageUpload"
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={eventData.description}
                    onChange={handleInputChange}
                    placeholder="Enter event description"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 h-32 resize-none shadow-sm"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <MultiSelectDropdown
                    label="Branch"
                    options={branchOptions}
                    values={eventData.branches}
                    isOpen={isBranchDropdownOpen}
                    toggleOpen={() => setIsBranchDropdownOpen((prev) => !prev)}
                    onChange={(selected) =>
                      setEventData((prev) => ({ ...prev, branches: selected }))
                    }
                    innerRef={branchRef}
                  />
                  <MultiSelectDropdown
                    label="Year"
                    options={yearOptions}
                    values={eventData.years}
                    isOpen={isYearDropdownOpen}
                    toggleOpen={() => setIsYearDropdownOpen((prev) => !prev)}
                    onChange={(selected) =>
                      setEventData((prev) => ({ ...prev, years: selected }))
                    }
                    innerRef={yearRef}
                  />
                  <MultiSelectDropdown
                    label="Department"
                    options={departmentOptions}
                    values={eventData.departments}
                    isOpen={isDepartmentDropdownOpen}
                    toggleOpen={() =>
                      setIsDepartmentDropdownOpen((prev) => !prev)
                    }
                    onChange={(selected) =>
                      setEventData((prev) => ({
                        ...prev,
                        departments: selected,
                      }))
                    }
                    innerRef={departmentRef}
                  />
                </div>
                {/* Modified Event Schedule Section */}
                <div className="space-y-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Event Schedule
                  </label>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Half: Date */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div
                            onClick={() =>
                              setEventData((prev) => ({
                                ...prev,
                                isDateRangeEnabled: !prev.isDateRangeEnabled,
                                endDate: null,
                              }))
                            }
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${eventData.isDateRangeEnabled ? "bg-indigo-600 border-indigo-600" : "border-gray-400 hover:border-indigo-400"}`}
                          >
                            {eventData.isDateRangeEnabled && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="ml-2 text-gray-700 font-medium">
                            Enable date range
                          </span>
                        </div>
                        {eventData.isDateRangeEnabled ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Start Date
                              </label>
                              <DatePicker
                                wrapperClassName={datePickerWrapperClass}
                                selected={eventData.startDate}
                                onChange={(date: Date | null) =>
                                  setEventData((prev) => ({
                                    ...prev,
                                    startDate: date,
                                  }))
                                }
                                placeholderText="Select start date"
                                dateFormat="MMMM d, yyyy"
                                className={datePickerClass}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                End Date
                              </label>
                              <DatePicker
                                wrapperClassName={datePickerWrapperClass}
                                selected={eventData.endDate}
                                onChange={(date: Date | null) =>
                                  setEventData((prev) => ({
                                    ...prev,
                                    endDate: date,
                                  }))
                                }
                                placeholderText="Select end date"
                                dateFormat="MMMM d, yyyy"
                                className={datePickerClass}
                                minDate={eventData.startDate || new Date()}
                                required={eventData.isDateRangeEnabled}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Event Date
                            </label>
                            <DatePicker
                              wrapperClassName={datePickerWrapperClass}
                              selected={eventData.startDate}
                              onChange={(date: Date | null) =>
                                setEventData((prev) => ({
                                  ...prev,
                                  startDate: date,
                                }))
                              }
                              placeholderText="Select event date"
                              dateFormat="MMMM d, yyyy"
                              className={datePickerClass}
                              required
                            />
                          </div>
                        )}
                      </div>
                      {/* Right Half: Time */}
                      <div>
                        <div className="flex items-center mb-4">
                          <div
                            onClick={() =>
                              setEventData((prev) => ({
                                ...prev,
                                isTimeRangeEnabled: !prev.isTimeRangeEnabled,
                                endTime: null,
                              }))
                            }
                            className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${eventData.isTimeRangeEnabled ? "bg-indigo-600 border-indigo-600" : "border-gray-400 hover:border-indigo-400"}`}
                          >
                            {eventData.isTimeRangeEnabled && (
                              <div className="w-2 h-2 rounded-full bg-white m-auto"></div>
                            )}
                          </div>
                          <span className="ml-2 text-gray-700 font-medium">
                            Enable time range
                          </span>
                        </div>
                        {eventData.isTimeRangeEnabled ? (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                Start Time
                              </label>
                              <DatePicker
                                wrapperClassName={datePickerWrapperClass}
                                selected={eventData.startTime}
                                onChange={(date: Date | null) =>
                                  setEventData((prev) => ({
                                    ...prev,
                                    startTime: date,
                                  }))
                                }
                                placeholderText="Select start time"
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className={datePickerClass}
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-gray-700 font-medium mb-2">
                                End Time
                              </label>
                              <DatePicker
                                wrapperClassName={datePickerWrapperClass}
                                selected={eventData.endTime}
                                onChange={(date: Date | null) =>
                                  setEventData((prev) => ({
                                    ...prev,
                                    endTime: date,
                                  }))
                                }
                                placeholderText="Select end time"
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                timeCaption="Time"
                                dateFormat="h:mm aa"
                                className={datePickerClass}
                                required={eventData.isTimeRangeEnabled}
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-gray-700 font-medium mb-2">
                              Event Time
                            </label>
                            <DatePicker
                              wrapperClassName={datePickerWrapperClass}
                              selected={eventData.startTime}
                              onChange={(date: Date | null) =>
                                setEventData((prev) => ({
                                  ...prev,
                                  startTime: date,
                                }))
                              }
                              placeholderText="Select event time"
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={15}
                              timeCaption="Time"
                              dateFormat="h:mm aa"
                              className={datePickerClass}
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Payment Details Section */}
                <div className="space-y-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Payment Details
                  </label>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-gray-800 font-medium mb-3">
                          Registration Fees?
                        </label>
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center cursor-pointer group">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${eventData.registrationFeeOption ? "bg-indigo-600 border-indigo-600" : "border-gray-400 group-hover:border-indigo-400"}`}
                            >
                              {eventData.registrationFeeOption && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="registrationFeeOption"
                              value="yes"
                              checked={eventData.registrationFeeOption === true}
                              onChange={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  registrationFeeOption: true,
                                }))
                              }
                              className="hidden"
                            />
                            <span className="ml-2 text-gray-800">Yes</span>
                          </label>
                          <label className="flex items-center cursor-pointer group">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${!eventData.registrationFeeOption ? "bg-indigo-600 border-indigo-600" : "border-gray-400 group-hover:border-indigo-400"}`}
                            >
                              {!eventData.registrationFeeOption && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="registrationFeeOption"
                              value="no"
                              checked={
                                eventData.registrationFeeOption === false
                              }
                              onChange={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  registrationFeeOption: false,
                                  registrationFee: "",
                                }))
                              }
                              className="hidden"
                            />
                            <span className="ml-2 text-gray-800">No</span>
                          </label>
                        </div>
                      </div>
                      <div
                        className={`transition-opacity duration-300 ${!eventData.registrationFeeOption ? "opacity-50" : "opacity-100"}`}
                      >
                        <label className="block text-gray-800 font-medium mb-2">
                          Registration Fee Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            name="registrationFee"
                            value={eventData.registrationFee}
                            onChange={handleInputChange}
                            placeholder="Enter amount"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                            disabled={!eventData.registrationFeeOption}
                            required={eventData.registrationFeeOption}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-gray-800 font-medium mb-3">
                          Refund Option?
                        </label>
                        <div className="flex items-center space-x-6">
                          <label className="flex items-center cursor-pointer group">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${eventData.refundOption ? "bg-indigo-600 border-indigo-600" : "border-gray-400 group-hover:border-indigo-400"}`}
                            >
                              {eventData.refundOption && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="refundOption"
                              value="yes"
                              checked={eventData.refundOption === true}
                              onChange={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  refundOption: true,
                                }))
                              }
                              className="hidden"
                            />
                            <span className="ml-2 text-gray-800">Yes</span>
                          </label>
                          <label className="flex items-center cursor-pointer group">
                            <div
                              className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${!eventData.refundOption ? "bg-indigo-600 border-indigo-600" : "border-gray-400 group-hover:border-indigo-400"}`}
                            >
                              {!eventData.refundOption && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <input
                              type="radio"
                              name="refundOption"
                              value="no"
                              checked={eventData.refundOption === false}
                              onChange={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  refundOption: false,
                                  refundAmount: "",
                                  refundDate: null,
                                }))
                              }
                              className="hidden"
                            />
                            <span className="ml-2 text-gray-800">No</span>
                          </label>
                        </div>
                      </div>
                      <div
                        className={`transition-opacity duration-300 ${!eventData.refundOption ? "opacity-50" : "opacity-100"}`}
                      >
                        <label className="block text-gray-800 font-medium mb-2">
                          Refund Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            name="refundAmount"
                            value={eventData.refundAmount}
                            onChange={handleInputChange}
                            placeholder="Enter amount"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                            disabled={!eventData.refundOption}
                            required={eventData.refundOption}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-gray-800 font-medium mb-2">
                          Registration Cancellation Date
                        </label>
                        <DatePicker
                          wrapperClassName={datePickerWrapperClass}
                          selected={eventData.cancellationDate}
                          onChange={(date: Date | null) =>
                            setEventData((prev) => ({
                              ...prev,
                              cancellationDate: date,
                            }))
                          }
                          placeholderText="Select cancellation date"
                          dateFormat="MMMM d, yyyy"
                          className={datePickerClass}
                          disabled={!eventData.startDate}
                          minDate={
                            eventData.startDate
                              ? new Date(
                                  eventData.startDate.getTime() -
                                    5 * 24 * 60 * 60 * 1000,
                                )
                              : undefined
                          }
                          maxDate={
                            eventData.startDate
                              ? new Date(
                                  eventData.startDate.getTime() -
                                    2 * 24 * 60 * 60 * 1000,
                                )
                              : undefined
                          }
                        />
                      </div>
                      <div
                        className={`transition-opacity duration-300 ${!eventData.refundOption ? "opacity-50" : "opacity-100"}`}
                      >
                        <label className="block text-gray-800 font-medium mb-2">
                          Refund Valid Until
                        </label>
                        <DatePicker
                          wrapperClassName={datePickerWrapperClass}
                          selected={eventData.refundDate}
                          onChange={(date: Date | null) =>
                            setEventData((prev) => ({
                              ...prev,
                              refundDate: date,
                            }))
                          }
                          placeholderText="Select refund deadline"
                          dateFormat="MMMM d, yyyy"
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 shadow-sm"
                          disabled={!eventData.refundOption}
                          required={eventData.refundOption}
                          minDate={new Date()}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <button
                    type="submit"
                    className="w-full md:w-auto px-10 py-3 bg-indigo-600 text-white font-semibold rounded-full transition transform hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
