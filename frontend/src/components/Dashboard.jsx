import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
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
import { Users, ShieldCheck, ShoppingBag, Loader2 } from "lucide-react";

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
export default DashboardOverview;
