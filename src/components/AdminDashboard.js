// import React, { useEffect, useState } from "react";
// import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, Pressable } from "react-native";
// import { supabase } from "../supabaseClient"; // Adjust the import as necessary
// import { Ionicons } from "@expo/vector-icons"; // Make sure to import Ionicons
// import { useAuth } from "../AuthContext"; // Import useAuth for user context
// import { useNavigation } from "@react-navigation/native"; // Import useNavigation for navigation

// const AdminMenu = () => {
//   const { user, logout: contextLogout } = useAuth(); // Get user information and logout function from AuthContext
//   const navigation = useNavigation(); // For navigation
//   const [menuItems, setMenuItems] = useState([]);
//   const [sideNavVisible, setSideNavVisible] = useState(false);
//   const slideAnim = useState(new Animated.Value(-250))[0]; // Start off-screen to the left

//   useEffect(() => {
//     fetchMenuItems();
//   }, []);

//   const fetchMenuItems = async () => {
//     const { data, error } = await supabase.from("menu_items").select("*");
//     if (error) {
//       console.error("Error fetching menu items:", error);
//     } else {
//       console.log("Fetched menu items:", data);
//       setMenuItems(data);
//     }
//   };

//   const toggleSideNav = () => {
//     setSideNavVisible((prev) => !prev);
//     Animated.timing(slideAnim, {
//       toValue: sideNavVisible ? -250 : 0,
//       duration: 300,
//       useNativeDriver: true,
//     }).start();
//   };

//   const handleLogout = async () => {
//     await contextLogout(); // Call the logout function from context
//     navigation.navigate("SignIn"); // Navigate to SignIn screen
//   };

//   const toggleStatus = async (id) => {
//     const itemToToggle = menuItems.find(item => item.id === id);
//     const newStatus = itemToToggle.status === 'enable' ? 'disable' : 'enable';
//     const isEnabled = newStatus === 'enable';

//     const { error } = await updateStatusInDB(id, isEnabled);
//     if (!error) {
//       setMenuItems(
//         menuItems.map(item =>
//           item.id === id ? { ...item, status: newStatus, is_enabled: isEnabled } : item
//         )
//       );
//     } else {
//       console.error("Error updating status:", error);
//     }
//   };

//   const updateStatusInDB = async (id, isEnabled) => {
//     const status = isEnabled ? 'enable' : 'disable';
//     const { error } = await supabase
//       .from('menu_items')
//       .update({ status: status }) // Ensure the column name is correct
//       .eq('id', id);
    
//     return { error }; // Return the error for handling in toggleStatus
//   };

//   const groupByCategory = (items) => {
//     return items.reduce((result, item) => {
//       if (!result[item.category]) {
//         result[item.category] = [];
//       }
//       result[item.category].push(item);
//       return result;
//     }, {});
//   };

//   const groupedMenuItems = groupByCategory(menuItems);

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={toggleSideNav} style={styles.hamburger}>
//           <Ionicons name="menu" size={30} color="#287618" />
//         </TouchableOpacity>
//         <Text style={styles.greeting}>
//           Hello, {user?.username || "User"}
//         </Text>
//       </View>

//       <Animated.View style={[styles.sideNav, { transform: [{ translateX: slideAnim }] }]}>
//         <View style={styles.sideNavContent}>
//           <Pressable onPress={() => console.log("Add Item")}>
//             <Text style={styles.dropdownItem}>Add Item</Text>
//           </Pressable>
//           <View style={styles.separator} />
//           <Pressable onPress={() => console.log("Customers")}>
//             <Text style={styles.dropdownItem}>Customers</Text>
//           </Pressable>
//           <View style={styles.separator} />
//           <Pressable onPress={() => console.log("Orders")}>
//             <Text style={styles.dropdownItem}>Orders</Text>
//           </Pressable>
//           <View style={styles.separator} />
//           <Pressable onPress={handleLogout}>
//             <Text style={styles.dropdownItem}>Logout</Text>
//           </Pressable>
//           <View style={styles.separator} />
//           <Pressable onPress={toggleSideNav}>
//             <Text style={[styles.dropdownItem, styles.closeButton]}>Close</Text>
//           </Pressable>
//         </View>
//       </Animated.View>

//       {sideNavVisible && <View style={styles.overlay} />}

//       <ScrollView style={styles.scrollView}>
//         {Object.keys(groupedMenuItems).map((category) => (
//           <View key={category} style={styles.categoryContainer}>
//             <Text style={styles.categoryTitle}>{category}</Text>
//             {groupedMenuItems[category].map((item) => (
//               <View key={item.id} style={styles.card}>
//                 <Image source={{ uri: item.image }} style={styles.image} />
//                 <Text style={styles.cardTitle}>{item.name}</Text>
//                 <TouchableOpacity
//                   style={[
//                     styles.toggleButton,
//                     { backgroundColor: item.status === 'enable' ? 'green' : 'red' }
//                   ]}
//                   onPress={() => toggleStatus(item.id)}
//                 >
//                   <Text style={styles.toggleButtonText}>
//                     {item.status === 'enable' ? 'Enabled' : 'Disabled'}
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//             ))}
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f8f8f8",
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     padding: 16,
//     backgroundColor: "#fff",
//     elevation: 5,
//   },
//   greeting: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#287618",
//     marginLeft: 16,
//   },
//   hamburger: {
//     padding: 8,
//     backgroundColor: "white",
//     borderRadius: 50,
//     elevation: 3,
//   },
//   sideNav: {
//     position: "absolute",
//     left: 0,
//     top: 0,
//     backgroundColor: "white",
//     borderRightWidth: 1,
//     borderRightColor: "#ccc",
//     width: 250,
//     height: "100%",
//     padding: 20,
//     elevation: 5,
//     zIndex: 10,
//   },
//   sideNavContent: {
//     marginTop: 40,
//   },
//   dropdownItem: {
//     padding: 12,
//     fontSize: 20,
//     color: "#287618",
//     fontWeight: "bold",
//     textAlign: "left",
//   },
//   closeButton: {
//     color: "red",
//   },
//   separator: {
//     height: 1,
//     backgroundColor: "#ccc",
//     marginVertical: 8,
//   },
//   overlay: {
//     position: "absolute",
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     zIndex: 5,
//   },
//   scrollView: {
//     padding: 16,
//   },
//   categoryContainer: {
//     marginVertical: 16,
//   },
//   categoryTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   card: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: "white",
//     borderRadius: 8,
//     padding: 16,
//     marginVertical: 8,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   image: {
//     width: 60,
//     height: 60,
//     borderRadius: 8,
//     marginRight: 16,
//   },
//   cardTitle: {
//     flex: 1,
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   toggleButton: {
//     padding: 10,
//     borderRadius: 5,
//     alignItems: 'center',
//   },
//   toggleButtonText: {
//     color: 'white',
//     fontWeight: 'bold',
//   },
// });

// export default AdminMenu;