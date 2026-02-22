import { Mail, Phone, MapPin, GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid sm:grid-cols-2 gap-8 mb-8">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="text-blue-400" size={28} />
              <span className="text-xl font-bold text-white">CS CMU Borrow</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Making equipment borrowing simple and accessible for all
              university students and staff.
            </p>

            </div>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-blue-400" />
                <span>support@unilend.edu</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-blue-400" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-blue-400" />
                <span>Computer Science, Chiang Mai University, 1st Floor</span>
              </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
