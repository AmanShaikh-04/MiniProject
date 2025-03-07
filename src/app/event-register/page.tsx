import Navbar from "../components/navbar";
import EventRegister from "../components/event-register";
import Footer from "../components/footer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <EventRegister />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
