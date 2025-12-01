import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Image,
} from "react-native";
import { IconButton } from "react-native-paper";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";


const IMsScreenLogin = ({ onNavigateBack, onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting GM login with:", { email, password });

      const response = await axios.post("http://172.20.10.14:5000/GMsLogin", {
        email,
        password
      });

      console.log("Login response:", response.data);

      if (response.data.message === "GMsLogin successful") {
        const userData = response.data.user;
        console.log("GMS Login successful for:", userData.email);
        onLoginSuccess(userData.email);
      } else {
        Alert.alert("Login Failed", response.data.message || "Invalid credentials or unauthorized access");
      }
    } catch (error) {
      console.error("GM Login error:", error);
      let errorMessage = "Something went wrong. Please try again.";

      if (error.response) {
        // The request was made and the server responded with a status code
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        errorMessage = "No response from server. Please check your connection.";
      }

      Alert.alert("Login Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={onNavigateBack}>
          <Ionicons name="arrow-back-outline" size={20} color="#3A0A53" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
      </View>

      {/* Login Form */}
      <View style={styles.formContainer}>
  

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Sign In Button */}
        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#CE8946" />
          ) : (
            <Button
              title="SIGN IN"
              onPress={handleLogin}
              color="#3A0A53"
            />
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Copyright © 2025, CHIETA. All rights reserved.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
  },
  navbar: {
    backgroundColor: "#3A0A53",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
  },
  formContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3A0A53",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "#3A0A53",
    backgroundColor: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  footer: {
    backgroundColor: "#3A0A53",
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 14,
  },
  backButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A0A53',
    marginLeft: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  backButtonText: {
    marginLeft: 6,
    color: '#3A0A53',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default IMsScreenLogin;
