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

        setStats({
          total,
          verified,
          items: itemCount || 0,
        });

        // Process Chart Data
        const counts = {};
        users.forEach((u) => {
          const fac = u.faculty || "Unknown";
          counts[fac] = (counts[fac] || 0) + 1;
        });

        setFacultyData(
          Object.keys(counts).map((k) => ({
            name: k,
            count: counts[k],
          })),
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
      <div className="p-10 flex justify-center items-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );

  return (
    <div className="space-y-6 p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Overview</h2>

      {/* ================= Stats Cards ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Total Users */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats.total}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg w-fit">
            <Users size={24} />
          </div>
        </div>

        {/* Verified */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm">Verified Students</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-600">
              {stats.verified}
            </h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg w-fit">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Items */}
        <div className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <p className="text-gray-500 text-sm">Catalog Items</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-purple-600">
              {stats.items}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg w-fit">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* ================= Chart ================= */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-4">Users by Faculty</h3>

        <div className="w-full h-[250px] sm:h-[300px] md:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={facultyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {facultyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b"][index % 4]
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
