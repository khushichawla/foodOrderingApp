import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [itemCounts, setItemCounts] = useState({});

  const resetItemCounts = () => {
    setItemCounts({});
  };

  return (
    <CartContext.Provider value={{ itemCounts, setItemCounts, resetItemCounts }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);