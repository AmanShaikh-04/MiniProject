// src/app/components/footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Info</h3>
            <p className="text-gray-400">Email: info@scas.com</p>
            <p className="text-gray-400">Phone: +123 456 7890</p>
            <p className="text-gray-400">
              Address: 123 SCAS Street, City, Country
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-400 hover:text-blue-600">
                  About Us
                </a>
              </li>
              <li>
                <a href="/events" className="text-gray-400 hover:text-blue-600">
                  Events
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  className="text-gray-400 hover:text-blue-600"
                >
                  Gallery
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-blue-600"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.56v14.91c0 .98-.81 1.77-1.81 1.77H1.81C.81 21.24 0 20.45 0 19.47V4.56C0 3.58.81 2.79 1.81 2.79h20.38c1 0 1.81.79 1.81 1.77zM9 18.47v-8.4l8 4.2-8 4.2z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.23 5.924c-.806.358-1.67.6-2.577.708a4.515 4.515 0 001.98-2.49 9.022 9.022 0 01-2.86 1.09 4.507 4.507 0 00-7.682 4.108 12.8 12.8 0 01-9.29-4.71 4.507 4.507 0 001.394 6.015 4.48 4.48 0 01-2.04-.563v.057a4.507 4.507 0 003.616 4.415 4.52 4.52 0 01-2.034.077 4.507 4.507 0 004.21 3.13 9.038 9.038 0 01-5.6 1.93c-.364 0-.724-.02-1.08-.063a12.78 12.78 0 006.92 2.03c8.3 0 12.84-6.88 12.84-12.84 0-.195-.004-.39-.013-.584a9.172 9.172 0 002.26-2.34z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} S.C.A.S. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
