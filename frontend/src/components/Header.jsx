import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import {
  Menu,
  X,
  Home,
  User,
  LogOut,
  GraduationCap,
  LayoutGrid,
  ChevronDown,
  ShieldCheck,
  AlertCircle,
  Settings,
  LayoutDashboard,
  ShoppingCart,
} from "lucide-react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
    checkLogin();
  }, []);
  const checkLogin = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setIsLogin(!!session);
  };
  const fetchProfileStatus = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("cmu_verified")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setIsVerified(data.cmu_verified === true);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error.message);
        return;
      }

      if (data) {
        setIsAdmin(data.role === "admin");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };
  useEffect(() => {
    let profileChannel = null;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (!currentUser) return;

      const { data } = await supabase
        .from("profiles")
        .select("cmu_verified, role")
        .eq("id", currentUser.id)
        .single();

      if (data) {
        setIsVerified(!!data.cmu_verified);
        setIsAdmin(data.role === "admin");
      }

      profileChannel = supabase
        .channel(`profile-${currentUser.id}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "profiles",
            filter: `id=eq.${currentUser.id}`,
          },
          (payload) => {
            console.log("Profile Updated:", payload.new);
            setIsVerified(!!payload.new.cmu_verified);
            setIsAdmin(payload.new.role === "admin");
          },
        )
        .subscribe();
    };

    init();

    return () => {
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, []);

  useEffect(() => {
    let profileSubscription = null;

    const initializeSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfileStatus(currentUser.id);

        profileSubscription = supabase
          .channel("public:profiles")
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${currentUser.id}`,
            },
            (payload) => {
              setIsVerified(payload.new.cmu_verified === true);
            },
          )
          .subscribe();
      }
    };

    initializeSession();

    const {
      data: { subscription: authListener },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        fetchProfileStatus(currentUser.id);
      } else {
        setIsVerified(false);
        setIsProfileOpen(false);
        setIsMenuOpen(false);
      }
    });

    return () => {
      authListener.unsubscribe();
      if (profileSubscription) supabase.removeChannel(profileSubscription);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-600 bg-blue-50"
      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg group-hover:bg-blue-700 transition-colors">
              <GraduationCap size={24} />
            </div>
            <span className="font-bold text-xl text-gray-800 tracking-tight">
              CS CMU <span className="text-blue-600">Borrow</span>
            </span>
          </Link>

          {/* Desktop Nav — hidden on mobile */}
          <div className="hidden md:flex justify-center">
            {user && (
              <div className="flex space-x-1 items-center bg-gray-50/50 p-1 rounded-xl border border-gray-100">
                <Link
                  to="/"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/")}`}
                >
                  <Home size={16} /> Home
                </Link>
                <Link
                  to="/catalog"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/catalog")}`}
                >
                  <LayoutGrid size={16} /> Catalog
                </Link>
                <Link
                  to="/cart"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/cart")}`}
                >
                  <ShoppingCart size={16} /> Cart
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/admin")}`}
                  >
                    <LayoutDashboard size={16} /> Admin
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Right Section — desktop profile dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full border border-gray-200 hover:shadow-md transition-all cursor-pointer bg-white"
                >
                  <div className="flex flex-col items-end mr-1">
                    <span className="text-xs font-semibold text-gray-700 leading-tight">
                      {user.user_metadata?.name.split(" ")[0] || "Student"}
                    </span>
                    <span
                      className={`text-[10px] leading-tight font-medium ${isVerified ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

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

                {/* Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-1 border border-gray-100 animate-in fade-in slide-in-from-top-2 z-50">
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
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/setting"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings size={16} /> Settings
                      {!isVerified && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></span>
                      )}
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <LayoutDashboard size={16} /> Admin
                      </Link>
                    )}

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
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: right side — hamburger or auth buttons */}
          <div className="md:hidden flex items-center gap-2">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-in slide-in-from-top-5">
          <div className="px-4 pt-2 pb-6 space-y-1">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/")}`}
            >
              <Home size={16} /> Home
            </Link>
            <Link
              to="/catalog"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/catalog")}`}
            >
              <LayoutGrid size={16} /> Catalog
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/cart")}`}
            >
              <ShoppingCart size={16} /> Cart
            </Link>
            <Link
              to="/profile"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/profile")}`}
            >
              <User size={16} /> Profile
            </Link>
            <Link
              to="/setting"
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/setting")}`}
            >
              <Settings size={16} /> Settings
              {!isVerified && (
                <span className="ml-auto w-2 h-2 rounded-full bg-yellow-400"></span>
              )}
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium ${isActive("/admin")}`}
              >
                <LayoutDashboard size={16} /> Admin
              </Link>
            )}

            <div className="border-t border-gray-100 my-2 pt-2">
              {/* User info row */}
              <div className="flex items-center gap-3 px-3 py-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 overflow-hidden border border-gray-200">
                    {user?.user_metadata?.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt="User"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={18} />
                    )}
                  </div>
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
                  <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
                  <p className={`text-xs ${isVerified ? "text-green-600" : "text-yellow-600"}`}>
                    {isVerified ? "Verified" : "Unverified"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-3 px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 mt-1"
              >
                <LogOut size={20} /> Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}