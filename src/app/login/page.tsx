"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/app/firebase"; // adjust the import path if needed
import { doc, setDoc, getDoc } from "firebase/firestore";

// Define interfaces for form data and errors
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

// Helper function to check if student details have been submitted
// (Checks if rollNo, yearOfStudy, department, branch, and profilePhoto exist in the "users" doc)
const checkStudentDetails = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return (
        !!data.rollNo &&
        !!data.yearOfStudy &&
        !!data.department &&
        !!data.branch &&
        !!data.profilePhoto
      );
    }
    return false;
  } catch (error) {
    console.error("Error checking student details:", error);
    return false;
  }
};

function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [modalMessage, setModalMessage] = useState("");

  // Helper function to fetch the user role from Firestore.
  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.role || "student";
      }
      return "student";
    } catch (error) {
      console.error("Error fetching user role:", error);
      return "student";
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long.";
    }
    if (isSignup && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle email/password login or signup
  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalMessage(""); // reset modal message

    if (!validateForm()) return;

    try {
      if (isSignup) {
        // Public signup is only for students.
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: `${formData.firstName} ${formData.lastName}`,
          });
          // Save user role in Firestore as "student" with merged fields (no duplicates)
          await setDoc(doc(db, "users", auth.currentUser.uid), {
            role: "student",
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          });
        }
        // Sign out after signup so the user must log in
        await auth.signOut();
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
        });
        setIsSignup(false);
        // Show success message in modal (green text)
        setModalMessage("Signup successful. Please log in.");
      } else {
        // Login with email and password
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const uid = userCredential.user.uid;
        const role = await fetchUserRole(uid);
        if (role === "admin") {
          router.push("/admin-dashboard");
        } else if (role === "host") {
          router.push("/event-register");
        } else {
          // For student, check if additional details have been submitted
          const detailsExist = await checkStudentDetails(uid);
          if (detailsExist) {
            router.push("/student-dashboard");
          } else {
            router.push("/student-details");
          }
        }
      }
    } catch (error: any) {
      setModalMessage(error.message);
    }
  };

  // Handle Google Authentication
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      const role = await fetchUserRole(uid);
      if (role === "admin") {
        router.push("/admin-dashboard");
      } else if (role === "host") {
        router.push("/event-register");
      } else {
        const detailsExist = await checkStudentDetails(uid);
        if (detailsExist) {
          router.push("/student-dashboard");
        } else {
          router.push("/student-details");
        }
      }
    } catch (error: any) {
      setModalMessage(error.message);
    }
  };

  // Social buttons component with Google button
  const SocialButtons = () => (
    <div className="mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 text-gray-500 bg-white">Or continue with</span>
        </div>
      </div>

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <img
            className="h-5 w-5 mr-2"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
          />
          <span>Google</span>
        </button>
      </div>
    </div>
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      {/* Modal */}
      {modalMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setModalMessage("")}
          ></div>
          <div className="bg-white rounded-lg shadow-xl p-6 z-10 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold mb-2">
              {modalMessage.includes("successful") ? "Success" : "Error"}
            </h3>
            <p
              className={`text-lg mb-4 ${
                modalMessage.includes("successful")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {modalMessage}
            </p>
            <button
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => setModalMessage("")}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-blue-300 to-white animate-slideBackground"></div>
        <div
          className="relative flex w-full max-w-7xl bg-white shadow-lg rounded-3xl overflow-hidden"
          style={{ height: "calc(100vh - 60px)" }}
        >
          {/* Image Side (Left) */}
          <div
            className={`absolute top-0 left-0 h-full w-full md:w-1/2 transition-transform duration-500 ease-in-out ${
              isSignup ? "translate-x-0" : "translate-x-full"
            } z-20 hidden md:block`}
          >
            <img
              src="/assets/logo.jpg"
              width={350}
              height={350}
              alt="Illustration"
              className="w-full h-full object-cover bg-white"
            />
          </div>

          {/* Login Form */}
          <div
            className={`relative flex w-full md:w-2/3 lg:w-2/3 flex-col px-20 py-12 justify-center transition-opacity duration-500 ease-in-out ${
              isSignup ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {/* Back Arrow with circle */}
            <button
              onClick={() => router.push("/")}
              className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 border border-blue-600 rounded-full text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">
              Student Login
            </h2>
            <form onSubmit={handleAuth} className="space-y-6 relative">
              <div className="relative">
                <label className="block text-blue-600 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                    errors.email ? "border-red-500" : "border-blue-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-2 hover:ring-blue-400`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <label className="block text-blue-600 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border transition-all duration-300 ${
                      errors.password ? "border-red-500" : "border-blue-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 hover:ring-2 hover:ring-blue-400`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Log In
                </button>
              </div>

              <SocialButtons />
            </form>

            <p className="mt-6 text-center text-black">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignup(true)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Sign Up
              </button>
            </p>
          </div>

          {/* Signup Form */}
          <div
            className={`relative flex w-full md:w-2/3 lg:w-2/3 flex-col px-20 py-12 transition-opacity duration-500 ease-in-out ${
              isSignup ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            {/* Back Arrow with circle */}
            <button
              onClick={() => router.push("/")}
              className="absolute top-6 left-6 flex items-center justify-center w-10 h-10 border border-blue-600 rounded-full text-blue-600 hover:bg-blue-50"
            >
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">
              Create an Account
            </h2>

            <form onSubmit={handleAuth} className="space-y-6 relative">
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.firstName ? "border-red-500" : "border-blue-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="First name"
                  />
                  {errors.firstName && (
                    <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="w-1/2">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.lastName ? "border-red-500" : "border-blue-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Last name"
                  />
                  {errors.lastName && (
                    <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email ? "border-red-500" : "border-blue-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="E-mail"
                />
                {errors.email && (
                  <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    type={showPassword2 ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.password ? "border-red-500" : "border-blue-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="relative">
                  <input
                    type={showPassword1 ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.confirmPassword
                        ? "border-red-500"
                        : "border-blue-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword1(!showPassword1)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="absolute text-sm mt-1 top-full left-0 text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign Up
              </button>

              <SocialButtons />
            </form>

            <p className="mt-6 text-center text-black">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignup(false)}
                className="text-blue-600 hover:underline focus:outline-none"
              >
                Log In
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
