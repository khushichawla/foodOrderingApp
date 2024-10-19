import React, { useState } from "react";
import { Alert, StyleSheet, View, Text, Image } from "react-native";
import { supabase } from "../supabaseClient";
import { Button, Input } from "@rneui/themed";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext"; // Import your Auth context

export default function SignIn() {
  const navigation = useNavigation();
  const { login } = useAuth(); // Access the login function from context
  const [identifier, setIdentifier] = useState(""); // This can be email or phone
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function signIn() {
    setLoading(true);

    // Retrieve user profile based on email or phone number
    const { data: profile, error: profileError } = await supabase
      .from("user_profile")
      .select("*")
      .or(`email.eq.${identifier},phone.eq.${identifier}`)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      Alert.alert("Sign In Error", "Invalid email or phone number.");
      setLoading(false);
      return;
    }

    // Check if the password matches
    if (profile.password !== password) {
      console.error("Invalid password");
      Alert.alert("Sign In Error", "Incorrect password.");
      setLoading(false);
      return;
    }

    // Password is correct, check user status
    if (profile.status === "pending") {
      Alert.alert(
        "Login Successful",
        "Your authorization from admin is pending. Please wait for it to be approved."
      );
    } else if (profile.status === "approved") {
      // After successful sign-in, store user data in context
      login({
        user_id: profile.user_id,
        phone: profile.phone,
        email: profile.email,
        username: profile.username,
      });

      navigation.navigate("Menu"); // Redirect to the menu
    }

    setLoading(false);
  }

  return (
    <View style={styles.container}>
      {/* Logo Image */}
      <Image
        source={{
          uri: "https://llsjhmarfuipnzgwkngm.supabase.co/storage/v1/object/public/foodImages/CKFood.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />
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
      <Button
        title="Sign In"
        disabled={loading}
        onPress={signIn}
        buttonStyle={styles.button}
      />
      <View style={styles.footer}>
        <Text>New User? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate("SignUp")}>
          Sign Up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "white",
  },
  logo: {
    width: 150, // Adjust width as needed
    height: 150, // Adjust height as needed
    alignSelf: "center", // Center the logo
    marginBottom: 60, // Add space below the logo
    marginTop: -80,
  },
  button: {
    backgroundColor: "#287618",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
