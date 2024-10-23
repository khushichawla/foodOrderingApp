import React, { useState } from 'react';
import { 
  View, Text, TextInput, Button, StyleSheet, Alert, 
  TouchableOpacity, Image, KeyboardAvoidingView, Platform, FlatList, Modal, ScrollView 
} from 'react-native';
import { supabase } from '../supabaseClient';
import * as ImagePicker from 'expo-image-picker';

const AddItem = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState(null);
  const [status, setStatus] = useState('enable');
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    { label: 'Breads', value: 'Breads' },
    { label: 'Curries', value: 'Curries' },
    { label: 'Rice', value: 'Rice' },
    { label: 'Sides', value: 'Sides' },
    { label: 'Condiments', value: 'Condiments' },
  ];

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddItem = async () => {
    if (!name || !price || !image || !quantity || !category) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    const fileName = `${Date.now()}_${image.split('/').pop()}`;
    const { data, error: uploadError } = await supabase.storage
      .from('foodImages')
      .upload(fileName, {
        uri: image,
        type: 'image/jpeg',
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return;
    }

    const imageUrl = `https://llsjhmarfuipnzgwkngm.supabase.co/storage/v1/object/public/foodImages/${fileName}`;

    const { error } = await supabase
      .from('menu_items')
      .insert([
        {
          name,
          price: parseFloat(price),
          image: imageUrl,
          quantity: parseInt(quantity),
          category,
          status,
        },
      ]);

    if (error) {
      console.error("Error adding item:", error);
    } else {
      navigation.goBack();
    }
  };

  const selectCategory = (value) => {
    setCategory(value);
    setModalVisible(false);
  };

  const renderFormField = ({ item }) => {
    switch (item.type) {
      case 'text':
        return (
          <>
            <Text style={styles.label}>{item.label}:</Text>
            <TextInput 
              style={styles.input} 
              value={item.value} 
              onChangeText={item.onChange} 
              keyboardType={item.keyboardType} 
            />
          </>
        );
      case 'image':
        return (
          <>
            <Text style={styles.label}>Image:</Text>
            <TouchableOpacity onPress={handleImagePick} style={styles.uploadButton}>
              <Text style={styles.uploadButtonText}>
                {image ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
          </>
        );
      case 'dropdown':
        return (
          <>
            <Text style={styles.label}>Category:</Text>
            <TouchableOpacity 
              style={styles.dropdownTrigger} 
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.dropdownText}>
                {category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Select a category'}
              </Text>
            </TouchableOpacity>
          </>
        );
      case 'status':
        return (
          <>
            <Text style={styles.label}>Status:</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                { borderColor: status === 'enable' ? 'green' : 'red', borderWidth: 2, backgroundColor: 'transparent' }
              ]}
              onPress={() => setStatus(status === 'enable' ? 'disable' : 'enable')}
            >
              <Text style={[styles.toggleButtonText, { color: status === 'enable' ? 'green' : 'red' }]}>
                {status === 'enable' ? 'Enabled' : 'Disabled'}
              </Text>
            </TouchableOpacity>
          </>
        );
      default:
        return null;
    }
  };

  const formFields = [
    { type: 'text', label: 'Name', value: name, onChange: setName },
    { type: 'text', label: 'Price', value: price, onChange: setPrice, keyboardType: 'numbers-and-punctuation' },
    { type: 'image' },
    { type: 'text', label: 'Quantity', value: quantity, onChange: setQuantity, keyboardType: 'numbers-and-punctuation' },
    { type: 'dropdown' },
    { type: 'status' },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <FlatList 
        data={formFields}
        renderItem={renderFormField}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.scrollContainer}
      />
      <View style={styles.saveContainer}>
      <TouchableOpacity style={styles.saveButton} onPress={handleAddItem}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>

      {/* Modal for Category Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select a Category</Text>
            <ScrollView>
              {categories.map((item) => (
                <TouchableOpacity 
                  key={item.value} 
                  style={styles.modalItem} 
                  onPress={() => selectCategory(item.value)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 16,
    fontFamily: 'Montserrat',
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
  },
  uploadButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    backgroundColor: '#e7f3ff',
    marginVertical: 10,
  },
  uploadButtonText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 10,
    borderRadius: 5,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  toggleButtonText: {
    fontWeight: 'bold',
  },
  dropdownTrigger: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fafafa',
    zIndex: 10,
  },
  dropdownText: {
    textAlign: 'center',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalItemText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveContainer: {
    alignItems: 'center',
    marginBottom: 100,
  },
  saveButton: {
    backgroundColor: '#007BFF', // Change to your desired color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: 350,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default AddItem;