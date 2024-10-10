// src/components/Menu.js

import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

export default function Menu({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Menu!</Text>
      <Button title="Log Out" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});