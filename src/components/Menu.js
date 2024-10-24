import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import { useCart } from "../CartContext";
import Icon from "react-native-vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";

export default function Menu({ navigation, route }) {
  const { user, logout } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const { itemCounts, setItemCounts } = useCart();
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Fetch menu items when the screen is focused
  useFocusEffect(
  React.useCallback(() => {
    const fetchMenuItems = async () => {
      try {
        const { data, error } = await supabase
          .from("menu_items")
          .select("*")
          .eq("status", "enable"); // Filter for items with status 'enable'

        if (error) {
          throw error; // Throw error for better catch handling
        }

        if (data) {
          setMenuItems(data);

          // Initialize item counts to zero for the fetched items
          const initialCounts = {};
          data.forEach(item => {
            initialCounts[item.id] = 0; // Set each item's count to 0
          });
          setItemCounts(initialCounts); // Update item counts state
        }
      } catch (error) {
        console.error("Error fetching menu items:", error);
        Alert.alert("Error", "Could not fetch menu items. Please try again.");
      }
    };

    fetchMenuItems();

    // Check if resetSelections parameter is passed
    if (route.params?.resetSelections) {
      setItemCounts({}); // Reset item counts
    }
  }, [route.params])
);

  const handleLogout = async () => {
    try {
      logout();
      // Alert.alert("Logged out successfully");
      navigation.navigate("SignIn");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Logout error", "An error occurred while trying to log out.");
    }
  };

  const groupByCategory = (items) => {
    const singleItemCategories = {};
    const multiItemCategories = {};

    items.forEach((item) => {
      if (items.filter((i) => i.category === item.category).length === 1) {
        (singleItemCategories[item.category] =
          singleItemCategories[item.category] || []).push(item);
      } else {
        (multiItemCategories[item.category] =
          multiItemCategories[item.category] || []).push(item);
      }
    });

    return { singleItemCategories, multiItemCategories };
  };

  const groupedMenuItems = groupByCategory(menuItems);

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleIncrement = (itemId) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleDecrement = (itemId) => {
    setItemCounts((prev) => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0),
    }));
  };

  const getTotalCount = () => {
    return Object.values(itemCounts).reduce((total, count) => total + count, 0);
  };

  const getTotalPrice = () => {
    return Object.keys(itemCounts)
      .reduce((total, itemId) => {
        const count = itemCounts[itemId] || 0;
        const item = menuItems.find((menuItem) => menuItem.id === itemId);
        return total + (item ? item.price * count : 0);
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    const totalCount = getTotalCount();
    if (totalCount === 0) {
      Alert.alert("No items selected", "Add items to your cart");
    } else {
      navigation.navigate("Checkout", { itemCounts, menuItems });
    }
  };

  const handleOrders = () => {
    navigation.navigate("Orders");
  };

  const renderItem = ({ item }) => {
    const isSoldOut = item.quantity === 0;
    const itemCount = itemCounts[item.id] || 0; // Get the current count
  
    return (
      <View style={[styles.cardContainer, isSoldOut && styles.soldOut]}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {isSoldOut && <View style={styles.overlay} />}
        <View style={styles.infoContainer}>
          <Text style={[styles.itemName, isSoldOut && styles.soldOutText]}>
            {item.name}
          </Text>
          <Text style={[styles.itemPrice, isSoldOut && styles.soldOutText]}>
            {isSoldOut ? "Sold Out" : `$${item.price.toFixed(2)}`}
          </Text>
        </View>
        {!isSoldOut && (
          <View style={styles.counterContainer}>
            {itemCount === 0 ? (
              <TouchableOpacity
                onPress={() => handleIncrement(item.id)}
                style={styles.iconButton}
              >
                <Icon name="add-circle" size={34} color="#287618" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => handleDecrement(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.counterText}>{itemCount}</Text>
                <TouchableOpacity
                  onPress={() => handleIncrement(item.id)}
                  style={styles.counterButton}
                >
                  <Text style={styles.counterButtonText}>+</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderCategory = ({ item }) => {
    if (groupedMenuItems.singleItemCategories[item]) {
      return (
        <View style={styles.singleItemContainer}>
          {groupedMenuItems.singleItemCategories[item].map((menuItem) => (
            <View style={styles.cardContainer} key={menuItem.id}>
              <Image source={{ uri: menuItem.image }} style={styles.image} />
              <View style={styles.infoContainer}>
                <Text style={styles.itemName}>{menuItem.name}</Text>
                <Text style={styles.itemPrice}>
                  ${menuItem.price.toFixed(2)}
                </Text>
              </View>
              <View style={styles.counterContainer}>
                {itemCounts[menuItem.id] === 0 ? (
                  <TouchableOpacity
                    onPress={() => handleIncrement(menuItem.id)} // Use menuItem.id
                    style={styles.iconButton}
                  >
                    <Icon name="add-circle" size={34} color="#287618" />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleDecrement(menuItem.id)}
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.counterText}>
                      {itemCounts[menuItem.id]}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleIncrement(menuItem.id)}
                      style={styles.counterButton}
                    >
                      <Text style={styles.counterButtonText}>+</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
      );
    } else {
      return (
        <View style={styles.categoryContainer}>
          <TouchableOpacity
            onPress={() => toggleCategory(item)}
            style={styles.categoryHeader}
          >
            <Text style={styles.categoryTitle}>{item}</Text>
            <Text style={styles.arrow}>
              {expandedCategories[item] ? " ▲" : " ▼"}
            </Text>
          </TouchableOpacity>
          {expandedCategories[item] && (
            <FlatList
              data={groupedMenuItems.multiItemCategories[item]}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
            />
          )}
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>
          Welcome, {user ? user.username : "Guest"}
        </Text>
        <TouchableOpacity
          onPress={() => setDropdownVisible(!dropdownVisible)}
          style={styles.hamburgerButton}
        >
          <Icon name="menu" size={30} color="#287618" />
        </TouchableOpacity>
      </View>

      {dropdownVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleOrders}>
            <Text style={styles.dropdownItemText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
            <Text style={[styles.dropdownItemText, styles.logoutText]}>
              Log Out
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={[
          ...Object.keys(groupedMenuItems.singleItemCategories),
          ...Object.keys(groupedMenuItems.multiItemCategories),
        ]}
        renderItem={renderCategory}
        keyExtractor={(category) => category}
      />

      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalCount}>Total Items: {getTotalCount()}</Text>
          <Text style={styles.totalPrice}>Total Price: ${getTotalPrice()}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  hamburgerButton: {
    padding: 10,
  },
  dropdownMenu: {
    position: "absolute",
    top: 50,
    right: 10,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    padding: 10,
    width: 120,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: 10,
  },
  dropdownItemText: {
    fontSize: 16,
    textAlign: "center",
  },
  logoutText: {
    color: "red",
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: "bold",
  },
  arrow: {
    fontSize: 18,
  },
  cardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
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
    fontSize: 20,
    fontWeight: "bold",
  },
  itemPrice: {
    fontSize: 18,
    color: "#333",
  },
  iconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  },
  soldOut: {
    backgroundColor: "#f0f0f0",
  },
  soldOutText: {
    color: "#888",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  counterButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  counterButtonText: {
    fontSize: 18,
  },
  counterText: {
    fontSize: 18,
    width: 30,
    textAlign: "center",
  },
  checkoutContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  totalContainer: {
    flex: 1,
  },
  totalCount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#287618",
  },
  checkoutButton: {
    backgroundColor: "#287618",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
