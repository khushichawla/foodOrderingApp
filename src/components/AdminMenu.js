import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  Pressable,
  Modal,
  TextInput,
  Button,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { supabase } from "../supabaseClient"; // Adjust the import as necessary
import { Ionicons } from "@expo/vector-icons"; // Make sure to import Ionicons
import { useAuth } from "../AuthContext"; // Import useAuth for user context
import { useNavigation } from "@react-navigation/native"; // Import useNavigation for navigation
import { Picker } from '@react-native-picker/picker';

const AdminMenu = () => {
  const { user, logout: contextLogout } = useAuth(); // Get user information and logout function from AuthContext
  const navigation = useNavigation(); // For navigation
  const [menuItems, setMenuItems] = useState([]);
  const [sideNavVisible, setSideNavVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-250)); // Start off-screen to the left
  const [selectedItem, setSelectedItem] = useState(null); // For the selected item
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("");
  const [selectedValue, setSelectedValue] = useState("java");

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    const { data, error } = await supabase.from("menu_items").select("*");
    if (error) {
      console.error("Error fetching menu items:", error);
    } else {
      // console.log("Fetched menu items:", data);
      setMenuItems(data);
    }
  };

  const toggleSideNav = () => {
    setSideNavVisible((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: sideNavVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleLogout = async () => {
    await contextLogout(); // Call the logout function from context
    navigation.navigate("SignIn"); // Navigate to SignIn screen
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setPrice(item.price.toString()); // Set current price
    setQuantity(item.quantity.toString()); // Set current quantity
    setStatus(item.status); // Set current status
  };

  const closeEditModal = () => {
    setSelectedItem(null);
    setPrice("");
    setQuantity("");
    setStatus("");
  };

  const saveChanges = async () => {
    const { error } = await supabase
      .from("menu_items")
      .update({ price, quantity, status }) // Update status as well
      .eq("id", selectedItem.id);

    if (error) {
      console.error("Error updating item:", error);
    } else {
      // Update local state to reflect changes
      setMenuItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedItem.id
            ? { ...item, price, quantity, status }
            : item
        )
      );
      closeEditModal();
    }
  };

  const toggleStatus = () => {
    const newStatus = status === "enable" ? "disable" : "enable";
    setStatus(newStatus); // Update local state
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSideNav} style={styles.hamburger}>
          <Ionicons name="menu" size={30} color="#287618" />
        </TouchableOpacity>
        <Text style={styles.greeting}>Hello, {user?.username || "User"}</Text>
      </View>

      <Animated.View
        style={[styles.sideNav, { transform: [{ translateX: slideAnim }] }]}
      >
        <View style={styles.sideNavContent}>
          <Pressable onPress={() => navigation.navigate("AddItem")}>
            <Text style={styles.dropdownItem}>Add Item</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable onPress={() => navigation.navigate("AdminCustomers")}>
            <Text style={styles.dropdownItem}>Customers</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable onPress={() => navigation.navigate("AdminOrders")}>
            <Text style={styles.dropdownItem}>Orders</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable onPress={handleLogout}>
            <Text style={styles.dropdownItem}>Logout</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable onPress={toggleSideNav}>
            <Text style={[styles.dropdownItem, styles.closeButton]}>Close</Text>
          </Pressable>
        </View>
      </Animated.View>

      {sideNavVisible && <View style={styles.overlay} />}

      <ScrollView style={styles.scrollView}>
        {Object.keys(groupedMenuItems).map((category) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            {groupedMenuItems[category].map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  item.status === "enable"
                    ? styles.enabledCard
                    : styles.disabledCard,
                ]}
              >
                <Image source={{ uri: item.image }} style={styles.image} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardPrice}>Price: ${item.price}</Text>
                  <Text style={styles.cardQuantity}>
                    Quantity: {item.quantity}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => openEditModal(item)}
                  style={styles.editButton}
                >
                  <Text
                    style={{
                      color: "black",
                      fontWeight: "bold",
                      textDecorationLine: "underline",
                    }}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Modal for editing item */}
      {selectedItem && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={true}
          onRequestClose={closeEditModal}
        >
          <KeyboardAvoidingView
            style={styles.modalContainer}
            behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjust based on the platform
            keyboardVerticalOffset={20} // Adjust this value as needed
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalHeading}>{selectedItem.name}</Text>
              <Text>Price:</Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <Text>Quantity:</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
              />
              <Text>Status:</Text>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  {
                    borderColor: status === "enable" ? "green" : "red",
                    borderWidth: 2,
                    backgroundColor: "transparent",
                  },
                ]}
                onPress={toggleStatus}
              >
                <Text
                  style={[
                    styles.toggleButtonText,
                    { color: status === "enable" ? "green" : "red" },
                  ]}
                >
                  {status === "enable" ? "Enabled" : "Disabled"}
                </Text>
              </TouchableOpacity>
              <Button title="Save" onPress={saveChanges} />
              <Button title="Cancel" onPress={closeEditModal} color="red" />
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    elevation: 5,
    marginTop: 30,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#287618",
    marginLeft: 16,
  },
  hamburger: {
    padding: 8,
    backgroundColor: "white",
    borderRadius: 50,
    elevation: 3,
  },
  sideNav: {
    position: "absolute",
    left: 0,
    top: 0,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    width: 250,
    height: "100%",
    padding: 20,
    elevation: 5,
    zIndex: 10,
  },
  sideNavContent: {
    marginTop: 40,
  },
  dropdownItem: {
    padding: 12,
    fontSize: 20,
    color: "#287618",
    fontWeight: "bold",
    textAlign: "left",
  },
  closeButton: {
    color: "red",
  },
  separator: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 5,
  },
  scrollView: {
    padding: 16,
  },
  categoryContainer: {
    marginVertical: 16,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    height: 85, // Increased height for better visibility
  },
  enabledCard: {
    borderColor: "green",
    borderWidth: 2,
    // backgroundColor: "rgba(0, 128, 0, 0.1)",
  },
  disabledCard: {
    borderColor: "red",
    borderWidth: 2,
    // backgroundColor: "rgba(128, 0, 0, 0.1)",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardPrice: {
    fontSize: 14,
    color: "#333",
  },
  cardQuantity: {
    fontSize: 14,
    color: "#333",
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 10,
  },
  modalHeading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    borderWidth: 2, // Add border width
    borderColor: "transparent", // Default border color
    backgroundColor: "transparent", // Make background transparent
  },
  toggleButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default AdminMenu;
