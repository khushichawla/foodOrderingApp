import React from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust the path as needed

const Checkout = ({ route, navigation }) => {
  const { itemCounts, menuItems } = route.params; // Get item counts from navigation params

  const items = Object.keys(itemCounts).filter(itemId => itemCounts[itemId] > 0).map(itemId => {
    const item = menuItems.find(menuItem => menuItem.id === itemId);
    return { ...item, quantity: itemCounts[itemId] };
  });

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const handlePayment = () => {
    // Navigate to Orders page with the items as orders
    navigation.navigate('Orders', { orders: items });
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Checkout</Text> */}
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
                <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
              </View>
            </View>
          )}
          keyExtractor={item => item.id}
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
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
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
    backgroundColor: 'red',
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