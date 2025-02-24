import React from "react";
import Navbar from "./components/navbar";
import Hero from "./components/hero";
import PastEvents from "./components/past-events";
import UpcomingEvents from "./components/upcoming-events";
import AboutUs from "./components/about-us";
import Gallery from "./components/gallery";
import Testimonial from "./components/testimonial";
import FAQ from "./components/faq";
import ContactUs from "./components/contact-us";
import Footer from "./components/footer";

const HomePage = () => {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow">
        <Hero />
        <AboutUs />
        <UpcomingEvents />
        <PastEvents />
        <Gallery />
        <Testimonial />
        <FAQ />
        {/* <ContactUs /> */}
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
};

export default HomePage;
