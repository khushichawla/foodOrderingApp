import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { supabase } from '../supabaseClient';
import { Button, Input } from '@rneui/themed';

export default function SignUp({ navigation }) {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUp() {
    setLoading(true); // Set loading state
    
    // Check if the email or phone number already exists
    const { data: existingUser, error: userError } = await supabase
      .from('user_profile')
      .select('*')
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();
  
    if (existingUser) {
      Alert.alert(
        'Sign Up Error', 
        'Already signed up. Please log in.', 
        [
          {
            text: 'OK', 
            onPress: () => navigation.navigate('SignIn') // Redirect to Sign In
          }
        ]
      ); // Show error alert
      setLoading(false); // Reset loading state
      return;
    }
  
    // Insert additional user info into user_profile table
    const {data, error: profileError } = await supabase
      .from('user_profile') // Ensure the table name is correct
      .insert([{
        phone, 
        email, 
        username,
        password,
        status: 'pending' 
      }]);
  
    if (profileError) {
      console.error('Error saving profile:', profileError);
      Alert.alert('Profile Error', profileError.message || 'An unknown error occurred.'); // Handle the error appropriately
    } else {
      console.log('User profile created successfully');
      Alert.alert(
        'Success', 
        'Your account has been created successfully!', 
        [
          {
            text: 'OK', 
            onPress: () => navigation.navigate('SignIn') // Redirect to Sign In
          }
        ]
      ); // Success message
    }
  
    setLoading(false); // Reset loading state
  }

  return (
    <View style={styles.container}>
      <Input
        label="Username"
        onChangeText={setUsername}
        value={username}
        placeholder="Choose a username"
      />
      <Input
        label="Phone Number"
        onChangeText={setPhone}
        value={phone}
        placeholder="+85212345678" // Example format
        keyboardType="phone-pad"
        autoCapitalize="none"
        maxLength={8}
      />
      <Input
        label="Email"
        onChangeText={setEmail}
        value={email}
        placeholder="example@mail.com"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        onChangeText={setPassword}
        value={password}
        placeholder="********"
        secureTextEntry
      />
      <Button title="Sign Up" disabled={loading} onPress={signUp} />
      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Text 
          style={styles.link} 
          onPress={() => navigation.navigate('SignIn')}
        >
          Sign In
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
});