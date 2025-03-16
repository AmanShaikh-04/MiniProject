import Navbar from "../components/navbar";
import HostDetail from "../components/host-details";
import Footer from "../components/footer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <HostDetail />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
