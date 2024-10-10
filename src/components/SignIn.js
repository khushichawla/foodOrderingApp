import React, { useState } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { supabase } from '../supabaseClient';
import { Button, Input } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';

export default function SignIn() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState(''); // This can be email or phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true); // Set loading state

    // Retrieve user profile based on email or phone number
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError);
      Alert.alert('Sign In Error', 'Invalid email or phone number.');
      setLoading(false);
      return;
    }

    // Check if the password matches
    if (profile.password !== password) {
      console.error('Invalid password');
      Alert.alert('Sign In Error', 'Incorrect password.');
      setLoading(false);
      return;
    }

    // Password is correct, check user status
    if (profile.status === 'pending') {
        // Can change pop up text here
      Alert.alert('Login Successful', 'Your authorization from admin is pending. Please wait for it to be approved.');
    } else if (profile.status === 'approved') {
      navigation.navigate('Menu'); // Redirect to Menu screen
    }

    setLoading(false); // Reset loading state
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email or Phone Number"
        onChangeText={setIdentifier}
        value={identifier}
        placeholder="example@mail.com or 12345678"
        autoCapitalize="none"
      />
      <Input
        label="Password"
        onChangeText={setPassword}
        value={password}
        placeholder="********"
        secureTextEntry
      />
      <Button title="Sign In" disabled={loading} onPress={signIn} />
      <View style={styles.footer}>
        <Text>New User? </Text>
        <Text 
          style={styles.link} 
          onPress={() => navigation.navigate('SignUp')}
        >
          Sign Up
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