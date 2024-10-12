import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust the path as needed

export default function Menu({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [itemCounts, setItemCounts] = useState({});

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase.from('menu_items').select('*');
      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setMenuItems(data);
      }
    };
    fetchMenuItems();
  }, []);

  const groupByCategory = (items) => {
    return items.reduce((acc, item) => {
      (acc[item.category] = acc[item.category] || []).push(item);
      return acc;
    }, {});
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
    return Object.keys(itemCounts).reduce((total, itemId) => {
      const count = itemCounts[itemId] || 0;
      const item = menuItems.find(menuItem => menuItem.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0).toFixed(2);
  };

  const handleCheckout = () => {
    navigation.navigate('Checkout', { itemCounts, menuItems });
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.infoContainer}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.counterContainer}>
        <TouchableOpacity onPress={() => handleDecrement(item.id)} style={styles.counterButton}>
          <Text style={styles.counterButtonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.counterText}>{itemCounts[item.id] || 0}</Text>
        <TouchableOpacity onPress={() => handleIncrement(item.id)} style={styles.counterButton}>
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCategory = ({ item }) => (
    <View style={styles.categoryContainer}>
      <TouchableOpacity onPress={() => toggleCategory(item)} style={styles.categoryHeader}>
        <Text style={styles.categoryTitle}>{item}</Text>
        <Text style={styles.arrow}>
          {expandedCategories[item] ? ' ▲' : ' ▼'}
        </Text>
      </TouchableOpacity>
      {expandedCategories[item] && (
        <FlatList
          data={groupedMenuItems[item]}
          renderItem={renderItem}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={Object.keys(groupedMenuItems)}
        renderItem={renderCategory}
        keyExtractor={category => category}
      />
      <View style={styles.checkoutContainer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalCount}>Total Items: {getTotalCount()}</Text>
          <Text style={styles.totalPrice}>Total Price: ${getTotalPrice()}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.goBack()}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  arrow: {
    fontSize: 18,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
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
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 18,
    color: '#333',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  counterButton: {
    borderWidth: 1,
    borderColor: '#ccc',
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
    textAlign: 'center',
  },
  checkoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to the start
    marginTop: 20,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalContainer: {
    flex: 1, // Allow totalContainer to take remaining space
  },
  totalCount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007BFF',
  },
  checkoutButton: {
    backgroundColor: '#f44336',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute',
    top: 40,
    right: 20,
  },
  logoutButtonText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
});