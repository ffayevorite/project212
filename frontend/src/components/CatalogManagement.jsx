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
} from "lucide-react";

export default function CatalogManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
    status: "available",
  });

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
    available: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    unavailable: "bg-red-100 text-red-600",
  };

  // ================= FETCH =================
  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("catalog")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setItems(data);
    setLoading(false);
  };

  // ================= IMAGE UPLOAD =================
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("catalog-images")
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage
        .from("catalog-images")
        .getPublicUrl(fileName);

      setFormData((prev) => ({
        ...prev,
        image_url: data.publicUrl,
      }));
    }

    setUploading(false);
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) return alert("Title required");

    setUploading(true);

    const payload = {
      ...formData,
      amount: formData.amount || 0,
    };

    let error;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from("catalog")
        .update(payload)
        .eq("id", currentId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("catalog")
        .insert([payload]);
      error = insertError;
    }

    if (!error) {
      closeModal();
      fetchCatalog();
    }

    setUploading(false);
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete item?")) return;

    await supabase.from("catalog").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // ================= MODAL =================
  const openModal = (item = null) => {
    if (item) {
      setIsEditing(true);
      setCurrentId(item.id);
      setFormData(item);
    } else {
      setIsEditing(false);
      setCurrentId(null);
      setFormData({
        title: "",
        description: "",
        category: "",
        amount: "",
        image_url: "",
        status: "available",
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
  };

  // ================= FILTER =================
  const filteredItems = items.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-4 sm:p-8 w-full max-w-7xl mx-auto">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">Catalog Management</h1>
          <p className="text-gray-500 text-sm">
            Manage your products and resources
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>

      {/* ================= SEARCH ================= */}
      <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ================= TABLE / CARD ================= */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-2" />
            Loading...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No items found</div>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Image</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="m-auto mt-3 text-gray-400" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold">{item.title}</td>
                      <td className="px-6 py-4">{item.category}</td>
                      <td className="px-6 py-4 font-mono">
                        {item.amount?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            statusStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD */}
            <div className="md:hidden divide-y">
              {filteredItems.map((item) => (
                <div key={item.id} className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="m-auto mt-4 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="font-semibold">{item.title}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                        <span className="font-mono">
                          {item.amount?.toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            statusStyles[item.status]
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ================= MODAL ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg sm:max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
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

              {/* Title */}
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

              {/* Category + Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    Amount
                  </label>
                  <input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Description */}
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
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {["available", "pending", "unavailable"].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          status,
                        }))
                      }
                      className={`
          px-3 py-2 rounded-lg text-sm font-medium border transition-all
          ${
            formData.status === status
              ? statusStyles[status] +
                " border-transparent ring-2 ring-offset-1 ring-blue-400"
              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
          }
        `}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
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
