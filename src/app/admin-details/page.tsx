import Navbar from "../components/navbar";
import AdminDetail from "../components/admin-details";
import Footer from "../components/footer";

export default function Page() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <AdminDetail />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
