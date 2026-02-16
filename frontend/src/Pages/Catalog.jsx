// src/pages/Catalog.jsx
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext"; // <--- IMPORT THIS
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingBag,
  Image as ImageIcon,
  Loader2,
  Plus,
  ShoppingCart,
} from "lucide-react";

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // เรียกใช้ Context
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const checkLogin = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  };
  useEffect(() => {
    checkLogin();
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/catalog");
      if (!response.ok) {
        throw new Error("Failed to fetch catalog");
      }
      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching catalog:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || item.catagory === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    "Computer",
    "Laptop",
    "Monitor",
    "Keyboard",
    "Mouse",
    "Printer",
    "Projector",
    "Networking",
    "Microcontroller",
    "RaspberryPi",
    "Arduino",
    "Cable",
    "Adapter",
    "StorageDevice",
    "Document",
    "SoftwareLicense",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="text-blue-600" />
              Our Catalog
            </h1>
            <div className="flex flex-1 max-w-md gap-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500">Loading catalog...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
              >
                <div className="h-56 bg-gray-100 relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">
                      <ImageIcon size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur-sm text-blue-600 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">
                      {item.catagory}
                    </span>
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight">
                      {item.title}
                    </h3>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">
                        Available
                      </p>
                      <p className="text-xl font-black text-blue-600">
                        {item.amount.toLocaleString()}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          pcs
                        </span>
                      </p>
                    </div>

                    {/* ปุ่ม Add to Cart ที่เชื่อมกับ Context */}
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.amount <= 0}
                      className="bg-gray-900 text-white p-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-sm group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {item.amount > 0 ? (
                        <div className="flex items-center gap-2">
                          <Plus
                            size={20}
                            className="group-hover/btn:rotate-90 transition-transform"
                          />
                        </div>
                      ) : (
                        <span className="text-xs">Out</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              No items found
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalog;
