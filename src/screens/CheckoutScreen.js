// src/screens/CheckoutScreen.js
import React from "react";
import { View, Text, Button } from "react-native";
import { useSelector } from "react-redux";

const CheckoutScreen = () => {
  const items = useSelector((state) => state.cart.items);

  const handleCheckout = () => {
    // Handle checkout logic (e.g., payment processing)
    console.log("Proceeding to payment with items:", items);
  };

  return (
    <View>
      <Text>Checkout</Text>
      {items.map((item, index) => (
        <Text key={index}>{item.name} - {item.price}</Text>
      ))}
      <Button title="Proceed to Payment" onPress={handleCheckout} />
    </View>
  );
};

export default CheckoutScreen;