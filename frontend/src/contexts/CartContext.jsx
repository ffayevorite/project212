// src/contexts/CartContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      if (existingItem) {
        if (existingItem.quantity >= item.amount) {
          alert("สินค้าหมดสต็อกแล้ว (Maximum available reached)");
          return prevItems;
        }
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      return [...prevItems, { ...item, quantity: 1 }];
    });
  };

  // ฟังก์ชันลบสินค้า
  const removeFromCart = (id) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  // ฟังก์ชันลดจำนวน
  const decreaseQuantity = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: Math.max(item.quantity - 1, 1) };
        }
        return item;
      }),
    );
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        decreaseQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
