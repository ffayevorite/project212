// AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  LogOut,
  Search,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Trash2,
  Plus,
  Edit2,
  Image as ImageIcon,
  Save,
  X,
  Loader2,
  Menu,
} from "lucide-react";
import Dashboard from "../components/Dashboard";
import UsersView from "../components/UsersView";
import AdminCatalog from "../components/CatalogManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // Check admin role
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || data?.role !== "admin") {
        throw new Error("Access denied");
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Admin check failed:", error.message);
      navigate("/"); // Redirect to home
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (checkingAuth) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <ShieldCheck size={24} /> AdminPanel
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarItem
            icon={<Users size={20} />}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarItem
            icon={<ShoppingBag size={20} />}
            label="Catalog"
            active={activeTab === "catalog"}
            onClick={() => setActiveTab("catalog")}
          />
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="md:hidden flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">AdminPanel</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`p-2 rounded ${activeTab === "dashboard" ? "bg-blue-100 text-blue-600" : "bg-white"}`}
            >
              <LayoutDashboard size={20} />
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`p-2 rounded ${activeTab === "users" ? "bg-blue-100 text-blue-600" : "bg-white"}`}
            >
              <Users size={20} />
            </button>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`p-2 rounded ${activeTab === "catalog" ? "bg-blue-100 text-blue-600" : "bg-white"}`}
            >
              <ShoppingBag size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "users" && <UsersView />}
        {activeTab === "catalog" && <AdminCatalog />}
      </main>
    </div>
  );
}

// Helper Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      active ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon} {label}
  </button>
);
