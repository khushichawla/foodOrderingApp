// src/App.js

import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import { supabase } from "./src/supabaseClient";
import SignIn from "./src/components/SignIn";
import SignUp from "./src/components/SignUp";
import Menu from "./src/components/Menu";
import { View, Text } from "react-native";

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  console.log("Session data:", session); // Log session data for debugging

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen
          name="Menu"
          component={Menu}
          options={{
            headerLeft: () => false, // Hides the back button while keeping the header visible
            title: 'Menu',
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
