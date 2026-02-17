// src/pages/Cart.jsx
import { useCart } from "../contexts/CartContext";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { cartItems, addToCart, decreaseQuantity, removeFromCart, clearCart } =
    useCart();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="text-blue-600" /> My Cart
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <ShoppingCart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">
                  Your cart is empty
                </h3>
                <p className="text-gray-500 mb-6">
                  Looks like you haven't added anything yet.
                </p>
                <button
                  onClick={() => navigate("/catalog")} // เปลี่ยน path ตามจริง
                  className="text-blue-600 font-medium hover:underline"
                >
                  Go to Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center"
                >
                  {/* Image */}
                  <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No Img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500">{item.catagory}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Stock: {item.amount} pcs
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-1 hover:bg-white rounded-md shadow-sm transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-medium w-4 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.quantity >= item.amount}
                      className="p-1 hover:bg-white rounded-md shadow-sm transition-all disabled:opacity-30"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 p-2 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Checkout Summary Panel */}
          <div className="h-fit sticky top-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-medium text-gray-900">
                    {totalItems} pcs
                  </span>
                </div>
                {/* ถ้ามีระบบยืมคืนระบุวัน ก็เพิ่มตรงนี้ได้ */}
              </div>

              <button
                disabled={cartItems.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
              >
                Proceed to Checkout
              </button>

              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full mt-3 text-red-500 text-sm hover:underline text-center"
                >
                  Clear Cart
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
