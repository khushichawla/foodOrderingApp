import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Pressable } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { supabase } from '../supabaseClient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';

export default function AdminDashboard() {
  const { user, logout: contextLogout } = useAuth(); // Get user from auth context
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState([]);
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) {
      console.error('Error fetching menu items:', error);
    } else {
      setMenuItems(data);
    }
  }

  async function updateMenuItemQuantity(itemId, newQuantity) {
    setUpdatedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: newQuantity,
    }));
  }

  async function saveChanges() {
    const updatedItems = Object.entries(updatedQuantities).map(([itemId, newQuantity]) => ({
      id: itemId,
      quantity: newQuantity,
    }));

    for (const { id, quantity } of updatedItems) {
      try {
        const { error } = await supabase
          .from('menu_items')
          .update({ quantity })
          .eq('id', id);

        if (error) {
          console.error(`Error updating menu item ${id}:`, error);
        }
      } catch (err) {
        console.error(`Error updating menu item ${id}:`, err);
      }
    }

    await fetchMenuItems();
    setUpdatedQuantities({});
  }

  const handleLogout = async () => {
    await contextLogout(); // Call logout function from context
    navigation.navigate('SignIn'); // Navigate to SignIn page
  };

  // Group items by category
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.username || 'Guest'}</Text>
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)} style={styles.hamburger}>
          <Ionicons name="menu" size={30} color="#287618" />
        </TouchableOpacity>
      </View>

      {dropdownVisible && <View style={styles.overlay} onTouchEnd={() => setDropdownVisible(false)} />}
      
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <Pressable onPress={() => console.log('Add Item')}>
            <Text style={styles.dropdownItem}>Add Item</Text>
          </Pressable>
          <Pressable onPress={() => console.log('Customers')}>
            <Text style={styles.dropdownItem}>Customers</Text>
          </Pressable>
          <Pressable onPress={() => console.log('Orders')}>
            <Text style={styles.dropdownItem}>Orders</Text>
          </Pressable>
          <Pressable onPress={handleLogout}>
            <Text style={styles.dropdownItem}>Logout</Text>
          </Pressable>
          <Pressable onPress={() => setDropdownVisible(false)}>
            <Text style={[styles.dropdownItem, styles.closeButton]}>Close</Text>
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.scrollView}>
        {Object.entries(groupedMenuItems).map(([category, items]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryHeader}>{category}:</Text>
            <View style={styles.headerContainer}>
              <View style={styles.column}>
                <Text style={styles.headerText}>Name</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.headerText}>Price</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.headerTextQuantity}>Quantity</Text>
              </View>
            </View>
            {items.map((item) => (
              <View key={item.id} style={styles.itemContainer}>
                <View style={styles.column}>
                  <Text style={styles.itemTextLeft}>{item.name}</Text>
                </View>
                <View style={styles.column}>
                  <Text style={styles.itemTextLeft}>${item.price.toFixed(2)}</Text>
                </View>
                <View style={styles.column}>
                  <Input
                    value={updatedQuantities[item.id]?.toString() || item.quantity.toString()}
                    onChangeText={(text) => updateMenuItemQuantity(item.id, parseInt(text, 10))}
                    keyboardType="numeric"
                    style={styles.quantityInput}
                  />
                </View>
              </View>
            ))}
          </View>
        ))}
        <Button title="Save Changes" onPress={saveChanges} buttonStyle={styles.saveButton} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8', // Header background color
    elevation: 5, // Add shadow for better visibility
    marginTop: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#287618',
  },
  hamburger: {
    padding: 8,
    backgroundColor: 'white', // Solid white background for the hamburger
    borderRadius: 50, // Circular button
    elevation: 3, // Slight elevation to make it pop
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    zIndex: 5, // Ensure it's above other components
  },
  dropdown: {
    position: 'absolute',
    right: 16,
    top: 60,
    backgroundColor: 'white',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10, // Increased elevation to bring it to the front
    zIndex: 10, // Higher zIndex to ensure it stays on top
    width: 150, // Set a width for the dropdown
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: '#287618',
  },
  closeButton: {
    color: 'red', // Red color for the close button
  },
  scrollView: {
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#287618',
    textDecorationLine: 'underline',
  },
  headerContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  column: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerTextQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginLeft: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemTextLeft: {
    fontSize: 16,
    textAlign: 'left',
    width: '100%',
  },
  quantityInput: {
    width: 60,
    height: 40,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  saveButton: {
    backgroundColor: '#287618',
    marginTop: 16,
    marginBottom: 50,
  },
});