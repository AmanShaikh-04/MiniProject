"use client";

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
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

  // Fetch already stored data from users collection and pre-fill the form
  useEffect(() => {
    async function fetchUserData() {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
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
          console.error("Error fetching user data: ", error);
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
      // Build the student object using primary field names (overwriting duplicate fields)
      const studentToStore = {
        firstName: studentData.studentName, // Overwrites duplicate "studentName"
        lastName: studentData.surnameName, // Overwrites duplicate "surnameName"
        fatherName: studentData.fatherName,
        email: studentData.emailId, // Overwrites duplicate "emailId"
        rollNo: studentData.rollNo,
        yearOfStudy: studentData.yearOfStudy,
        department: studentData.department,
        branch: studentData.branch,
        profilePhoto: previewImage, // Base64 string of the image
      };

      // Update the users collection with the provided data
      if (auth.currentUser) {
        await setDoc(doc(db, "users", auth.currentUser.uid), studentToStore, {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-5xl space-y-8 mx-auto">
        {/* Title Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-center text-3xl font-extrabold text-gray-800">
            Student Details
          </h2>
        </div>
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8 text-gray-800">
            {/* Top Row: Left - Surname, Student Name, Father Name; Right - Image Upload */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">
                    Surname Name
                  </label>
                  <input
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    name="surnameName"
                    value={studentData.surnameName}
                    onChange={handleInputChange}
                    placeholder="Enter surname"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">
                    Student Name
                  </label>
                  <input
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    name="studentName"
                    value={studentData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-lg font-semibold mb-2">
                    Father Name
                  </label>
                  <input
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    name="fatherName"
                    value={studentData.fatherName}
                    onChange={handleInputChange}
                    placeholder="Enter father's name"
                    required
                  />
                </div>
              </div>
              {/* Right Column: Square Image Preview Box */}
              <div className="flex justify-center items-center">
                <div className="h-64 w-64 border-2 border-dashed border-gray-300 flex items-center justify-center relative rounded-lg">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="photoUpload"
                      />
                      <label
                        htmlFor="photoUpload"
                        className="px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition duration-200"
                      >
                        UPLOAD IMAGE
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Second Row: Email and Roll No */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  E-mail ID
                </label>
                <input
                  type="email"
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  name="emailId"
                  value={studentData.emailId}
                  readOnly
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Roll No
                </label>
                <input
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  name="rollNo"
                  value={studentData.rollNo}
                  onChange={handleInputChange}
                  placeholder="Enter roll number"
                  required
                />
              </div>
            </div>
            {/* Third Row: Branch, Year of Study, Department */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Branch */}
              <div className="relative" ref={branchRef}>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Branch
                </label>
                <div
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                >
                  {studentData.branch || "Select Branch"}
                  <svg
                    className="w-5 h-5 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 
                      1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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
              {/* Year of Study */}
              <div className="relative" ref={yearRef}>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Year of Study
                </label>
                <div
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 
                      1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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
              {/* Department */}
              <div className="relative" ref={departmentRef}>
                <label className="block text-gray-700 text-lg font-semibold mb-2">
                  Department
                </label>
                <div
                  className="w-full h-12 px-4 border border-gray-300 rounded-lg text-base flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
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
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 
                      1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
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
  );
}
