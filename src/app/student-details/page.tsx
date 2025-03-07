import Navbar from "../components/navbar";
import StudentDetail from "../components/student-details";
import Footer from "../components/footer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <StudentDetail />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
