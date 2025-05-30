import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Linking
} from "react-native";
import { IconButton } from "react-native-paper";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ onNavigateBack, onLoginSuccess, onNavigateToGMS, onNavigateToIMS }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegisterRedirect = () => {
    Linking.openURL("https://chieta-co-za-ssdd.onrender.com/")
      .catch(err => console.error("Failed to open URL:", err));
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Email and password are required.");
      return;
    }

    setLoading(true);
    try {
      console.log("Attempting to login with:", { email, password });

      const loginResponse = await axios.post("http://10.114.30.114:5000/login", {
        email,
        password,
      });

      if (loginResponse.data.message === "Login successful") {
        const userEmail = loginResponse.data.user.email;
        Alert.alert("Success", `Login successful for ${userEmail}`);
        onLoginSuccess(userEmail);
      } else {
        Alert.alert("Error", loginResponse.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={onNavigateBack}>
          <Ionicons name="arrow-back-outline" size={20} color="#3A0A53" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>SIGN IN</Text>

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

        <View style={styles.buttonContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#CE8946" />
          ) : (
            <Button title="SIGN IN" onPress={handleLogin} color="#3A0A53" />
          )}
        </View>

        {/* Register link */}
        <TouchableOpacity onPress={handleRegisterRedirect}>
          <Text style={styles.registerText}>
            Don't have an account? <Text style={styles.registerLink}>Register here</Text>
          </Text>
        </TouchableOpacity>

        {/* Additional login options */}
        <View style={styles.alternativeLoginContainer}>
          <Button 
            title="Login with Google"
            color="#fff" 
            onPress={onNavigateToGMS} 
            style={styles.alternativeButton}
          />
          <Button 
            title="IMS" 
            color="#fff" 
            onPress={onNavigateToIMS} 
            style={styles.alternativeButton}
          />
        </View>
      </View>

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
  },
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 10,
  },
  alternativeLoginContainer: {
    marginTop: 20,
    width: '100%',
  },
  alternativeButton: {
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
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: 10,
  },
  backButtonText: {
    marginLeft: 6,
    color: '#3A0A53',
    fontWeight: 'bold',
    fontSize: 14,
  },
  registerText: {
    marginTop: 15,
    color: '#3A0A53',
  },
  registerLink: {
    color: '#CE8946',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;