import React, { useContext } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '../supabaseClient';
import { AuthContext, useAuth } from '../AuthContext';

const Checkout = ({ route, navigation }) => {
  const { itemCounts, menuItems } = route.params; // Get item counts from navigation params
  // const { user } = useContext(AuthContext); // Access user details from AuthContext
  const { user } = useAuth();
  // console.log('user information: ', user)

  const items = Object.keys(itemCounts).filter(itemId => itemCounts[itemId] > 0).map(itemId => {
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    return { ...item, quantity: itemCounts[item.id] };
  });

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handlePayment = async () => {
    console.log('user information: ', user)
    if (!user) {
      Alert.alert('Error', 'You need to be logged in to place an order.');
      return;
    }

    const userId = user.user_id; // Use the user ID from your AuthContext
    const totalAmount = getTotalPrice();
    const orderItems = items.map(item => ({
      id: item.id,
      name: item.name,
      quantity: itemCounts[item.id],
      price: item.price,
      image: item.image,
    }));

    // Insert order into the Orders table
    const { data, error } = await supabase
      .from('orders') // Make sure this is the correct table for orders
      .insert([{
        user_id: user.phone, // Use the user ID from your AuthContext
        total_amount: totalAmount,
        items: JSON.stringify(orderItems), // Store items as JSON
        status: 'Pending',
      }]);

    if (error) {
      Alert.alert('Error', 'Could not place order. Please try again.');
      console.error('Error inserting order:', error);
    } else {
      Alert.alert('Success', 'Your order has been placed!');
      navigation.navigate('Orders', { orders: data }); // Pass the order data to the Orders page
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
                <Text style={styles.itemQuantity}>Quantity: {itemCounts[item.id]}</Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id.toString()} // Ensure the key is a string
        />
      )}
      {items.length > 0 && (
        <View style={styles.paymentContainer}>
          <Text style={styles.totalAmount}>Total Amount: ${getTotalPrice()}</Text>
          <TouchableOpacity style={styles.paymentButton} onPress={handlePayment}>
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
  paymentButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default Checkout;