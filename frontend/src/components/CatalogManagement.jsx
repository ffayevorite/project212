import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  Save,
  Loader2,
  MoreHorizontal,
} from "lucide-react";

export default function CatalogManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    amount: "",
    image_url: "",
    status: "",
  });

  // --- 1. Fetch Data ---
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("catalog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data);
    } catch (error) {
      console.error("Error fetching catalog:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Handle Image Upload ---
  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to 'catalog-images' bucket
      const { error: uploadError } = await supabase.storage
        .from("catalog-images") // **ต้องสร้าง Bucket นี้ใน Supabase ก่อน**
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("catalog-images").getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. Create / Update Logic ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Please enter a title");

    try {
      setUploading(true); // Reuse loading state for saving

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: formData.amount || 0,
        image_url: formData.image_url,
        status: formData.status,
      };

      let error;
      if (isEditing) {
        // UPDATE
        const { error: updateError } = await supabase
          .from("catalog")
          .update(payload)
          .eq("id", currentId);
        error = updateError;
      } else {
        // CREATE
        const { error: insertError } = await supabase
          .from("catalog")
          .insert([payload]);
        error = insertError;
      }

      if (error) throw error;

      alert(isEditing ? "Item updated!" : "Item created!");
      closeModal();
      fetchCatalog(); // Refresh list
    } catch (error) {
      alert("Error saving item: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 4. Delete Logic ---
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      const { error } = await supabase.from("catalog").delete().eq("id", id);
      if (error) throw error;

      setItems(items.filter((item) => item.id !== id));
    } catch (error) {
      alert("Error deleting item: " + error.message);
    }
  };

  // --- Helper Functions ---
  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.id);
      setFormData({
        title: item.title,
        description: item.description || "",
        category: item.category || "",
        amount: item.amount || "",
        image_url: item.image_url || "",
        status: item.status || "",
      });
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        amount: "",
        image_url: "",
        status: "active",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  // Filter items
  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.category &&
        item.category.toLowerCase().includes(searchTerm.toLowerCase())),
  );
  const categories = [
    "Computer",
    "Laptop",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Printer",
    "Projector",
    "Networking Equipment",
    "Microcontroller / IoT",
    "Cable",
    "Adapter",
    "Storage Device",
    "Document",
    "Other",
  ];

  const statusStyles = {
    active: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    inactive: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Catalog Management
          </h1>
          <p className="text-gray-500 text-sm">
            Manage your products, events, or resources.
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* --- Search & Filters --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-2" /> Loading...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-4 w-20">Image</th>
                  <th className="px-6 py-4">Title / Description</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-gray-500 text-xs truncate max-w-xs">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-medium">
                          {item.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                        {item.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusStyles[item.status] || statusStyles.inactive
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-gray-500">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-lg text-gray-900">
                {isEditing ? "Edit Item" : "Create New Item"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload Area */}
              <div className="flex justify-center mb-4">
                <div className="relative group w-full h-40 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      {uploading ? (
                        <Loader2 className="animate-spin mx-auto" />
                      ) : (
                        <ImageIcon className="mx-auto mb-2" size={32} />
                      )}
                      <span className="text-xs">Click to upload image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              {/* Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Item Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    {categories.sort().map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    amount (Optional)
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Details about the item..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
