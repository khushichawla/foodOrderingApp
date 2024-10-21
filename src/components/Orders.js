import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.phone)
        .order('created_at', { ascending: false }); // Order by created_at descending

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        try {
          const parsedOrders = data.map(order => ({
            ...order,
            items: JSON.parse(order.items || '[]'),
          }));
          console.log('Parsed Orders:', parsedOrders);
          setOrders(parsedOrders);
        } catch (parseError) {
          console.error('Error parsing items:', parseError);
        }
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const handleGoToMenu = () => {
    navigation.navigate('Menu', { resetSelections: true });
  };

  const filteredOrders = orders.filter(order => order.status === selectedStatus);

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, selectedStatus === 'Pending' && styles.activeToggle]}
          onPress={() => setSelectedStatus('Pending')}
        >
          <Text style={[styles.toggleButtonText, selectedStatus === 'Pending' && styles.activeText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, selectedStatus === 'Success' && styles.activeToggle]}
          onPress={() => setSelectedStatus('Success')}
        >
          <Text style={[styles.toggleButtonText, selectedStatus === 'Success' && styles.activeText]}>Successful</Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no {selectedStatus} orders!</Text>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              {item.items.map((orderItem) => (
                <View key={orderItem.id} style={styles.orderItem}>
                  <Image source={{ uri: orderItem.image }} style={styles.image} />
                  <View style={styles.infoContainer}>
                    <Text style={styles.itemName}>{orderItem.name}</Text>
                    <Text style={styles.itemPrice}>${(orderItem.price).toFixed(2)}</Text>
                    <Text style={styles.itemQuantity}>Quantity: {orderItem.quantity}</Text>
                  </View>
                </View>
              ))}
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total Paid: ${item.total_amount.toFixed(2)}</Text>
                <View style={styles.statusContainer}>
                  <Text style={styles.statusLabel}>Status: </Text>
                  <Text style={[styles.statusText, item.status === 'Pending' ? styles.statusPending : styles.statusSuccess]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.timestampText}>
                  Order placed on: {new Date(item.created_at).toLocaleString()} {/* Format the timestamp */}
                </Text>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.order_id ? item.order_id.toString() : Math.random().toString()}
        />
      )}
      <TouchableOpacity style={styles.menuButton} onPress={handleGoToMenu}>
        <Text style={styles.menuButtonText}>Go to Menu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#287618',
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
  },
  activeToggle: {
    backgroundColor: '#287618',
  },
  toggleButtonText: {
    color: '#287618',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#fff',
  },
  emptyMessage: {
    fontSize: 18,
    textAlign: "center",
    color: "#666",
  },
  cardContainer: {
    padding: 16,
    marginBottom: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 16,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  totalContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusLabel: {
    fontSize: 16,
    color: "black",
  },
  statusPending: {
    color: "orange",
  },
  statusSuccess: {
    color: "green",
  },
  menuButton: {
    backgroundColor: "#287618",
    paddingVertical: 10,
    marginTop: 20,
    borderRadius: 5,
    marginBottom: 20,
  },
  menuButtonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
  },
  timestampText: {
    fontSize: 14,
    color: "#666",
    textAlign: 'right', // Align timestamp to the right
    marginTop: 5, // Add some space above the timestamp
  },
});

export default Orders;