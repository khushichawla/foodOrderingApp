import React from 'react';
import { StyleSheet, View, Text, FlatList, Image } from 'react-native';

const Orders = ({ route }) => {
  const { orders } = route.params; // Get orders from navigation params

  // Calculate total price for the order
  const totalPrice = orders.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no orders yet!</Text>
      ) : (
        <FlatList
          data={[{ orders, totalPrice }]} // Wrap orders in an array for FlatList
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              {item.orders.map(order => (
                <View key={order.id} style={styles.orderItem}>
                  <Image source={{ uri: order.image }} style={styles.image} />
                  <View style={styles.infoContainer}>
                    <Text style={styles.itemName}>{order.name}</Text>
                    <Text style={styles.itemPrice}>${order.price.toFixed(2)}</Text>
                    <Text style={styles.itemQuantity}>Quantity: {order.quantity}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Paid: ${item.totalPrice}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status: </Text>
                  <Text style={styles.statusPending}>Pending</Text>
                </View>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.orders[0].id} // Use the ID of the first item for uniqueness
        />
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
    padding: 16,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
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
  itemPrice: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  totalContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusLabel: {
    fontSize: 16,
    color: 'black',
  },
  statusPending: {
    fontSize: 16,
    color: 'orange',
  },
});

export default Orders;