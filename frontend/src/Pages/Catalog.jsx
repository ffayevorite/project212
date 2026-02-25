// src/pages/Catalog.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MapPin,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Catalog() {
  // State
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const scrollContainerRef = useRef(null);

  // Fetch Data
  useEffect(() => {
    fetchCatalog();
  }, [activeCategory, searchTerm]);

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();

      if (activeCategory && activeCategory !== "All") {
        params.append("category", activeCategory);
      }
      if (searchTerm) {
        params.append("search", searchTerm);
      }

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/catalog/categories');
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        
        if (data.categories) {
          setCategories(["All", ...data.categories]);
        }
      } catch (err) {
        console.error("Category fetch error:", err);
      }
    };
    fetchCategories();
  }, []);

  // arrow scroll
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;

      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [categories]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 250;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* --- Hero Section --- */}
      <div className="bg-[#1a237e] text-white px-6 py-12 shadow-md">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Borrow Tools for Your Projects
          </h2>
          <p className="text-blue-200 mb-8 text-sm md:text-base">
            Access professional-grade equipment for your academic and research
            needs
          </p>

          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-900/50 border border-blue-700 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        </div>
      </div>

      {/* --- Filter Section --- */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="relative flex items-center mb-6">
          {/* Lefr arrow */}
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="hidden md:flex absolute left-0 z-10 -ml-4 shrink-0 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto items-center gap-3 pb-2 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] w-full scroll-smooth"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-blue-700 text-white shadow-md"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Right arrow */}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="hidden md:flex absolute right-0 z-10 -mr-4 shrink-0 p-1.5 rounded-full bg-white shadow-md border border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <p className="text-gray-500 text-sm mb-4">
          Showing {items.length} tools
        </p>

        {loading && (
          <div className="text-center py-10 animate-pulse">
            Loading items...
          </div>
        )}
        {error && <div className="text-center py-10 text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Filter className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No tools found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Sub-Component: Tool Card ---
function ToolCard({ tool }) {
  const isAvailable = tool.status === "available" || tool.quantity_available > 0;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
      <div className="h-48 overflow-hidden bg-gray-100 relative">
        <img
          src={tool.image_url || "https://placehold.co/400x250?text=No+Image"}
          alt={tool.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 pr-2">
            <span className="text-blue-600 text-[11px] font-bold uppercase tracking-wider block mb-1">
              {tool.category || "General"}
            </span>
            <h3
              className="font-bold text-gray-900 text-lg leading-tight line-clamp-2"
              title={tool.title}
            >
              {tool.title}
            </h3>
          </div>

          <div
            className={`shrink-0 flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full uppercase
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

        <div className="flex justify-between mt-3 items-center">
          <span className="font-bold text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-lg text-xs shadow-sm">
            Stock: {tool.quantity_available}
          </span>

          {isAvailable ? (
            <button
              onClick={() => alert(`Submit Request for: ${tool.title}`)}
              className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md transition-colors active:scale-95"
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
