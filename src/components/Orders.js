import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert } from "react-native";
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

const Orders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(['Processing']); // Default to Processing
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.phone)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        try {
          const parsedOrders = data.map(order => ({
            ...order,
            items: JSON.parse(order.items || '[]'),
          }));
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

  const toggleStatus = (status) => {
    setSelectedStatuses((prev) => {
      if (prev.includes(status)) {
        return prev.filter(item => item !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const isSelected = (status) => selectedStatuses.includes(status);

  const processingStatuses = ['Pending', 'PaymentDue', 'Preparing'];
  const filteredOrders = orders.filter(order =>
    selectedStatuses.includes(order.status) ||
    (selectedStatuses.includes('Processing') && processingStatuses.includes(order.status))
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const deleteOrder = async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('order_id', orderId); // Use order_id instead of id
  
    if (error) {
      console.error('Error deleting order:', error);
      Alert.alert('Error', 'Could not delete the order. Please try again.');
    } else {
      setOrders(orders.filter(order => order.order_id !== orderId)); // Update to use order_id
      Alert.alert('Success', 'Order deleted successfully.');
    }
  };

  const confirmDelete = (orderId) => {
    console.log("Attempting to delete order with ID:", orderId); // Log the orderId for debugging
    Alert.alert(
      'Delete Order',
      'Are you sure you want to delete this order?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', onPress: () => deleteOrder(orderId) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isSelected('Processing') && styles.activeToggle]}
          onPress={() => toggleStatus('Processing')}
        >
          <Text style={[styles.toggleButtonText, isSelected('Processing') && styles.activeText]}>Processing</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isSelected('Delivered') && styles.activeToggle]}
          onPress={() => toggleStatus('Delivered')}
        >
          <Text style={[styles.toggleButtonText, isSelected('Delivered') && styles.activeText]}>Delivered</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, isSelected('Cancelled') && styles.activeToggle]}
          onPress={() => toggleStatus('Cancelled')}
        >
          <Text style={[styles.toggleButtonText, isSelected('Cancelled') && styles.activeText]}>Cancelled</Text>
        </TouchableOpacity>
      </View>

      {filteredOrders.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no selected orders!</Text>
      ) : (
        <FlatList
  data={filteredOrders}
  renderItem={({ item }) => {
    // console.log("Rendering item:", item); // Log the entire item for debugging
    return (
      <View style={styles.cardContainer}>
        {item.items.map((orderItem) => (
          <View key={orderItem.id} style={styles.orderItem}>
            <Image source={{ uri: orderItem.image }} style={styles.image} />
            <View style={styles.infoContainer}>
              <Text style={styles.itemName}>{orderItem.name}</Text>
              <View style={styles.priceQuantityContainer}>
                <Text style={styles.itemPrice}>${(orderItem.price * orderItem.quantity).toFixed(2)}</Text>
                <Text style={styles.itemQuantity}> x{orderItem.quantity}</Text>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>Total Paid: ${item.total_amount.toFixed(2)}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status: </Text>
            <Text style={[styles.statusText, 
              item.status === 'Pending' || item.status === 'PaymentDue' || item.status === 'Preparing' ? styles.statusPending : 
              item.status === 'Delivered' ? styles.statusSuccess : 
              styles.statusCancelled]}>
              {item.status}
            </Text>
          </View>
          <Text style={styles.timestampText}>
            Order placed on: {formatDate(item.created_at)}
          </Text>
          {item.status === 'Pending' && (
            <TouchableOpacity style={styles.deleteButton} onPress={() => confirmDelete(item.order_id)}>
              <Text style={styles.deleteButtonText}>Delete Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }}
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
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#287618',
    borderRadius: 25,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#287618',
  },
  toggleButtonText: {
    color: '#287618',
    fontWeight: 'bold',
    fontSize: 14,
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
    width: 60,
    height: 60,
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
  priceQuantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPrice: {
    fontSize: 16,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 16,
    color: "#666",
    marginLeft: 5,
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
    alignItems: "center",
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
  statusCancelled: {
    color: "red",
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: 'red',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
    textAlign: 'right',
    marginTop: 5,
  },
});

export default Orders;