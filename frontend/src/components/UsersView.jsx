import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

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

export default UsersView;
