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
      <Navbar />
      <div className="flex-grow">
        <section id="hero">
          <Hero />
        </section>
        <section id="about-us">
          <AboutUs />
        </section>
        <section id="upcoming-events">
          <UpcomingEvents />
        </section>
        <PastEvents />
        <Gallery />
        <Testimonial />
        <section id="faq">
          <FAQ />
        </section>
        {/* Optionally wrap ContactUs in a section if needed */}
      </div>
      <Footer />
    </main>
  );
};

export default HomePage;
