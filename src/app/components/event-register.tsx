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

// Firebase imports
import { db, auth } from "@/app/firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";

// ----------------------------
// Custom Hook: Fetch User Role
// ----------------------------
function useUserRole() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userChecked, setUserChecked] = useState(false);

  useEffect(() => {
    async function fetchUserRole() {
      if (auth.currentUser) {
        // Corrected collection name: "users" instead of "user"
        const docRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserRole(data.role);
        } else {
          console.error("User document does not exist!");
        }
      }
      setUserChecked(true);
    }
    fetchUserRole();
  }, []);

  return { userRole, userChecked };
}

// ----------------------------
// Types & Interfaces
// ----------------------------
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
  coverImage: string; // using Base64 string for image data
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

// ----------------------------
// Reusable Styling
// ----------------------------
const inputClasses =
  "w-full h-12 px-4 border border-gray-300 rounded-lg text-base " +
  "focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200";

const labelClasses = "block text-gray-700 text-lg font-semibold mb-2";

// ----------------------------
// MultiSelectDropdown Component
// ----------------------------
const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  values,
  isOpen,
  toggleOpen,
  onChange,
  innerRef,
}) => {
  // Display text: if all options are selected, show "All"
  let displayText = `Select ${label}`;
  if (values.length === options.length && options.length > 0) {
    displayText = "All";
  } else if (values.length > 0) {
    displayText = values.join(", ");
  }

  const handleOptionChange = (optionValue: string) => {
    if (optionValue === "all") {
      // If "all" is clicked: if not all selected, then select all; if all selected, clear selection.
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
      <label className={labelClasses}>{label}</label>
      <div
        onClick={toggleOpen}
        className={`${inputClasses} flex items-center justify-between cursor-pointer hover:shadow-md`}
      >
        <span className={values.length ? "text-gray-800" : "text-gray-400"}>
          {displayText}
        </span>
        <svg
          className="w-5 h-5 text-gray-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293
               a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden transition-all duration-200">
          {/* "All" option */}
          <label
            key="all"
            className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors duration-200 text-gray-700"
            onClick={() => handleOptionChange("all")}
          >
            <input
              type="checkbox"
              checked={values.length === options.length}
              readOnly
              className="mr-2"
            />
            All
          </label>
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-100 transition-colors duration-200 text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleOptionChange(option.value)}
                  className="mr-2"
                />
                {option.label}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ----------------------------
// Main Form Component
// ----------------------------
export default function EventRegistrationForm() {
  const router = useRouter();
  const { userRole, userChecked } = useUserRole();

  // Check if user is logged in
  if (!auth.currentUser) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p>You must be logged in to create or edit events.</p>
      </div>
    );
  }

  // If user role is "student", show access denied.
  if (userChecked && userRole && userRole === "student") {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p>You are not authorized to create or edit events.</p>
      </div>
    );
  }

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
    coverImage: "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Dropdown toggles
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState(false);

  // Refs for detecting outside clicks
  const branchRef = useRef<HTMLDivElement | null>(null);
  const yearRef = useRef<HTMLDivElement | null>(null);
  const departmentRef = useRef<HTMLDivElement | null>(null);

  // Modal message for feedback
  const [modalMessage, setModalMessage] = useState("");

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

  // Convert file to Base64 string and update state
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        setEventData((prev) => ({ ...prev, coverImage: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure user is logged in before submitting
    if (!auth.currentUser) {
      setModalMessage("You must be logged in to submit an event.");
      return;
    }

    // Validation: All fields must be filled
    if (
      !eventData.eventName ||
      !eventData.organisingCommittee ||
      !eventData.eventPlace ||
      !eventData.description ||
      eventData.branches.length === 0 ||
      eventData.years.length === 0 ||
      eventData.departments.length === 0 ||
      !eventData.startDate ||
      !eventData.endDate ||
      !eventData.startTime ||
      !eventData.coverImage
    ) {
      setModalMessage("Please fill in all required fields.");
      return;
    }

    // Validate date order: start date must be before end date
    if (eventData.startDate && eventData.endDate) {
      if (eventData.startDate > eventData.endDate) {
        setModalMessage("Start Date must be before End Date.");
        return;
      }
    }

    try {
      // Build event object with "createdBy" field.
      const eventToStore = {
        ...eventData,
        startDate: eventData.startDate,
        endDate: eventData.endDate,
        startTime: eventData.startTime,
        createdBy: auth.currentUser.uid,
      };

      const docRef = await addDoc(collection(db, "events"), eventToStore);
      console.log("Event stored with ID:", docRef.id);
      setModalMessage("Event registered successfully!");
      setTimeout(() => {
        router.push("/events-dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error adding document:", error);
      setModalMessage("Error registering event: " + error.message);
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

  return (
    <>
      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setModalMessage("")}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-2">Notification</h3>
            <p className="text-lg mb-4 text-green-600">{modalMessage}</p>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => setModalMessage("")}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-5xl space-y-8 mx-auto">
          {/* Title Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-center text-3xl font-extrabold text-gray-800">
              Register Your Events
            </h2>
          </div>
          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-8 text-gray-800">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className={labelClasses}>Event Name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={eventData.eventName}
                      onChange={handleInputChange}
                      placeholder="Enter event name"
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Organising Committee</label>
                    <input
                      type="text"
                      name="organisingCommittee"
                      value={eventData.organisingCommittee}
                      onChange={handleInputChange}
                      placeholder="Enter organizing committee"
                      required
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className={labelClasses}>Event Place</label>
                    <input
                      type="text"
                      name="eventPlace"
                      value={eventData.eventPlace}
                      onChange={handleInputChange}
                      placeholder="Enter event location"
                      required
                      className={inputClasses}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-72 w-full border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg transition-all duration-200 hover:border-blue-400">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Cover Preview"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <label
                          htmlFor="coverImageUpload"
                          className="mt-2 inline-block px-6 py-2 bg-blue-600 text-white rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
                        >
                          Upload Image
                        </label>
                        <label className={labelClasses}>
                          Event Image Max. 500kb
                        </label>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="coverImageUpload"
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className={labelClasses}>Description</label>
                <textarea
                  name="description"
                  value={eventData.description}
                  onChange={handleInputChange}
                  placeholder="Enter event description"
                  required
                  className={`${inputClasses} h-24 resize-none`}
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
                    setEventData((prev) => ({ ...prev, departments: selected }))
                  }
                  innerRef={departmentRef}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className={labelClasses}>Start Date</label>
                  <DatePicker
                    wrapperClassName="w-full"
                    selected={eventData.startDate}
                    onChange={(date: Date | null) =>
                      setEventData((prev) => ({ ...prev, startDate: date }))
                    }
                    placeholderText="Start Date"
                    dateFormat="MMMM d, yyyy"
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>End Date</label>
                  <DatePicker
                    wrapperClassName="w-full"
                    selected={eventData.endDate}
                    onChange={(date: Date | null) =>
                      setEventData((prev) => ({ ...prev, endDate: date }))
                    }
                    placeholderText="End Date"
                    dateFormat="MMMM d, yyyy"
                    className={inputClasses}
                    minDate={eventData.startDate || new Date()}
                    required
                  />
                </div>
                <div>
                  <label className={labelClasses}>Timing</label>
                  <DatePicker
                    wrapperClassName="w-full"
                    selected={eventData.startTime}
                    onChange={(date: Date | null) =>
                      setEventData((prev) => ({ ...prev, startTime: date }))
                    }
                    placeholderText="Timing"
                    showTimeSelect
                    showTimeSelectOnly
                    timeIntervals={15}
                    timeCaption="Time"
                    dateFormat="h:mm aa"
                    className={inputClasses}
                    required
                  />
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
    </>
  );
}
