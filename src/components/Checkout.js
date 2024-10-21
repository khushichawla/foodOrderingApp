import React, { useContext, useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { AuthContext, useAuth } from '../AuthContext';

const Checkout = ({ route, navigation }) => {
  const { itemCounts, menuItems } = route.params; // Get item counts from navigation params
  const { user } = useAuth();

  const [itemErrors, setItemErrors] = useState({}); // Track errors for each item
  const [hasError, setHasError] = useState(false); // Track if there is any error
  
  const items = Object.keys(itemCounts).filter(itemId => itemCounts[itemId] > 0).map(itemId => {
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    return { ...item, quantity: itemCounts[item.id] };
  });

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  useEffect(() => {
    // Validate quantities against available stock
    const validateQuantities = async () => {
      const newItemErrors = {}; // Reset errors for each validation
      let hasAnyError = false;

      try {
        const validationPromises = items.map(async (item) => {
          const { data: currentItemData, error: fetchError } = await supabase
            .from('menu_items')
            .select('quantity')
            .eq('id', item.id)
            .single();

          if (fetchError) {
            // check
            // console.error('Error fetching current item quantity:', fetchError);
            return;
          }

          // Skip validation for items with indefinite stock
          if (currentItemData && currentItemData.quantity === -1) {
            newItemErrors[item.id] = false; // No error for indefinite stock
            return;
          }

          if (currentItemData && currentItemData.quantity < itemCounts[item.id]) {
            newItemErrors[item.id] = true; // Set error for this item
            hasAnyError = true; // Mark that there's at least one error
          } else {
            newItemErrors[item.id] = false; // No error for this item
          }
        });

        await Promise.all(validationPromises);
      } catch (error) {
        console.error('Error in quantity validation:', error);
      }

      setItemErrors(newItemErrors); // Update state with new errors
      setHasError(hasAnyError); // Update overall error state
    };

    validateQuantities();
  }, [itemCounts, items]);

  const handlePayment = async () => {
    if (!user) {
      Alert.alert("Error", "You need to be logged in to place an order.");
      return;
    }

    const userId = user.user_id; // Use the user ID from your AuthContext
    const totalAmount = getTotalPrice();
    const orderItems = items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: itemCounts[item.id],
      price: item.price,
      image: item.image,
    }));

    // Insert order into the Orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: user.phone, // Use the user ID from your AuthContext
          total_amount: totalAmount,
          items: JSON.stringify(orderItems), // Store items as JSON
          status: "Pending",
        },
      ]);

    if (orderError) {
      Alert.alert("Error", "Could not place order. Please try again.");
      console.error("Error inserting order:", orderError);
      return;
    }

    // Update quantities in the menu_items table
    const promises = items.map(async (item) => {
      // Fetch current quantity for the item
      const { data: currentItemData, error: fetchError } = await supabase
        .from("menu_items")
        .select("quantity")
        .eq("id", item.id)
        .single(); // Fetch a single item

      if (fetchError) {
        console.error("Error fetching current item quantity:", fetchError);
        return false; // Indicate failure
      }

      // Skip updating quantity for items with indefinite stock
      if (currentItemData.quantity === -1) {
        return true; // No update needed, consider success
      }

      // Calculate new quantity
      const currentQuantity = currentItemData.quantity;
      const newQuantity = currentQuantity - itemCounts[item.id];

      // Update the quantity in the menu_items table
      const { error } = await supabase
        .from("menu_items")
        .update({ quantity: newQuantity })
        .eq("id", item.id);

      if (error) {
        console.error("Error updating menu item quantity:", error);
        return false; // Indicate failure
      }
      return true; // Indicate success
    });

    // Wait for all updates to complete
    const results = await Promise.all(promises);

    if (results.some((success) => !success)) {
      Alert.alert(
        "Error",
        "Some items could not be updated. Please check your order."
      );
    } else {
      Alert.alert("Success", "Your order has been placed!");
      navigation.navigate("Orders", { orders: orderData });
    }
  };

  return (
    <View style={styles.container}>
      {items.length === 0 ? (
        <Text style={styles.emptyMessage}>Your cart is empty!</Text>
      ) : (
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <View style={styles.infoContainer}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQuantity}>
                  Quantity: {itemCounts[item.id]}
                </Text>
                {itemErrors[item.id] && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorIcon}>⚠️</Text>
                    <Text style={styles.errorText}>
                      Insufficient stock for {item.name}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      {items.length > 0 && (
        <View style={styles.paymentContainer}>
          <Text style={styles.totalAmount}>
            Total Amount: ${getTotalPrice()}
          </Text>
          <TouchableOpacity
            style={[styles.paymentButton, hasError && styles.disabledButton]}
            onPress={handlePayment}
            disabled={hasError}
          >
            <Text style={styles.paymentButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  emptyMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  infoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  errorIcon: {
    fontSize: 18,
    color: 'red',
    marginRight: 5,
  },
  errorText: {
    fontSize: 14,
    color: 'red',
  },
  paymentContainer: {
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  paymentButton: {
    backgroundColor: '#287618',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  disabledButton: {
    backgroundColor: '#aaa', // Grey out the button when disabled
  },
  paymentButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default Checkout;