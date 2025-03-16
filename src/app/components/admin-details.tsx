"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";

interface AdminDetails {
  surnameTitle: string;
  adminName: string;
  lastName: string;
  emailId: string;
  department: string;
  profilePhotoURL: string;
  role: string; // "admin"
  uid: string;
}

const initialAdminDetails: AdminDetails = {
  surnameTitle: "",
  adminName: "",
  lastName: "",
  emailId: "",
  department: "",
  profilePhotoURL: "",
  role: "admin",
  uid: "",
};

const AdminDetailsForm: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [formData, setFormData] = useState<AdminDetails>(initialAdminDetails);

  useEffect(() => {
    const authInstance = getAuth();
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Always set uid and email from the auth user.
        setFormData((prev) => ({
          ...prev,
          uid: user.uid,
          emailId: user.email || "",
        }));

        // We'll prefill data from the admin doc if it exists,
        // then override missing fields with host data, and finally student data.
        let prefillData: Partial<AdminDetails> = {};

        try {
          // 1. Try to fetch admin document.
          const adminDocRef = doc(db, "admin", user.uid);
          const adminDocSnap = await getDoc(adminDocRef);
          if (adminDocSnap.exists() && adminDocSnap.data().role === "admin") {
            const adminData = adminDocSnap.data();
            prefillData = {
              surnameTitle: adminData.surnameTitle || "",
              adminName: adminData.firstName || adminData.adminName || "",
              lastName: "", // Always force lastName empty.
              emailId: adminData.email || user.email || "",
              department: adminData.department || "",
              profilePhotoURL: adminData.profilePhoto || "",
              role: "admin",
              uid: user.uid,
            };
          }

          // 2. For missing fields, try to fetch from host collection.
          if (
            !prefillData.surnameTitle ||
            !prefillData.department ||
            !prefillData.profilePhotoURL ||
            !prefillData.adminName
          ) {
            const hostDocRef = doc(db, "host", user.uid);
            const hostDocSnap = await getDoc(hostDocRef);
            if (hostDocSnap.exists()) {
              const hostData = hostDocSnap.data();
              if (!prefillData.surnameTitle) {
                prefillData.surnameTitle = hostData.surname || "";
              }
              if (!prefillData.adminName) {
                prefillData.adminName = hostData.hostName || "";
              }
              // Force lastName empty.
              prefillData.lastName = "";
              if (!prefillData.department) {
                prefillData.department = hostData.department || "";
              }
              if (!prefillData.profilePhotoURL) {
                prefillData.profilePhotoURL = hostData.profilePhoto || "";
              }
            }
          }

          // 3. If still missing, try to fetch from student collection.
          if (
            !prefillData.surnameTitle ||
            !prefillData.adminName ||
            !prefillData.department ||
            !prefillData.profilePhotoURL
          ) {
            const studentDocRef = doc(db, "student", user.uid);
            const studentDocSnap = await getDoc(studentDocRef);
            if (studentDocSnap.exists()) {
              const studentData = studentDocSnap.data();
              if (!prefillData.surnameTitle) {
                // Use student's lastName for surnameTitle.
                prefillData.surnameTitle = studentData.lastName || "";
              }
              if (!prefillData.adminName) {
                prefillData.adminName = studentData.firstName || "";
              }
              if (!prefillData.department) {
                prefillData.department = studentData.department || "";
              }
              if (!prefillData.profilePhotoURL) {
                prefillData.profilePhotoURL = studentData.profilePhoto || "";
              }
              // Force lastName empty.
              prefillData.lastName = "";
            }
          }

          // Always use email from auth.
          prefillData.emailId = user.email || prefillData.emailId || "";

          // Update formData state.
          setFormData((prev) => ({
            ...prev,
            surnameTitle: prefillData.surnameTitle || prev.surnameTitle,
            adminName: prefillData.adminName || prev.adminName,
            lastName: "", // always force lastName empty
            department: prefillData.department || prev.department,
            profilePhotoURL:
              prefillData.profilePhotoURL || prev.profilePhotoURL,
            emailId: user.email || prev.emailId,
            role: "admin",
            uid: user.uid,
          }));

          if (prefillData.profilePhotoURL) {
            setPreviewImage(prefillData.profilePhotoURL);
          }
        } catch (error) {
          console.error("Error fetching prefill data for admin:", error);
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

  // Handle image upload: preview locally and upload to Firebase Storage.
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    // Create a local preview.
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setLoading(true);
    try {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `profile-photos/${currentUser.uid}/${Date.now()}-${file.name}`,
      );
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setFormData((prev) => ({ ...prev, profilePhotoURL: downloadURL }));
    } catch (error) {
      console.error("Error uploading image: ", error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert("You must be logged in to submit this form");
      return;
    }
    // Validate required fields.
    if (
      !formData.adminName ||
      !formData.lastName || // This field must be manually entered.
      !formData.department ||
      !formData.profilePhotoURL
    ) {
      alert("Please fill in all required fields and upload a profile photo.");
      return;
    }
    setLoading(true);
    try {
      const adminDocRef = doc(db, "admin", currentUser.uid);
      const adminDocSnap = await getDoc(adminDocRef);
      if (adminDocSnap.exists()) {
        // Update existing document.
        await updateDoc(adminDocRef, {
          firstName: formData.adminName,
          lastName: formData.lastName,
          email: formData.emailId,
          department: formData.department,
          profilePhoto: formData.profilePhotoURL,
          surnameTitle: formData.surnameTitle,
          role: "admin",
          updatedAt: new Date(),
        });
      } else {
        // Create new document.
        await setDoc(adminDocRef, {
          firstName: formData.adminName,
          lastName: formData.lastName,
          email: formData.emailId,
          department: formData.department,
          profilePhoto: formData.profilePhotoURL,
          surnameTitle: formData.surnameTitle,
          role: "admin",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      alert("Your admin details have been saved successfully!");
      router.push("/admin-dashboard");
    } catch (error: any) {
      console.error("Error submitting admin form: ", error);
      alert("Error saving your information. Please try again.");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-12 w-12 text-purple-600">
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-purple-50 to-white">
      <div className="bg-white rounded-2xl p-8 md:p-10 shadow-2xl max-w-5xl mx-auto border border-purple-100">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-purple-700 tracking-tight">
            ADMIN DETAILS
          </h1>
          <div className="h-1 w-24 bg-purple-600 mx-auto mt-3 rounded-full"></div>
          <p className="text-gray-600 mt-4 max-w-md mx-auto text-lg">
            Complete your administrator profile
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* First row: Personal details and photo upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left side: Personal details */}
            <div className="space-y-6 bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <div>
                <label
                  htmlFor="surnameTitle"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Surname Title:
                </label>
                <input
                  type="text"
                  id="surnameTitle"
                  name="surnameTitle"
                  placeholder="e.g., Mr., Mrs., Dr."
                  value={formData.surnameTitle}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-transparent transition duration-200 shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="adminName"
                  className="block text-base font-medium text-gray-700 mb-2"
                >
                  Admin Name:
                </label>
                <input
                  type="text"
                  id="adminName"
                  name="adminName"
                  placeholder="Your first name"
                  value={formData.adminName}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-transparent transition duration-200 shadow-sm"
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
                  placeholder="Your last name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-transparent transition duration-200 shadow-sm"
                  required
                />
              </div>
            </div>
            {/* Right side: Photo upload */}
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center">
              <div
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center overflow-hidden relative cursor-pointer group shadow-lg hover:shadow-xl transition-all duration-300 border-4 border-dashed border-purple-200 hover:border-purple-400"
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
                      <p className="text-white font-medium text-lg px-4 py-2 bg-purple-600 rounded-full">
                        Change Photo
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-purple-600 mx-auto mb-3"
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
                    <p className="text-purple-700 font-medium">Upload Photo</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Upload Image as Profile Photo
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
            </div>
          </div>

          {/* Second row: Email ID and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
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
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-transparent transition duration-200 shadow-sm bg-gray-100"
                required
                readOnly
              />
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
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
                placeholder="e.g., IT, Management, Operations"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-purple-400 focus:border-transparent transition duration-200 shadow-sm"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-center mt-10">
            <button
              type="submit"
              disabled={loading}
              className="py-4 px-10 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium text-lg rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none w-1/2 max-w-xs"
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
                "SUBMIT"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDetailsForm;
