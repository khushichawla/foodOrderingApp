import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { supabase } from '../supabaseClient';

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, user_profile(*)')
        .eq('status', 'Pending');

      if (error) {
        console.error("Error fetching orders:", error);
        Alert.alert("Error", "Could not fetch orders.");
      } else {
        setOrders(data);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, status) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error("Error updating order status:", error);
      Alert.alert("Error", "Could not update order status.");
    } else {
      setOrders((prevOrders) => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      );
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <Text>User ID: {item.user_id}</Text>
            <Text>Name: {item.user_profile?.name}</Text>
            {/* Display other order details as needed */}
            <Text>Order Details: {JSON.stringify(item)}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Success" onPress={() => handleUpdateOrderStatus(item.id, 'Success')} />
              <Button title="Cancelled" onPress={() => handleUpdateOrderStatus(item.id, 'Cancelled')} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  orderContainer: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default PendingOrders;