import { wrench } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <wrench className="text-blue-600" size={28} />
            <span className="text-lg font-bold text-gray-900">
              Equiply
            </span>
          </div>
          <div className="items-center gap-3">
            <Link to="/login" className="px-5 py-2 text-gray-700 hover:text-blue-600 transition-colors">
              Sign In
            </Link>
            <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}