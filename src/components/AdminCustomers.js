import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { supabase } from "../supabaseClient";

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("Pending");
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .neq("status", "Admin"); // Exclude Admin users

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
    };

    fetchUsers();
  }, []);

  const toggleStatus = (status) => {
    setSelectedStatus(status);
  };

  const filteredUsers = users.filter((user) => user.status === selectedStatus);

  const updateUserStatus = async (userId, newStatus) => {
    const { error } = await supabase
      .from("user_profile")
      .update({ status: newStatus })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating user status:", error);
      Alert.alert("Error", "Could not update user status. Please try again.");
    } else {
      setUsers(
        users.map((user) =>
          user.user_id === userId ? { ...user, status: newStatus } : user
        )
      );
    //   Alert.alert("Success", "User status updated successfully.");
      setModalVisible(false);
    }
  };

  const openModal = (userId, currentStatus) => {
    setCurrentUserId(userId);
    setCurrentStatus(currentStatus);
    setModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#FFA500"; // Orange
      case "Approved":
        return "#28A745"; // Green
      case "Blocked":
        return "#DC3545"; // Red
      default:
        return "#000"; // Default black
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.toggleContainer}>
        {["Pending", "Approved", "Blocked"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.toggleButton,
              selectedStatus === status
                ? styles.activeToggle
                : styles.inactiveToggle,
            ]}
            onPress={() => toggleStatus(status)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                selectedStatus === status
                  ? { color: "white" }
                  : { color: "#007bff" },
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredUsers.length === 0 ? (
        <Text style={styles.emptyMessage}>No users found!</Text>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={({ item }) => (
            <View style={styles.cardContainer}>
              <Text style={styles.userInfoText}>
                {item.username} (+852 {item.phone})
              </Text>
              <View style={styles.statusContainer}>
                <Text style={styles.statusLabel}>
                  Status:{" "}
                  <Text style={{ color: getStatusColor(item.status) }}>
                    {item.status}
                  </Text>
                </Text>
                <TouchableOpacity
                  style={styles.statusButton}
                  onPress={() => openModal(item.user_id, item.status)}
                >
                  <Text style={styles.statusButtonText}>Change Status</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.user_id.toString()}
        />
      )}

      {/* Modal for Status Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Select New Status</Text>
            {["Pending", "Approved", "Blocked"].map((status) => (
              <Pressable
                key={status}
                style={[
                  styles.optionButton,
                  {
                    backgroundColor:
                      currentStatus === status
                        ? getStatusColor(status)
                        : "white",
                  },
                  currentStatus === status
                    ? styles.selectedOption
                    : styles.defaultOption,
                  { borderColor: getStatusColor(status) }, // Border color based on status
                ]}
                onPress={() => updateUserStatus(currentUserId, status)}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color:
                        currentStatus === status
                          ? "white"
                          : getStatusColor(status),
                    },
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    alignItems: "center",
    marginHorizontal: 5,
    elevation: 5, // Adds a shadow for 3D effect on Android
    shadowColor: "#000", // Shadow color for iOS
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  toggleButtonText: {
    fontSize: 14,
    textAlign: "center",
    color: "#007bff", // Default color for text
    fontWeight: "bold",
  },

  activeToggle: {
    backgroundColor: "#007bff", // Darker blue for active toggle
    color: "white", // Text color for active toggle
    elevation: 10, // Increased elevation for a stronger 3D effect
    shadowOpacity: 0.5, // Stronger shadow for active state
  },

  inactiveToggle: {
    backgroundColor: "#e7f3ff", // Lighter blue for inactive toggle
    color: "#007bff", // Text color for inactive toggle
  },
  cardContainer: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    backgroundColor: "#fff",
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusButton: {
    padding: 8,
    backgroundColor: "#007bff",
    borderRadius: 5,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#0056b3",
    marginTop: -10,
  },
  statusButtonText: {
    color: "white", // Text color
    fontWeight: "bold",
    fontSize: 12, // Increased font size for better readability
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%", // Set width for the modal
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18, // Increased size for heading
    fontWeight: "bold", // Bold heading
  },
  optionButton: {
    width: "100%", // Set width to 100% for equal sizing
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
    borderWidth: 2, // Border width
  },
  selectedOption: {
    borderColor: "transparent", // No border for selected option
  },
  defaultOption: {
    borderColor: "transparent", // No border for unselected options
  },
  optionText: {
    textAlign: "center", // Center align text
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#ff0000",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
  },
});

export default AdminCustomers;
