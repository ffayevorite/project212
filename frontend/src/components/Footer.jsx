import { Mail, Phone, MapPin, GraduationCap } from 'lucide-react';

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
              <span className="text-xl font-bold text-white">UniLend</span>
            </div>
            <p className="text-sm text-gray-400 mb-6">
              Making equipment borrowing simple and accessible for all university students and staff.
            </p>
            
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
                <span>University Library, 2nd Floor</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Browse Catalog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">My Reservations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 text-center">
          <p className="text-sm text-gray-400">
            © 2026 UniLend. All rights reserved. Built for students, by students.
          </p>
        </div>
      </div>
    </footer>
  );
}