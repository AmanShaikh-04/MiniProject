"use client";

import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/app/firebase"; // Ensure your firebase.ts exports both db and auth
import { doc, setDoc, getDoc } from "firebase/firestore";

// Define interface for student data
interface StudentData {
  surnameName: string;
  studentName: string;
  fatherName: string;
  emailId: string;
  rollNo: string;
  yearOfStudy: string;
  department: string; // single selection
  branch: string;
  profilePhoto: File | null;
}

// Define interface for dropdown options
interface DropdownOption {
  value: string;
  label: string;
}

export default function StudentDetailsForm() {
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.currentUser) {
      router.push("/login");
    }
  }, [router]);

  const [studentData, setStudentData] = useState<StudentData>({
    surnameName: "",
    studentName: "",
    fatherName: "",
    emailId: "",
    rollNo: "",
    yearOfStudy: "",
    department: "",
    branch: "",
    profilePhoto: null,
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Fetch already stored data from student collection and pre-fill the form
  useEffect(() => {
    async function fetchUserData() {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "student", auth.currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setStudentData({
              surnameName: data.lastName || "",
              studentName: data.firstName || "",
              fatherName: data.fatherName || "",
              emailId: data.email || "",
              rollNo: data.rollNo || "",
              yearOfStudy: data.yearOfStudy || "",
              department: data.department || "",
              branch: data.branch || "",
              profilePhoto: null,
            });
            if (data.profilePhoto) {
              setPreviewImage(data.profilePhoto);
            }
          }
        } catch (error) {
          console.error("Error fetching student data: ", error);
        }
      }
    }
    fetchUserData();
  }, []);

  // Dropdown toggles (open/close)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState<boolean>(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] =
    useState<boolean>(false);
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] =
    useState<boolean>(false);

  // Refs for outside click detection
  const branchRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const departmentRef = useRef<HTMLDivElement>(null);

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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle file upload with Base64 conversion and size check (max 1 MB)
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1048576) {
        alert("Image size exceeds 1 MB. Please choose a smaller image.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setStudentData((prev) => ({
          ...prev,
          profilePhoto: file,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check that all fields are filled
    if (
      !studentData.surnameName ||
      !studentData.studentName ||
      !studentData.fatherName ||
      !studentData.emailId ||
      !studentData.rollNo ||
      !studentData.yearOfStudy ||
      !studentData.department ||
      !studentData.branch ||
      !previewImage
    ) {
      alert("Please fill in all fields and upload an image.");
      return;
    }

    try {
      const studentToStore = {
        firstName: studentData.studentName,
        lastName: studentData.surnameName,
        fatherName: studentData.fatherName,
        email: studentData.emailId,
        rollNo: studentData.rollNo,
        yearOfStudy: studentData.yearOfStudy,
        department: studentData.department,
        branch: studentData.branch,
        profilePhoto: previewImage, // Base64 string
      };

      if (auth.currentUser) {
        await setDoc(doc(db, "student", auth.currentUser.uid), studentToStore, {
          merge: true,
        });
        console.log("Student Data stored:", studentToStore);
        router.push("/student-dashboard");
      } else {
        alert("No authenticated user found.");
      }
    } catch (error: any) {
      console.error("Error storing student data:", error);
      alert("Error storing data: " + error.message);
    }
  };

  const yearOfStudyOptions: DropdownOption[] = [
    { value: "1st", label: "1st Year" },
    { value: "2nd", label: "2nd Year" },
    { value: "3rd", label: "3rd Year" },
    { value: "4th", label: "4th Year" },
  ];

  const branchOptions: DropdownOption[] = [
    { value: "CSE", label: "Computer Science" },
    { value: "ECE", label: "Electronics" },
    { value: "MECH", label: "Mechanical" },
    { value: "CIVIL", label: "Civil" },
  ];

  const departmentOptions: DropdownOption[] = [
    { value: "Science", label: "Science" },
    { value: "Arts", label: "Arts" },
    { value: "Commerce", label: "Commerce" },
    { value: "Engineering", label: "Engineering" },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto border border-blue-100">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-700 tracking-tight">
            STUDENT DETAILS
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto mt-3 rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-md mx-auto text-lg">
            Complete your profile information to continue
          </p>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-10">
          {/* Top Section: Personal Information & Profile Photo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Personal Information */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Personal Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Surname Name:
                  </label>
                  <input
                    type="text"
                    name="surnameName"
                    placeholder="Enter surname"
                    value={studentData.surnameName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Student Name:
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    placeholder="Enter full name"
                    value={studentData.studentName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Father Name:
                  </label>
                  <input
                    type="text"
                    name="fatherName"
                    placeholder="Enter father's name"
                    value={studentData.fatherName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            {/* Profile Photo */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Profile Photo
              </h2>
              <div
                className="w-60 h-60 rounded-full flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={triggerFileInput}
              >
                {previewImage ? (
                  <>
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded-full">
                      <p className="text-white font-medium text-lg px-4 py-2 bg-blue-600 rounded-full transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
                        Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full rounded-full bg-blue-50 flex flex-col items-center justify-center border-4 border-dashed border-blue-200 group-hover:border-blue-400 transition-all duration-300">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-3 shadow-md group-hover:bg-blue-200 transition-all duration-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10 text-blue-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <p className="text-center text-gray-700 text-lg mb-2 font-medium">
                      Upload Profile Photo
                    </p>
                    <p className="text-center text-gray-500 text-sm">
                      Click to browse files
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
            </div>
          </div>
          {/* Second Section: Contact & Academic Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Contact Information */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    E-mail ID:
                  </label>
                  <input
                    type="email"
                    name="emailId"
                    value={studentData.emailId}
                    readOnly
                    className="w-full p-4 border border-gray-300 rounded-xl bg-gray-100 focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Roll No:
                  </label>
                  <input
                    type="text"
                    name="rollNo"
                    placeholder="Enter roll number"
                    value={studentData.rollNo}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            {/* Academic Details */}
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Academic Details
              </h2>
              <div className="space-y-6">
                {/* Branch Dropdown */}
                <div className="relative" ref={branchRef}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Branch:
                  </label>
                  <div
                    className="w-full p-4 border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    onClick={() =>
                      setIsBranchDropdownOpen(!isBranchDropdownOpen)
                    }
                  >
                    {studentData.branch || "Select Branch"}
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isBranchDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md">
                      {branchOptions.map((option) => (
                        <div
                          key={option.value}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setStudentData((prev) => ({
                              ...prev,
                              branch: option.value,
                            }));
                            setIsBranchDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Year of Study Dropdown */}
                <div className="relative" ref={yearRef}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Year of Study:
                  </label>
                  <div
                    className="w-full p-4 border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    onClick={() => setIsYearDropdownOpen(!isYearDropdownOpen)}
                  >
                    {studentData.yearOfStudy || "Select Year"}
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isYearDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md">
                      {yearOfStudyOptions.map((option) => (
                        <div
                          key={option.value}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setStudentData((prev) => ({
                              ...prev,
                              yearOfStudy: option.value,
                            }));
                            setIsYearDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Department Dropdown */}
                <div className="relative" ref={departmentRef}>
                  <label className="block text-base font-medium text-gray-700 mb-2">
                    Department:
                  </label>
                  <div
                    className="w-full p-4 border border-gray-300 rounded-xl flex items-center justify-between cursor-pointer focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    onClick={() =>
                      setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)
                    }
                  >
                    {studentData.department || "Select Department"}
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  {isDepartmentDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white shadow-lg rounded-md">
                      {departmentOptions.map((option) => (
                        <div
                          key={option.value}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setStudentData((prev) => ({
                              ...prev,
                              department: option.value,
                            }));
                            setIsDepartmentDropdownOpen(false);
                          }}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              className="w-full max-w-md mx-auto block py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
