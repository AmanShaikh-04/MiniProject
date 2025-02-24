"use client";

import React, { useState } from "react";

const FAQContactSection = () => {
  const faqs = [
    {
      id: 1,
      question: "How do I join the student committee?",
      answer:
        "To join the student committee, you need to fill out an application form during the recruitment period, typically at the beginning of each semester. Applications are reviewed by current committee members, and selected candidates are invited for an interview.",
    },
    {
      id: 2,
      question: "What events does the committee organize?",
      answer:
        "The student committee organizes a variety of events including academic workshops, career fairs, cultural festivals, sports tournaments, and social gatherings. The specific events vary each semester based on student interests and committee initiatives.",
    },
    {
      id: 3,
      question: "How can I propose an event idea?",
      answer:
        "Event proposals can be submitted through the online form available on the committee website. Alternatively, you can attend one of our monthly open meetings where students can present their ideas directly to committee members.",
    },
    {
      id: 4,
      question: "Are committee positions paid?",
      answer:
        "Most committee positions are volunteer-based, but some leadership roles may receive a stipend or course credit depending on university policies. Detailed information about compensation is provided during the application process.",
    },
    {
      id: 5,
      question: "How much time commitment is required?",
      answer:
        "The time commitment varies based on your role and the time of year. General members typically commit 3-5 hours per week, while executive positions may require 8-10 hours. During major events, additional time may be necessary.",
    },
  ];

  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({ name: "", email: "", message: "" });
    alert("Thank you for your message! We will get back to you soon.");
  };

  return (
    <section className="bg-background py-16 px-6">
      <div className="container mx-auto px-6 flex flex-col items-center">
        <div className="grid grid-cols-1 md:grid-cols-11 gap-16 w-full max-w-7xl">
          <div className="md:col-span-7 p-8 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-4">FAQ</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm"
                >
                  <button
                    className="w-full flex items-center justify-between text-left focus:outline-none"
                    onClick={() => toggleExpand(faq.id)}
                    aria-expanded={expandedId === faq.id}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <div className="flex items-center">
                      <div className="mr-3 h-6 w-6 flex items-center justify-center rounded-full border border-gray-400 bg-gray-200">
                        <span className="text-gray-600 text-sm">Q</span>
                      </div>
                      <span className="font-medium text-lg">
                        {faq.question}
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform duration-200 ${expandedId === faq.id ? "transform rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      ></path>
                    </svg>
                  </button>
                  {expandedId === faq.id && (
                    <div
                      className="mt-2 text-gray-700"
                      id={`faq-answer-${faq.id}`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 p-8 bg-gray-50 rounded-lg shadow-md">
            <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-400"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:border-gray-400"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQContactSection;
