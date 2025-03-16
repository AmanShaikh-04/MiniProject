"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/app/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Define interfaces for form data and errors
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role?: "student" | "host" | "admin"; // role will be "student" by default
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
}

// Helper function to check if detailed student information has been submitted.
const checkStudentDetails = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "student", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Adjust these keys as per your student schema.
      return (
        !!data?.rollNo &&
        !!data?.yearOfStudy &&
        !!data?.department &&
        !!data?.branch &&
        !!data?.profilePhoto
      );
    }
    return false;
  } catch (error) {
    console.error("Error checking student details:", error);
    return false;
  }
};

// Helper function to check if detailed host information has been submitted.
const checkHostDetails = async (uid: string) => {
  try {
    const hostDoc = await getDoc(doc(db, "host", uid));
    if (hostDoc.exists()) {
      const data = hostDoc.data();
      // Adjust these keys as per your host schema.
      return !!data?.organization && !!data?.profilePhoto;
    }
    return false;
  } catch (error) {
    console.error("Error checking host details:", error);
    return false;
  }
};

// Helper function to check if detailed admin information has been submitted.
const checkAdminDetails = async (uid: string) => {
  try {
    const adminDoc = await getDoc(doc(db, "admin", uid));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      // Adjust these keys as per your admin schema.
      return !!data?.department && !!data?.profilePhoto;
    }
    return false;
  } catch (error) {
    console.error("Error checking admin details:", error);
    return false;
  }
};

const Login = () => {
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
    role: "student", // default role is student on signup
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [modalMessage, setModalMessage] = useState("");

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
  const handleAuth = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalMessage("");

    if (!validateForm()) return;

    try {
      if (isSignup) {
        // Signup process: Always create a document in the "student" collection.
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, {
            displayName: `${formData.firstName} ${formData.lastName}`,
          });
          await setDoc(doc(db, "student", auth.currentUser.uid), {
            role: "student", // default role
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
          });
        }
        // Sign out so the user can log in after signup.
        await auth.signOut();
        setFormData({
          email: "",
          password: "",
          confirmPassword: "",
          firstName: "",
          lastName: "",
          role: "student",
        });
        setIsSignup(false);
        setModalMessage("Signup successful. Please log in.");
      } else {
        // Login process
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const uid = userCredential.user.uid;

        // Fetch the student's document to determine the current role.
        const studentDocRef = doc(db, "student", uid);
        const studentDocSnap = await getDoc(studentDocRef);
        let role: "student" | "host" | "admin" = "student";
        if (studentDocSnap.exists()) {
          const studentData = studentDocSnap.data();
          role = studentData?.role ?? "student";
        }

        // If the role is updated to "admin" or "host" in the student doc, then handle accordingly.
        if (role === "admin") {
          const adminDocRef = doc(db, "admin", uid);
          const adminDocSnap = await getDoc(adminDocRef);
          if (!adminDocSnap.exists()) {
            // Create a new admin doc using data from the student doc.
            const studentData = studentDocSnap.data();
            await setDoc(adminDocRef, {
              role: "admin",
              firstName: studentData?.firstName ?? "",
              lastName: studentData?.lastName ?? "",
              email: studentData?.email ?? "",
              department: "",
              profilePhoto: "",
            });
            router.push("/admin-details");
            return;
          }
          const detailsExist = await checkAdminDetails(uid);
          router.push(detailsExist ? "/admin-dashboard" : "/admin-details");
        } else if (role === "host") {
          const hostDocRef = doc(db, "host", uid);
          const hostDocSnap = await getDoc(hostDocRef);
          if (!hostDocSnap.exists()) {
            // Create a new host doc using data from the student doc.
            const studentData = studentDocSnap.data();
            await setDoc(hostDocRef, {
              role: "host",
              firstName: studentData?.firstName ?? "",
              lastName: studentData?.lastName ?? "",
              email: studentData?.email ?? "",
              organization: "",
              profilePhoto: "",
            });
            router.push("/host-details");
            return;
          }
          const detailsExist = await checkHostDetails(uid);
          router.push(detailsExist ? "/host-dashboard" : "/host-details");
        } else {
          // Default student flow.
          const detailsExist = await checkStudentDetails(uid);
          router.push(detailsExist ? "/student-dashboard" : "/student-details");
        }
      }
    } catch (error: any) {
      setModalMessage(error.message);
    }
  };

  // Handle Google Authentication with the same role logic.
  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;

      // Fetch the student doc to determine the role.
      const studentDocRef = doc(db, "student", uid);
      const studentDocSnap = await getDoc(studentDocRef);
      let role: "student" | "host" | "admin" = "student";
      if (studentDocSnap.exists()) {
        const studentData = studentDocSnap.data();
        role = studentData?.role ?? "student";
      } else {
        // If no student doc exists, create one with default values.
        await setDoc(studentDocRef, {
          role: "student",
          firstName: userCredential.user.displayName
            ? userCredential.user.displayName.split(" ")[0]
            : "",
          lastName: userCredential.user.displayName
            ? userCredential.user.displayName.split(" ")[1] || ""
            : "",
          email: userCredential.user.email,
        });
      }

      if (role === "admin") {
        const adminDocRef = doc(db, "admin", uid);
        const adminDocSnap = await getDoc(adminDocRef);
        if (!adminDocSnap.exists()) {
          await setDoc(adminDocRef, {
            role: "admin",
            firstName: studentDocSnap.exists()
              ? (studentDocSnap.data()?.firstName ?? "")
              : userCredential.user.displayName
                ? userCredential.user.displayName.split(" ")[0]
                : "",
            lastName: studentDocSnap.exists()
              ? (studentDocSnap.data()?.lastName ?? "")
              : userCredential.user.displayName
                ? userCredential.user.displayName.split(" ")[1] || ""
                : "",
            email: userCredential.user.email,
            department: "",
            profilePhoto: "",
          });
          router.push("/admin-details");
          return;
        }
        const detailsExist = await checkAdminDetails(uid);
        router.push(detailsExist ? "/admin-dashboard" : "/admin-details");
      } else if (role === "host") {
        const hostDocRef = doc(db, "host", uid);
        const hostDocSnap = await getDoc(hostDocRef);
        if (!hostDocSnap.exists()) {
          await setDoc(hostDocRef, {
            role: "host",
            firstName: studentDocSnap.exists()
              ? (studentDocSnap.data()?.firstName ?? "")
              : userCredential.user.displayName
                ? userCredential.user.displayName.split(" ")[0]
                : "",
            lastName: studentDocSnap.exists()
              ? (studentDocSnap.data()?.lastName ?? "")
              : userCredential.user.displayName
                ? userCredential.user.displayName.split(" ")[1] || ""
                : "",
            email: userCredential.user.email,
            organization: "",
            profilePhoto: "",
          });
          router.push("/host-details");
          return;
        }
        const detailsExist = await checkHostDetails(uid);
        router.push(detailsExist ? "/host-dashboard" : "/host-details");
      } else {
        const detailsExist = await checkStudentDetails(uid);
        router.push(detailsExist ? "/student-dashboard" : "/student-details");
      }
    } catch (error: any) {
      setModalMessage(error.message);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // SocialButtons component for Google authentication.
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

  return (
    <>
      {/* Modal for messages */}
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
          {/* Image Section (for signup) */}
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
};

export default Login;
