import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { Input, Button } from "@rneui/themed";
import { supabase } from "../supabaseClient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../AuthContext";
import { useNavigation } from "@react-navigation/native";

export default function AdminDashboard() {
  const { user, logout: contextLogout } = useAuth();
  const navigation = useNavigation();
  const [menuItems, setMenuItems] = useState([]);
  const [updatedQuantities, setUpdatedQuantities] = useState({});
  const [sideNavVisible, setSideNavVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(-250))[0]; // Start off-screen to the left

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    const { data, error } = await supabase.from("menu_items").select("*");
    if (error) {
      console.error("Error fetching menu items:", error);
    } else {
      setMenuItems(data);
    }
  }

  async function saveChanges() {
    const updatedItems = Object.entries(updatedQuantities).map(
      ([itemId, newQuantity]) => ({
        id: itemId,
        quantity: newQuantity,
      })
    );

    for (const { id, quantity } of updatedItems) {
      try {
        const { error } = await supabase
          .from("menu_items")
          .update({ quantity })
          .eq("id", id);

        if (error) {
          console.error(`Error updating menu item ${id}:`, error);
        }
      } catch (err) {
        console.error(`Error updating menu item ${id}:`, err);
      }
    }

    await fetchMenuItems();
    setUpdatedQuantities({});
    Alert.alert("Success", "Changes saved successfully!");
  }

  const handleLogout = async () => {
    await contextLogout();
    navigation.navigate("SignIn");
  };

  const toggleSideNav = () => {
    setSideNavVisible((prev) => !prev);
    Animated.timing(slideAnim, {
      toValue: sideNavVisible ? -250 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSideNav} style={styles.hamburger}>
            <Ionicons name="menu" size={30} color="#287618" />
          </TouchableOpacity>
          <Text style={styles.greeting}>
            Hello, {user?.username || "Guest"}
          </Text>
        </View>

        <Animated.View style={[styles.sideNav, { transform: [{ translateX: slideAnim }] }]}>
          <View style={styles.sideNavContent}>
          <Pressable onPress={() => navigation.navigate("AdminMenu")}>
              <Text style={styles.dropdownItem}>Menu</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable onPress={() => console.log("Add Item")}>
              <Text style={styles.dropdownItem}>Add Item</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable onPress={() => console.log("Customers")}>
              <Text style={styles.dropdownItem}>Customers</Text>
            </Pressable>
            <View style={styles.separator} />
            <Pressable onPress={() => console.log("Orders")}>
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
                    <Text style={styles.itemTextLeft}>
                      ${item.price.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.column}>
                    <Input
                      value={
                        updatedQuantities[item.id]?.toString() ||
                        item.quantity.toString()
                      }
                      onChangeText={(text) => {
                        if (text === "" || text === "-1" || /^[+-]?\d*$/.test(text)) {
                          setUpdatedQuantities((prev) => ({
                            ...prev,
                            [item.id]: text,
                          }));
                        }
                      }}
                      keyboardType="default"
                      containerStyle={{ width: 90 }}
                      inputStyle={{
                        fontSize: 16,
                        textAlign: "center",
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}
          <Button
            title="Save Changes"
            onPress={saveChanges}
            buttonStyle={styles.saveButton}
          />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    fontFamily: "Trebuchet MS", // Change to your desired font
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
    elevation: 5,
    marginTop: 30,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#287618",
    marginLeft: 16,
    fontFamily: "Trebuchet MS", // Change to your desired font
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
    marginTop: 40, // Added margin to move options down
  },
  dropdownItem: {
    padding: 12,
    fontSize: 20,
    color: "#287618",
    fontWeight: "bold",
    textAlign: "left",
    fontFamily: "Trebuchet MS", // Change to your desired font
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
    marginBottom: 15,
  },
  categoryHeader: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#287618",
    textDecorationLine: "underline",
    paddingLeft: 10,
    fontFamily: "Trebuchet MS", // Change to your desired font
  },
  headerContainer: {
    flexDirection: "row",
    marginBottom: 4,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  column: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Trebuchet MS", // Change to your desired font
  },
  headerTextQuantity: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 20,
    fontFamily: "Trebuchet MS", // Change to your desired font
  },
  itemContainer: {
    flexDirection: "row",
    marginVertical: 2,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemTextLeft: {
    fontSize: 16,
    textAlign: "left",
    width: "100%",
    fontFamily: "Trebuchet MS",
  },
  quantityInput: {
    width: 40,
    height: 20,
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    flexShrink: 0,
  },
  saveButton: {
    backgroundColor: "#287618",
    marginTop: 16,
    marginBottom: 50,
  },
});