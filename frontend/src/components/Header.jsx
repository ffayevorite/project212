import { Wrench, User, LogOut, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient"; // ตรวจสอบ path ไฟล์ supabase ของคุณ

export function Header() {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // สำหรับ Mobile Menu (ถ้ามี)
  const [isProfileOpen, setIsProfileOpen] = useState(false); // สำหรับ Dropdown โปรไฟล์
  const navigate = useNavigate();

  useEffect(() => {
    // 1. เช็ค Session ปัจจุบันตอนโหลดหน้าเว็บ
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 2. ฟัง event การเปลี่ยนแปลง auth (Login/Logout) แบบ Realtime
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    navigate("/login"); // ส่งกลับไปหน้า Login หลังออกระบบ
  };

  // ดึงชื่อและรูปภาพจาก Metadata (รองรับทั้ง Google Auth และ Email)
  const avatarUrl = user?.user_metadata?.avatar_url;
  const fullName = user?.user_metadata?.full_name || user?.email;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <nav className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Wrench className="text-blue-600" size={28} />
            <span className="text-lg font-bold text-gray-900">Equiply</span>
          </Link>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {user ? (
              // ==================== กรณี Login แล้ว ====================
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                >
                  {/* รูปโปรไฟล์ */}
                  <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-blue-600 w-5 h-5" />
                    )}
                  </div>

                  {/* ชื่อ User (ซ่อนในจอมือถือเล็กๆ) */}
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                    {fullName}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`text-gray-500 transition-transform ${isProfileOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 animation-fade-in">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} />
                      Your Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // ==================== กรณีไม่ได้ Login ====================
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-5 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Overlay สำหรับปิด Dropdown เมื่อคลิกที่อื่น */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40 bg-transparent"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}
