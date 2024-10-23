import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, Alert, Modal, Pressable } from "react-native";
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';

const AdminOrders = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState(['Pending']);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Error fetching orders:', error);
      } else {
        try {
          const parsedOrders = await Promise.all(data.map(async (order) => {
            // Log the user_id to check its value and type
            // console.log('User ID:', order.user_id);
  
            const userProfileResponse = await supabase
              .from('user_profile')
              .select('username')
              .eq('phone', order.user_id) // Ensure this matches the text type
              .single();
  
            return {
              ...order,
              items: JSON.parse(order.items || '[]'),
              userName: userProfileResponse.data?.username || 'Unknown',
              userPhone: order.user_id || 'N/A',
            };
          }));
          setOrders(parsedOrders);
        } catch (parseError) {
          console.error('Error parsing items:', parseError);
        }
      }
    };
  
    fetchOrders();
  }, []);

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

  const filteredOrders = orders.filter(order =>
    selectedStatuses.includes(order.status)
  );

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit', hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(dateString).toLocaleString('en-US', options).replace(',', '');
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('order_id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Could not update the order status. Please try again.');
    } else {
      setOrders(orders.map(order => (order.order_id === orderId ? { ...order, status: newStatus } : order)));
    //   Alert.alert('Success', 'Order status updated successfully.');
      setModalVisible(false);
    }
  };

  const openModal = (orderId, currentStatus) => {
    setCurrentOrderId(orderId);
    setCurrentStatus(currentStatus);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {['Pending', 'PaymentDue', 'Preparing', 'Delivered', 'Cancelled'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.toggleButton, isSelected(status) && styles.activeToggle]}
            onPress={() => toggleStatus(status)}
          >
            <Text style={[styles.toggleButtonText, isSelected(status) && styles.activeText]}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredOrders.length === 0 ? (
        <Text style={styles.emptyMessage}>You have no selected orders!</Text>
      ) : (
        <FlatList
  data={filteredOrders}
  renderItem={({ item }) => (
    <View style={styles.cardContainer}>
      {/* User Info as Heading */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>User: {item.userName} (+852 {item.userPhone})</Text>
      </View>

      {item.items.map((orderItem, index) => (
        <View key={index} style={styles.orderItem}>
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
        <Text style={styles.totalText}>Total Amount: ${item.total_amount.toFixed(2)}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Status: </Text>
          <Text style={[
            styles.statusText,
            item.status === 'Pending' || item.status === 'PaymentDue' || item.status === 'Preparing' ? styles.statusPending :
            item.status === 'Delivered' ? styles.statusSuccess :
            styles.statusCancelled
          ]}>
            {item.status}
          </Text>
        </View>
        <Text style={styles.timestampText}>
          Order placed on: {formatDate(item.created_at)}
        </Text>
        <TouchableOpacity
          style={styles.statusButton}
          onPress={() => openModal(item.order_id, item.status)}
        >
          <Text style={[styles.statusButtonText, { color: 'white' }]}>{currentStatus || 'Change Status'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
  keyExtractor={(item) => item.order_id ? item.order_id.toString() : Math.random().toString()}
/>
      )}

      {/* Modal for Status Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Select New Status</Text>
          {['Pending', 'PaymentDue', 'Preparing', 'Delivered', 'Cancelled'].map(status => (
            <Pressable
              key={status}
              style={[styles.optionButton, currentStatus === status && styles.selectedOption]}
              onPress={() => updateOrderStatus(currentOrderId, status)}
            >
              <Text style={[styles.optionText, currentStatus === status && { color: 'white' }]}>{status}</Text>
            </Pressable>
          ))}
          <Pressable
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    // alignItems: 'center',
    marginBottom: 20,
  },
  toggleButton: {
    padding: 5,
    borderRadius: 5,
    backgroundColor: '#e7f3ff',
    flex: 1,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeToggle: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: 11,
  },
  activeText: {
    color: '#fff',
  },
  emptyMessage: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  infoContainer: {
    marginLeft: 10,
    flex: 1,
  },
  itemName: {
    fontWeight: 'bold',
  },
  priceQuantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 16,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 16,
    color: '#666',
  },
  totalContainer: {
    marginTop: 10,
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusLabel: {
    fontWeight: 'bold',
    marginRight: 5,
  },
  statusText: {
    fontSize: 16,
  },
  statusPending: {
    color: 'orange',
  },
  statusSuccess: {
    color: 'green',
  },
  statusCancelled: {
    color: 'red',
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
  },
  userInfoContainer: {
    padding: 14,
    backgroundColor: '#f9f9f9', // Change background color if needed
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
    alignItems: 'center',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#e7f3ff',
    marginVertical: 5,
    width: '100%',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#007bff',
  },
  optionText: {
    color: '#007bff',
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff6f61',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AdminOrders;