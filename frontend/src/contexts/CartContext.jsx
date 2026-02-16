// src/contexts/CartContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // โหลดข้อมูลจาก LocalStorage เมื่อเปิดเว็บ (เพื่อให้ Refresh แล้วของไม่หาย)
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cmu_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem("cmu_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // ฟังก์ชันเพิ่มสินค้า
  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id);

      // ถ้ามีของชิ้นนี้อยู่แล้ว ให้เพิ่มจำนวน (Check Stock ได้ที่นี่)
      if (existingItem) {
        if (existingItem.quantity >= item.amount) {
          alert("สินค้าหมดสต็อกแล้ว (Maximum available reached)");
          return prevItems;
        }
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }

      // ถ้ายังไม่มี ให้เพิ่มใหม่โดยเริ่ม quantity = 1
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
