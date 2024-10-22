import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { supabase } from '../supabaseClient'; // Adjust the import as necessary
import * as ImagePicker from 'expo-image-picker';

const AddItem = ({ navigation }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('enable'); // Default to 'enable'

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
      setImage(result.assets[0].uri); // Correctly set the image URI
    }
  };

  const handleAddItem = async () => {
    if (!name || !price || !image || !quantity || !category) {
      Alert.alert("Missing Information", "Please fill in all fields.");
      return;
    }

    const fileName = `${Date.now()}_${image.split('/').pop()}`;
    const { data, error: uploadError } = await supabase.storage
      .from('foodImages') // Replace with your bucket name
      .upload(fileName, {
        uri: image,
        type: 'image/jpeg', // Adjust based on your image type
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      return;
    }

    const imageUrl = `https://llsjhmarfuipnzgwkngm.supabase.co/storage/v1/object/public/foodImages/${fileName}`; // Adjust based on your Supabase URL

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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={20} // Adjust as needed
    >
      <Text style={styles.heading}>Add Item</Text>
      <Text>Name:</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text>Price:</Text>
      <TextInput 
        style={styles.input} 
        value={price} 
        onChangeText={setPrice} 
        keyboardType="numeric" 
      />
      <Text>Image:</Text>
      <TouchableOpacity onPress={handleImagePick} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>
          {image ? 'Change Image' : 'Upload Image'}
        </Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.imagePreview} />}
      <Text style={styles.label}>Quantity:</Text>
      <TextInput 
        style={styles.input} 
        value={quantity} 
        onChangeText={setQuantity} 
        keyboardType="numeric" 
      />
      <Text style={styles.label}>Category:</Text>
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />
      
      <Text>Status:</Text>
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

      <Button title="Save" onPress={handleAddItem} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
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
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: 'bold',
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
});

export default AddItem;