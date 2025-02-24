import React from "react";

const AboutUsSection = () => {
  return (
    <section
      className="relative py-16 bg-cover bg-center rounded-4xl text-gray-900"
      style={{
        backgroundImage: "url('/assets/college-img.jpeg')",
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        backgroundBlendMode: "darken",
      }}
    >
      <div className="container mx-auto px-6 lg:px-10">
        {/* Background Card */}
        <div className="bg-white bg-opacity-80 border border-gray-300 shadow-lg rounded-2xl p-10 max-w-5xl mx-auto">
          {/* Who We Are Section */}
          <div className="mb-10">
            <h3 className="text-3xl font-semibold mb-6 text-center text-gray-700">
              Who Are We
            </h3>
            <p className="text-lg text-justify leading-relaxed px-6">
              Our platform revolutionizes student committee event management by
              eliminating repetitive registration through an easy-to-use profile
              system, enabling one-click registration without paperwork.
              Committees benefit from streamlined event management, instant
              student participation data access, and smooth communication with
              registered students, making event organization efficient and
              stress-free. By digitizing the entire process, we ensure greater
              accuracy in event records, reduce manual efforts, and allow
              committees to focus on delivering exceptional experiences. Our
              goal is to foster a seamless interaction between students and
              event organizers, enhancing participation and engagement in
              university events.
            </p>
          </div>

          {/* Vision and Mission Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-8">
            {/* Vision */}
            <div className="p-6 bg-blue-50 rounded-xl shadow-md">
              <h3 className="text-2xl font-medium text-center text-blue-800 mb-4">
                Vision
              </h3>
              <p className="text-lg text-center text-gray-700 leading-relaxed">
                Making event management seamless, efficient, and accessible for
                all student committees.
              </p>
            </div>

            {/* Mission */}
            <div className="p-6 bg-purple-50 rounded-xl shadow-md">
              <h3 className="text-2xl font-medium text-center text-purple-800 mb-4">
                Mission
              </h3>
              <p className="text-lg text-center text-gray-700 leading-relaxed">
                Simplifying event registration, reducing paperwork, and
                enhancing event tracking for better organization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;
