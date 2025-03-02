import React from "react";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer: React.FC = () => {
  const socialLinks = [
    { icon: Instagram, name: "Instagram" },
    { icon: Twitter, name: "Twitter" },
    { icon: Youtube, name: "YouTube" },
    { icon: Facebook, name: "Facebook" },
  ];

  return (
    <footer className="w-full bg-[#0f172a] text-white border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* 3-column grid:
              - Column 1: Address
              - Column 2: Spacer (6rem wide) --> Increases gap between Address and Follow Us
              - Column 3: Follow Us and Contact (2-column grid with small gap) */}
        <div className="grid grid-cols-[auto_6rem_auto] items-start">
          {/* Column 1: Address */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Address</h3>
            <p className="text-gray-400 text-sm leading-tight">
              Plot No. 2 &amp; 3, Sector - 16, New Panvel,
              <br />
              Navi Mumbai, Maharashtra 410206
            </p>
            <div className="rounded-lg overflow-hidden border border-gray-600 shadow-sm h-24 mt-3">
              <iframe
                title="Campus Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3772.4422163932486!2d73.10204687520344!3d19.000225782188764!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7e83a36fbf179%3A0xbbb0905051e8c56e!2sAnjuman-I-Islam%27s%20Kalsekar%20Technical%20Campus!5e0!3m2!1sen!2sin!4v1740890705273!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Column 2: Spacer */}
          <div />

          {/* Column 3: Follow Us and Contact as a 2-column grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Follow Us */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Follow Us</h3>
              <div className="flex flex-col space-y-2">
                {socialLinks.map(({ icon: Icon, name }) => (
                  <a
                    key={name}
                    href="#"
                    className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
                  >
                    <Icon size={16} className="text-white" />
                    <span>{name}</span>
                  </a>
                ))}
              </div>
            </div>
            {/* Contact */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Contact</h3>
              <div className="text-sm space-y-2">
                <div>
                  <h4 className="text-gray-400 font-medium">Email:</h4>
                  <p className="hover:text-white transition cursor-pointer">
                    info@example.edu.in
                  </p>
                </div>
                <div>
                  <h4 className="text-gray-400 font-medium">Phone:</h4>
                  <p className="hover:text-white transition cursor-pointer">
                    +91 9876543210
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-4 pt-2 border-t border-gray-600 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} S.C.M.S. All Rights Reserved
        </div>
      </div>
    </footer>
  );
};

export default Footer;
