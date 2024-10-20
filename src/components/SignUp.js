import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, Text, Image, KeyboardAvoidingView, Platform, Keyboard } from "react-native";
import { supabase } from "../supabaseClient";
import { Button, Input } from "@rneui/themed";

export default function SignUp({ navigation }) {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailInputStyle, setEmailInputStyle] = useState(styles.input);
  const [passwordInputStyle, setPasswordInputStyle] = useState(styles.input);

  async function signUp() {
    setLoading(true);

    // Check if the email or phone number already exists
    const { data: existingUser, error: userError } = await supabase
      .from("user_profile")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .single();

    if (existingUser) {
      Alert.alert("Sign Up Error", "Already signed up. Please log in.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("SignIn"),
        },
      ]);
      setLoading(false);
      return;
    }

    // Insert additional user info into user_profile table
    const { data, error: profileError } = await supabase
      .from("user_profile")
      .insert([
        {
          phone,
          email,
          username,
          password,
          status: "Pending",
        },
      ]);

    if (profileError) {
      console.error("Error saving profile:", profileError);
      Alert.alert("Profile Error", profileError.message || "An unknown error occurred.");
    } else {
      Alert.alert("Success", "Your account has been created successfully!", [
        {
          text: "OK",
          onPress: () => navigation.navigate("SignIn"),
        },
      ]);
    }

    setLoading(false);
  }

  const handleEmailInputFocus = () => {
    setEmailInputStyle([styles.input, styles.inputFocused]);
  };

  const handleEmailInputBlur = () => {
    setEmailInputStyle(styles.input);
  };

  const handlePasswordInputFocus = () => {
    setPasswordInputStyle([styles.input, styles.inputFocused]);
  };

  const handlePasswordInputBlur = () => {
    setPasswordInputStyle(styles.input);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Image
        source={{
          uri: "https://llsjhmarfuipnzgwkngm.supabase.co/storage/v1/object/public/foodImages/CKFood.png",
        }}
        style={styles.logo}
        resizeMode="contain"
      />
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
        placeholder="12345678"
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
        onFocus={handleEmailInputFocus}
        onBlur={handleEmailInputBlur}
        inputStyle={emailInputStyle}
      />
      <Input
        label="Password"
        onChangeText={setPassword}
        value={password}
        placeholder="********"
        secureTextEntry
        onFocus={handlePasswordInputFocus}
        onBlur={handlePasswordInputBlur}
        inputStyle={passwordInputStyle}
      />
      <Button
        title="Sign Up"
        disabled={loading}
        onPress={signUp}
        buttonStyle={styles.button}
      />
      <View style={styles.footer}>
        <Text>Already have an account? </Text>
        <Text style={styles.link} onPress={() => navigation.navigate("SignIn")}>
          Sign In
        </Text>
      </View>
    </KeyboardAvoidingView>
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
    width: 150,
    height: 150,
    alignSelf: "center",
    marginBottom: 60,
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
  input: {
    paddingVertical: 10,
  },
  inputFocused: {
    paddingVertical: 15,
  },
});