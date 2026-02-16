import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const Catalog = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const { data, error } = await supabase.from("items").select("*");

    if (error) {
      console.error("Error fetching items:", error);
    } else {
      setItems(data);
    }

    setLoading(false);
  };

  const handleBorrow = async (itemId) => {
    alert("Borrow item id: " + itemId);
    // ต่อไปค่อยทำระบบ borrow จริง
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Product Catalog</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-48 object-cover rounded"
            />

            <h2 className="text-xl font-semibold mt-4">{item.name}</h2>
            <p className="text-gray-600">{item.description}</p>

            <button
              disabled={!item.available}
              onClick={() => handleBorrow(item.id)}
              className={`mt-4 w-full py-2 rounded ${
                item.available
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              {item.available ? "Borrow" : "Not Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
