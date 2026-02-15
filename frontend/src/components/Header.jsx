import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import {
  Menu,
  X,
  User,
  LogOut,
  GraduationCap,
  LayoutGrid,
  ChevronDown,
  ShieldCheck, // เพิ่ม icon
  AlertCircle, // เพิ่ม icon
} from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // 1. เช็คสถานะ Auth แบบ Realtime
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 bg-blue-50"
      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  // เช็คสถานะ Verify (ถ้าอีเมลเป็น @cmu.ac.th ถือว่า Verify แล้ว)
  const isVerified = user?.email?.endsWith("@cmu.ac.th");

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              CMU <span className="text-blue-600">App</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-1 items-center">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive("/")}`}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/catalog")}`}
            >
              <LayoutGrid size={16} /> Catalog
            </Link>
          </div>

          {/* Right Section (Auth Buttons) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // State: Logged In
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  {/* Text Info */}
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-semibold text-gray-700 leading-tight">
                      {user.user_metadata?.first_name || "Student"}
                    </span>
                    {/* Status Text */}
                    <span
                      className={`text-[10px] leading-tight font-medium ${
                        isVerified ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {isVerified ? "Verified Student" : "Unverified"}
                    </span>
                  </div>

                  {/* Avatar & Badge Wrapper */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border border-gray-100">
                      {user.user_metadata?.avatar_url ? (
                        <img
                          src={user.user_metadata.avatar_url}
                          alt="User"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={16} />
                      )}
                    </div>

                    {/* Verification Badge Icon */}
                    <div
                      className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white p-[2px] ${isVerified ? "bg-green-500" : "bg-yellow-400"}`}
                    >
                      {isVerified ? (
                        <ShieldCheck size={10} className="text-white" />
                      ) : (
                        <AlertCircle size={10} className="text-white" />
                      )}
                    </div>
                  </div>

                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 border border-gray-100 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-gray-50">
                      <p className="text-sm font-medium text-gray-900">
                        Signed in as
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <User size={16} /> Profile Settings
                      {!isVerified && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></span>
                      )}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // State: Logged Out
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium text-sm"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/")}`}
            >
              Home
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsMenuOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium ${isActive("/catalog")}`}
            >
              Catalog
            </Link>

            <div className="border-t border-gray-100 my-2 pt-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <User size={16} />
                      </div>
                      {/* Mobile Badge */}
                      <div
                        className={`absolute -bottom-1 -right-1 rounded-full border-2 border-white p-[2px] ${isVerified ? "bg-green-500" : "bg-yellow-400"}`}
                      >
                        {isVerified ? (
                          <ShieldCheck size={8} className="text-white" />
                        ) : (
                          <AlertCircle size={8} className="text-white" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{user.email}</p>
                      <p
                        className={`text-xs ${isVerified ? "text-green-600" : "text-yellow-600"}`}
                      >
                        {isVerified ? "Verified Student" : "Verify Account"}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-1"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
