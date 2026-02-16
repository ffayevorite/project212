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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// --- SUB-COMPONENTS ---

// 1. Dashboard Overview Component
const DashboardOverview = () => {
  const [stats, setStats] = useState({ total: 0, verified: 0, items: 0 });
  const [facultyData, setFacultyData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch Users
      const { data: users } = await supabase
        .from("profiles")
        .select("faculty, cmu_verified");
      // Fetch Catalog Items
      const { count: itemCount } = await supabase
        .from("catalog")
        .select("*", { count: "exact", head: true });

      if (users) {
        const total = users.length;
        const verified = users.filter((u) => u.cmu_verified).length;
        setStats({ total, verified, items: itemCount || 0 });

        // Process Chart Data
        const counts = {};
        users.forEach((u) => {
          const fac = u.faculty || "Unknown";
          counts[fac] = (counts[fac] || 0) + 1;
        });
        setFacultyData(
          Object.keys(counts).map((k) => ({ name: k, count: counts[k] })),
        );
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-gray-800">Overview</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h3 className="text-3xl font-bold text-gray-900">{stats.total}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Verified Students</p>
            <h3 className="text-3xl font-bold text-green-600">
              {stats.verified}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <ShieldCheck size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Catalog Items</p>
            <h3 className="text-3xl font-bold text-purple-600">
              {stats.items}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
        <h3 className="font-semibold text-gray-800 mb-4">Users by Faculty</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={facultyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {facultyData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][index % 4]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// 2. User Management Component
const UsersView = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setUsers(data);
    } catch (error) {
      alert("Error fetching users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id, status) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ cmu_verified: !status })
        .eq("id", id);
      if (error) throw error;
      setUsers(
        users.map((u) => (u.id === id ? { ...u, cmu_verified: !status } : u)),
      );
    } catch (error) {
      alert("Update failed: " + error.message);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.first_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (u.student_id || "").includes(searchTerm),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Student ID / Faculty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center">
                  <Loader2 className="animate-spin mx-auto" />
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {user.first_name} {user.last_name}
                    </div>
                    <div className="text-gray-500 text-xs">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">
                      {user.student_id || "-"}
                    </div>
                    <div className="text-gray-500 text-xs">{user.faculty}</div>
                  </td>
                  <td className="px-6 py-4">
                    {user.cmu_verified ? (
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1">
                        <CheckCircle size={12} /> Verified
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit gap-1">
                        <XCircle size={12} /> Pending
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => toggleVerify(user.id, user.cmu_verified)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {user.cmu_verified ? "Revoke" : "Verify"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 3. Catalog Management Component
const CatalogView = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    title: "",
    category: "",
    amount: "",
    image_url: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("catalog")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setUploading(true);

    // 1. ตรวจสอบชื่อ Column ให้ตรงกับ DB (catagory ใช้ตัว a ตามรูป)
    // 2. แปลง amount เป็น Integer (int4) เพราะ DB ไม่รับทศนิยม
    const payload = {
      title: formData.title,
      catagory: formData.category, // แมพจาก state category ไปยัง column catagory
      amount: parseInt(formData.amount, 10) || 0,
      image_url: formData.image_url,
      // is_active: formData.is_active, // ถ้าในรูปไม่มี column นี้ ให้เอาออก หรือเพิ่มใน DB ก่อน
      created_at: new Date().toISOString(), // ใช้ ISO Format สำหรับ timestamp
    };

    try {
      let result;

      if (isEditing) {
        // กรณีแก้ไข
        result = await supabase
          .from("catalog")
          .update(payload)
          .eq("id", formData.id);
      } else {
        // กรณีเพิ่มใหม่
        result = await supabase.from("catalog").insert([payload]);
      }

      const { error } = result;

      if (error) {
        // แสดง Error ที่ละเอียดขึ้นเพื่อจะได้แก้ถูกจุด
        console.error("Supabase Error:", error.message);
        console.error("Error Details:", error.details);
        console.error("Error Hint:", error.hint);
        alert(
          `บ่สำเร็จ!: ${error.message} (${error.hint || "เช็กชื่อ Column หรือ RLS Policy"})`,
        );
      } else {
        // ถ้าสำเร็จ
        setIsModalOpen(false);
        if (typeof fetchCatalog === "function") fetchCatalog();
        alert(isEditing ? "แก้ไขข้อมูลเรียบร้อย!" : "เพิ่มข้อมูลสำเร็จ!");
      }
    } catch (err) {
      console.error("Unexpected Error:", err);
      alert("เกิดข้อผิดพลาดที่ไม่คาดคิด");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await supabase.from("catalog").delete().eq("id", id);
    setItems(items.filter((i) => i.id !== id));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const filePath = `${Date.now()}.${file.name.split(".").pop()}`;
      const { error } = await supabase.storage
        .from("catalog-images")
        .upload(filePath, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("catalog-images").getPublicUrl(filePath);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setFormData({ ...item });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        title: "",
        category: "",
        amount: "",
        image_url: "",
        is_active: true,
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Catalog Management</h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group"
          >
            <div className="h-48 bg-gray-100 relative">
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <ImageIcon size={32} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 p-1.5 rounded-lg backdrop-blur-sm">
                <button
                  onClick={() => openModal(item)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1">
                  {item.title}
                </h3>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {item.amount}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{item.category}</p>
              <div
                className={`text-xs px-2 py-1 rounded-full w-fit ${item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
              >
                {item.is_active ? "Active" : "Draft"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">
                {isEditing ? "Edit Item" : "New Item"}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="relative w-full h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">Upload Image</span>
                  )}
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    accept="image/*"
                    disabled={uploading}
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <Loader2 className="animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                placeholder="Title"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Category</option>

                  {/* Hardware */}
                  <option value="Computer">Computer</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Keyboard">Keyboard</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Printer">Printer</option>
                  <option value="Projector">Projector</option>
                  <option value="Networking">Networking Equipment</option>

                  {/* Lab Equipment */}
                  <option value="Microcontroller">Microcontroller / IoT</option>
                  <option value="RaspberryPi">Raspberry Pi</option>
                  <option value="Arduino">Arduino</option>

                  {/* Accessories */}
                  <option value="Cable">Cable</option>
                  <option value="Adapter">Adapter</option>
                  <option value="StorageDevice">Storage Device</option>

                  {/* Documents / Others */}
                  <option value="Document">Document</option>
                  <option value="SoftwareLicense">Software License</option>
                  <option value="Other">Other</option>
                </select>

                <input
                  type="number"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="active" className="text-sm text-gray-700">
                  Active (Visible)
                </label>
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors flex justify-center items-center gap-2"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}{" "}
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- MAIN PAGE LAYOUT ---

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

      // Note: This relies on the "is_admin()" function or correct RLS setup
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
        {activeTab === "dashboard" && <DashboardOverview />}
        {activeTab === "users" && <UsersView />}
        {activeTab === "catalog" && <CatalogView />}
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
