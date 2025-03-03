"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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

function LoginPage() {
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
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    const newErrors: FormErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (isSignup && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
  };

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
        <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          <img
            className="h-5 w-5 mr-2"
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google logo"
          />
          <span>Google</span>
        </button>
        <button className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
          <img
            className="h-5 w-5 mr-2"
            src="https://www.svgrepo.com/show/512317/github-142.svg"
            alt="GitHub logo"
          />
          <span>GitHub</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 md:p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500 via-blue-300 to-white animate-slideBackground"></div>
      <div
        className="relative flex w-full max-w-7xl bg-white shadow-lg rounded-3xl overflow-hidden"
        style={{ height: "calc(100vh - 60px)" }}
      >
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

        <div
          className={`relative flex w-full md:w-2/3 lg:w-2/3 flex-col px-20 py-12 transition-opacity duration-500 ease-in-out opacity-0 ${
            isSignup ? "hidden md:block" : "opacity-100"
          }`}
        >
          <h2 className="text-4xl font-bold text-blue-600 mb-6 text-center">
            Student Login
          </h2>
          <h2 className="text-3xl font-bold text-black mb-4 text-center"></h2>
          <form onSubmit={handleAuth} className="space-y-6 relative">
            <div className="relative">
              <label className="block text-blue-600 mb-2">Email Address</label>
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
                <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
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
                <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
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

          {errorMessage && (
            <p className="text-red-500 text-center mt-4">{errorMessage}</p>
          )}

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

        <div
          className={`relative flex w-full md:w-2/3 lg:w-2/3 flex-col px-20 py-12 transition-transform duration-500 ease-in-out ${
            isSignup ? "block" : "hidden md:block"
          }`}
        >
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
                  <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
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
                  <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
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
                <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  type={showPassword1 ? "text" : "password"}
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
                  onClick={() => setShowPassword1(!showPassword1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword1 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  type={showPassword2 ? "text" : "password"}
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
                  onClick={() => setShowPassword2(!showPassword2)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword2 ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="absolute text-red-500 text-sm mt-1 top-full left-0">
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
  );
}

export default LoginPage;
