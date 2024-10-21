import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from "react-native";
import { supabase } from "../supabaseClient"; // Adjust the import as necessary

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase.from("menu_items").select("*");
    if (error) {
      console.error("Error fetching menu items:", error);
    } else {
      console.log("Fetched menu items:", data);
      setMenuItems(data);
    }
  };

  const toggleStatus = async (id) => {
    const itemToToggle = menuItems.find(item => item.id === id);
    const newStatus = itemToToggle.status === 'enable' ? 'disable' : 'enable';
    const isEnabled = newStatus === 'enable';

    const { error } = await updateStatusInDB(id, isEnabled);
    if (!error) {
      setMenuItems(
        menuItems.map(item =>
          item.id === id ? { ...item, status: newStatus, is_enabled: isEnabled } : item
        )
      );
    } else {
      console.error("Error updating status:", error);
    }
  };

  const updateStatusInDB = async (id, isEnabled) => {
    let status = 'enable'
    if (isEnabled == false) {
        status = 'disable'
    }
    const { error } = await supabase
      .from('menu_items')
      .update({ status: status }) // Ensure the column name is correct
      .eq('id', id);
    
    return { error }; // Return the error for handling in toggleStatus
  };

  const groupByCategory = (items) => {
    return items.reduce((result, item) => {
      if (!result[item.category]) {
        result[item.category] = [];
      }
      result[item.category].push(item);
      return result;
    }, {});
  };

  const groupedMenuItems = groupByCategory(menuItems);

  return (
    <ScrollView style={styles.container}>
      {Object.keys(groupedMenuItems).map((category) => (
        <View key={category} style={styles.categoryContainer}>
          <Text style={styles.categoryTitle}>{category}</Text>
          {groupedMenuItems[category].map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.cardTitle}>{item.name}</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: item.status === 'enable' ? 'green' : 'red' }
                ]}
                onPress={() => toggleStatus(item.id)}
              >
                <Text style={styles.toggleButtonText}>
                  {item.status === 'enable' ? 'Enabled' : 'Disabled'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  categoryContainer: {
    marginVertical: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cardTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AdminMenu;