"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { db, auth } from "@/app/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface HostDetails {
  surname: string;
  hostName: string;
  lastName: string;
  emailId: string;
  department: string;
  organization: string;
  roleInOrganization: string;
  profilePhoto: string; // Base64 string of the image
  role: string; // Should be "host"
  uid: string; // Firebase UID for the user
}

const initialHostDetails: HostDetails = {
  surname: "",
  hostName: "",
  lastName: "",
  emailId: "",
  department: "",
  organization: "",
  roleInOrganization: "",
  profilePhoto: "",
  role: "host",
  uid: "",
};

const HostDetailsForm: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<HostDetails>(initialHostDetails);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Always update uid and emailId from the auth user.
        setFormData((prev) => ({
          ...prev,
          uid: user.uid,
          emailId: user.email || "",
        }));
        try {
          // First, attempt to fetch the host document.
          const hostDocRef = doc(db, "host", user.uid);
          const hostDocSnap = await getDoc(hostDocRef);
          if (hostDocSnap.exists()) {
            const hostData = hostDocSnap.data() as Partial<HostDetails>;
            // If required fields (hostName or surname) are missing, fetch student data for prefill.
            if (!hostData.hostName || !hostData.surname) {
              const studentDocRef = doc(db, "student", user.uid);
              const studentDocSnap = await getDoc(studentDocRef);
              if (studentDocSnap.exists()) {
                const studentData = studentDocSnap.data();
                setFormData({
                  // Use student's lastName as surname.
                  surname: studentData.lastName ?? "",
                  // Use student's firstName as hostName.
                  hostName: studentData.firstName ?? "",
                  // Force lastName input to be empty.
                  lastName: "",
                  emailId:
                    (hostData.emailId ?? studentData.email ?? user.email) || "",
                  // Remove prefill for department.
                  department: "",
                  // Retain organization and roleInOrganization if they exist; otherwise leave empty.
                  organization: hostData.organization ?? "",
                  roleInOrganization: hostData.roleInOrganization ?? "",
                  // Reuse the student's profile photo.
                  profilePhoto: studentData.profilePhoto ?? "",
                  role: "host",
                  uid: user.uid,
                });
                if (studentData.profilePhoto) {
                  setPreviewImage(studentData.profilePhoto);
                }
              }
            } else {
              // If host document exists with prefill data, use it (but force lastName and department to be empty).
              setFormData({
                surname: hostData.surname ?? "",
                hostName: hostData.hostName ?? "",
                lastName: "", // always empty for manual input
                emailId: (hostData.emailId ?? user.email) || "",
                department: "", // remove department prefill
                organization: hostData.organization ?? "",
                roleInOrganization: hostData.roleInOrganization ?? "",
                profilePhoto: hostData.profilePhoto ?? "",
                role: hostData.role ?? "host",
                uid: user.uid,
              });
              if (hostData.profilePhoto) {
                setPreviewImage(hostData.profilePhoto);
              }
            }
          } else {
            // No host document exists; fetch student document for prefill.
            const studentDocRef = doc(db, "student", user.uid);
            const studentDocSnap = await getDoc(studentDocRef);
            if (studentDocSnap.exists()) {
              const studentData = studentDocSnap.data();
              setFormData({
                surname: studentData.lastName ?? "",
                hostName: studentData.firstName ?? "",
                lastName: "", // leave this empty
                emailId: (studentData.email ?? user.email) || "",
                department: "", // remove department prefill
                organization: "",
                roleInOrganization: "",
                profilePhoto: studentData.profilePhoto ?? "",
                role: "host",
                uid: user.uid,
              });
              if (studentData.profilePhoto) {
                setPreviewImage(studentData.profilePhoto);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching host/student data:", error);
        }
        setInitialLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setFormData((prev) => ({ ...prev, profilePhoto: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate that required fields are filled (lastName is intentionally left blank).
    if (
      !formData.surname ||
      !formData.hostName ||
      !formData.department ||
      !formData.organization ||
      !formData.roleInOrganization ||
      !formData.profilePhoto
    ) {
      alert("Please fill in all required fields and upload a profile photo.");
      return;
    }
    setLoading(true);
    try {
      if (currentUser) {
        const hostDocRef = doc(db, "host", currentUser.uid);
        const hostDocSnap = await getDoc(hostDocRef);
        if (hostDocSnap.exists()) {
          await updateDoc(hostDocRef, {
            ...formData,
            updatedAt: new Date(),
          });
        } else {
          await setDoc(hostDocRef, {
            ...formData,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
        alert("Your host details have been saved successfully!");
        router.push("/host-dashboard");
      } else {
        alert("User not authenticated.");
      }
    } catch (error: any) {
      console.error("Error storing host data:", error);
      alert("Error storing data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 text-blue-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl max-w-6xl mx-auto border border-blue-100">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-blue-700 tracking-tight">
            HOST DETAILS
          </h1>
          <div className="h-1 w-24 bg-blue-600 mx-auto mt-3 rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-md mx-auto text-lg">
            Complete your profile information to continue
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {/* Left half: Personal Information */}
          <div className="space-y-6 bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
              Personal Information
            </h2>
            <div>
              <label
                htmlFor="surname"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Surname Title:
              </label>
              <input
                type="text"
                id="surname"
                name="surname"
                placeholder="e.g., Mr., Mrs., Dr."
                value={formData.surname}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="hostName"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Host Name:
              </label>
              <input
                type="text"
                id="hostName"
                name="hostName"
                placeholder="Your first name"
                value={formData.hostName}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                required
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-base font-medium text-gray-700 mb-2"
              >
                Last Name:
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                required
              />
            </div>
          </div>
          {/* Right half: Profile Photo */}
          <div className="flex flex-col bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block self-start">
              Profile Photo
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="w-60 h-60 rounded-full flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={triggerFileInput}
              >
                {previewImage ? (
                  <>
                    <Image
                      src={previewImage}
                      alt="Profile Preview"
                      fill
                      style={{ objectFit: "cover" }}
                      className="rounded-full"
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
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <p className="mt-6 text-sm text-gray-600 bg-blue-50 px-4 py-2 rounded-lg shadow-sm">
                Recommended: square image, at least 300×300px
              </p>
            </div>
          </div>
          {/* Second row: Contact & Organization Details */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="emailId"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    E-mail ID:
                  </label>
                  <input
                    type="email"
                    id="emailId"
                    name="emailId"
                    placeholder="your.email@example.com"
                    value={formData.emailId}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm bg-gray-100"
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label
                    htmlFor="department"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Department:
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    placeholder="e.g., Marketing, HR, Engineering"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b-2 border-blue-200 inline-block">
                Organization Details
              </h2>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="organization"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Organization:
                  </label>
                  <input
                    type="text"
                    id="organization"
                    name="organization"
                    placeholder="Your company or organization name"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="roleInOrganization"
                    className="block text-base font-medium text-gray-700 mb-2"
                  >
                    Role In Organization:
                  </label>
                  <input
                    type="text"
                    id="roleInOrganization"
                    name="roleInOrganization"
                    placeholder="e.g., Manager, Developer, Analyst"
                    value={formData.roleInOrganization}
                    onChange={handleChange}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-400 focus:border-transparent transition duration-200 shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Submit button */}
          <div className="md:col-span-2 mt-8">
            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-md mx-auto block py-4 px-8 text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  SUBMITTING...
                </div>
              ) : (
                "SAVE DETAILS"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostDetailsForm;
