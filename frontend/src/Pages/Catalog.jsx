import React, { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { Search, MapPin, Filter } from "lucide-react";

export default function Catalog() {
  // --- State ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // --- Hooks ---
  const { addToCart } = useCart();

  // --- Fetch Data ---
  useEffect(() => {
    fetchCatalog();
  }, [activeCategory, searchTerm]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      // Only append category if it's not "All"
      if (activeCategory && activeCategory !== "All") {
        params.append("category", activeCategory);
      }
      // Only append search if it's not empty
      if (searchTerm) {
        params.append("search", searchTerm);
      }

      // Debug URL
      // console.log("Fetching:", `http://localhost:8000/api/catalog?${params.toString()}`);

      const response = await fetch(`/api/catalog?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch catalog");
      }
      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching catalog:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* --- Hero Section --- */}
      <div className="bg-[#1a237e] text-white px-6 py-12 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Borrow Tools</h2>
          <p className="text-blue-200 mb-8 text-sm md:text-base">
            Access professional-grade equipment for your projects.
          </p>

          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-900/50 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        </div>
      </div>

      {/* --- Filter & Grid --- */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-blue-700 text-white shadow-md"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading / Error / Empty States */}
        {loading && (
          <div className="text-center py-10 animate-pulse">
            Loading items...
          </div>
        )}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No tools found matching your criteria.</p>
          </div>
        )}

        {/* --- Tool Grid --- */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((tool) => (
              <ToolCard key={tool.id} tool={tool} addToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Tool Card ---
function ToolCard({ tool, addToCart }) {
  const isAvailable = tool.status === "available" || tool.amount > 0;

  const handleRequest = () => {
    addToCart(tool);
    alert("Tool added to cart!");
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-gray-100 relative">
        <img
          src={tool.image_url}
          alt={tool.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-blue-600 text-xs font-bold uppercase tracking-wider block mb-1">
              {tool.category || "General"}
            </span>
            <h3 className="font-bold text-gray-900 text-lg leading-tight">
              {tool.title}
            </h3>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full
            ${
              isAvailable
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {tool.status}
          </div>
        </div>

        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">
          {tool.description || "No description provided."}
        </p>

        <div className="flex items-center gap-2 text-gray-400 text-xs pt-4 border-t border-gray-100">
          <MapPin size={14} />
          <span>{tool.location || "N/A"}</span>
        </div>

        <div className="flex justify-between mt-2 items-start">
          <span className="font-medium px-2 py-1 text-sm">
            Stock: {tool.amount}
          </span>

          {isAvailable ? (
            <button
              onClick={handleRequest} // Use the handler that checks login
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md transition-colors"
            >
              Request
            </button>
          ) : (
            <button
              disabled
              className="bg-gray-200 text-gray-400 text-sm font-medium px-4 py-2 rounded-full cursor-not-allowed"
            >
              Borrowed
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
