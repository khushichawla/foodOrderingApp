// src/App.js

import "react-native-url-polyfill/auto";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useState, useEffect } from "react";
import { supabase } from "./src/supabaseClient";
import { AuthProvider } from "./src/AuthContext";
import { CartProvider } from "./src/CartContext";
import SignIn from "./src/components/SignIn";
import SignUp from "./src/components/SignUp";
import Menu from "./src/components/Menu";
import Checkout from "./src/components/Checkout";
import Orders from "./src/components/Orders";
import AdminMenu from "./src/components/AdminMenu";
import AddItem from "./src/components/AddItem";
import AdminOrders from "./src/components/AdminOrders";
import AdminCustomers from "./src/components/AdminCustomers";
import PendingOrders from "./src/components/PendingOrders";
import { TouchableOpacity, Text } from "react-native";

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

  // console.log("Session data:", session); // Log session data for debugging

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="SignIn">
            <Stack.Screen
              name="SignIn"
              component={SignIn}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Menu"
              component={Menu}
              options={{
                headerLeft: () => false,
                title: "Menu",
              }}
            />
            <Stack.Screen
              name="Checkout"
              component={Checkout}
              options={{
                title: "Checkout",
              }}
            />
            <Stack.Screen
              name="Orders"
              component={Orders}
              options={{
                title: "Your Orders",
              }}
            />
            <Stack.Screen
              name="AdminMenu"
              component={AdminMenu}
              options={{ headerShown: false }}
              // options={{ headerShown: false }}
            />
            <Stack.Screen name="AddItem" component={AddItem} options={{
                title: "Add Item",
                headerBackTitle: "Back",
              }}/>
            <Stack.Screen name="AdminOrders" component={AdminOrders} options={{
                title: "Orders",
                headerBackTitle: "Back",
              }}/>
            <Stack.Screen
              name="AdminCustomers"
              component={AdminCustomers}
              options={{
                title: "Customers",
                headerBackTitle: "Back",
              }}
            />
            <Stack.Screen
              name="PendingOrders"
              component={PendingOrders}
              options={{ title: "Pending Orders" }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}
