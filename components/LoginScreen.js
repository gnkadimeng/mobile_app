import React, { useState, useEffect } from "react";
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
  Linking,
  ScrollView
} from "react-native";
import { IconButton } from "react-native-paper";
import axios from "axios";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import API_CONFIG, { ENDPOINTS } from "../config"; // Import the config

const LoginScreen = ({ onNavigateBack, onLoginSuccess, onNavigateToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'

  // Check if backend API is available on component mount
  useEffect(() => {
    checkApiHealth();
  }, []);

  const checkApiHealth = async () => {
    try {
      const config = API_CONFIG();
      const response = await axios.get(`${config.BASE_URL}${ENDPOINTS.HEALTH}`, {
        timeout: 10000
      });
      setApiStatus('online');
      console.log('✅ Backend is online:', config.BASE_URL);
      return true;
    } catch (error) {
      setApiStatus('offline');
      console.error('❌ Backend is offline:', error.message);
      return false;
    }
  };

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
      
      // First check if backend is available
      const isBackendOnline = await checkApiHealth();
      
      if (!isBackendOnline) {
        Alert.alert(
          "Connection Issue", 
          `Unable to connect to the server. Please check:\n\n• Your internet connection\n• Backend server status\n• API configuration\n\nCurrent endpoint: ${API_CONFIG().BASE_URL}`
        );
        return;
      }

      const config = API_CONFIG();
      console.log("API Base URL:", config.BASE_URL);

      // Use the single login endpoint for all user types
      const loginResponse = await axios.post(
        `${config.BASE_URL}${ENDPOINTS.LOGIN}`,
        {
          email,
          password,
        },
        {
          timeout: 15000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      console.log("Login response:", loginResponse.data);

      if (loginResponse.data.message === "Login successful") {
        const userData = loginResponse.data.user;
        const userEmail = userData.email;
        const accountType = userData.accounttype;
        
        console.log("Login successful for:", userEmail, "Role:", accountType);
        
        // Pass the complete user data to the success handler
        onLoginSuccess(userEmail, userData);
      } else {
        Alert.alert("Login Failed", loginResponse.data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Enhanced error handling
      let errorTitle = "Login Error";
      let errorMessage = "Something went wrong. Please try again.";

      if (error.code === 'ECONNABORTED') {
        errorTitle = "Connection Timeout";
        errorMessage = "The request took too long. Please check your connection and try again.";
      } else if (error.response) {
        // Server responded with error status
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
        
        switch (error.response.status) {
          case 401:
            errorMessage = "Invalid email or password. Please check your credentials.";
            break;
          case 403:
            errorMessage = "Access denied. Your account may not have the required permissions.";
            break;
          case 404:
            errorMessage = "Login service not available. Please contact administrator.";
            break;
          case 500:
            errorMessage = "Server error. Please try again later.";
            break;
          default:
            errorMessage = error.response.data?.message || errorMessage;
        }
      } else if (error.request) {
        // Network error
        errorTitle = "Network Error";
        errorMessage = `Cannot connect to server at ${API_CONFIG().BASE_URL}. Please check:\n\n• Your internet connection\n• Backend server status\n• API configuration`;
      }

      Alert.alert(errorTitle, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderApiStatus = () => {
    const config = API_CONFIG();
    
    if (apiStatus === 'checking') {
      return (
        <View style={styles.apiStatusContainer}>
          <ActivityIndicator size="small" color="#FF8F00" />
          <Text style={styles.apiStatusText}>Checking server connection...</Text>
        </View>
      );
    }
    
    if (apiStatus === 'offline') {
      return (
        <View style={[styles.apiStatusContainer, styles.apiStatusOffline]}>
          <MaterialIcons name="error-outline" size={16} color="#F44336" />
          <Text style={[styles.apiStatusText, styles.apiStatusTextOffline]}>
            Server offline - {config.BASE_URL.replace('https://', '').replace('http://', '')}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.apiStatusContainer, styles.apiStatusOnline]}>
        <MaterialIcons name="check-circle-outline" size={16} color="#4CAF50" />
        <Text style={[styles.apiStatusText, styles.apiStatusTextOnline]}>
          Server online - {config.BASE_URL.replace('https://', '').replace('http://', '')}
        </Text>
      </View>
    );
  };

  const handleRetryConnection = async () => {
    setLoading(true);
    await checkApiHealth();
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.backButtonWrapper} onPress={onNavigateBack}>
          <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        {/* Connection Retry in Navbar */}
        <View style={styles.navbarStatus}>
          {apiStatus === 'offline' && (
            <TouchableOpacity onPress={handleRetryConnection} style={styles.retryButton}>
              <Ionicons name="refresh-outline" size={16} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Unified Login Portal</Text>
      
          
          {/* API Status Indicator */}
          {renderApiStatus()}

          <TextInput
            style={[
              styles.input,
              (apiStatus === 'offline' || loading) && styles.inputDisabled
            ]}
            placeholder="Email"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            editable={!loading && apiStatus !== 'checking'}
          />

          <TextInput
            style={[
              styles.input,
              (apiStatus === 'offline' || loading) && styles.inputDisabled
            ]}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry
            autoComplete="password"
            value={password}
            onChangeText={setPassword}
            editable={!loading && apiStatus !== 'checking'}
            onSubmitEditing={handleLogin}
          />

          {/* Sign In Button */}
          <View style={styles.buttonContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2C0A40" />
                <Text style={styles.loadingText}>
                  {apiStatus === 'checking' ? 'Checking connection...' : 'Signing in...'}
                </Text>
              </View>
            ) : (
              <TouchableOpacity 
                style={[
                  styles.loginButton, 
                  (apiStatus === 'offline' || apiStatus === 'checking') && styles.loginButtonDisabled
                ]}
                onPress={handleLogin}
                disabled={apiStatus === 'offline' || apiStatus === 'checking'}
              >
                <Text style={styles.loginButtonText}>
                  {apiStatus === 'offline' ? 'Server Offline' : 'SIGN IN'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Register link */}
          <TouchableOpacity onPress={handleRegisterRedirect} disabled={loading}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLink}>Register here</Text>
            </Text>
          </TouchableOpacity>

          {/* Connection Help */}
          {apiStatus === 'offline' && (
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>Connection Help</Text>
              <Text style={styles.helpText}>
                • Check your internet connection{"\n"}
                • Verify the backend server is running{"\n"}
                • Contact IT support if issue persists{"\n"}
                • Current endpoint: {API_CONFIG().BASE_URL}
              </Text>
            </View>
          )}

          {/* User Type Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Supported User Types</Text>
            <View style={styles.infoItem}>
              <Ionicons name="school-outline" size={20} color="#3A0A53" />
              <Text style={styles.infoText}>Students - Access SSDD system</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="business-outline" size={20} color="#3A0A53" />
              <Text style={styles.infoText}>SDF Companies - Access GMS system</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="person-outline" size={20} color="#3A0A53" />
              <Text style={styles.infoText}>SDF Companies  - Access IMS system</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Copyright © {new Date().getFullYear()}, CHIETA. All rights reserved.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    flexGrow: 1,
  },
  navbar: {
    backgroundColor: "#2C0A40",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButtonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  backButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  navbarStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    marginLeft: 6,
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 24,
    paddingTop: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2C0A40",
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: "#3A0A53",
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 20,
  },
  // API Status Styles
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'stretch',
  },
  apiStatusOnline: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  apiStatusOffline: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  apiStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  apiStatusTextOnline: {
    color: '#4CAF50',
  },
  apiStatusTextOffline: {
    color: '#F44336',
  },
  input: {
    width: "100%",
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#D1D5DB",
    backgroundColor: "white",
    fontSize: 16,
    color: "#2C3E50",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
    opacity: 0.7,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 8,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: "#2C0A40",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#6B7280",
    opacity: 0.6,
  },
  loginButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
    textAlign: 'center',
  },
  registerText: {
    marginTop: 8,
    color: '#2C0A40',
    fontSize: 14,
    textAlign: 'center',
  },
  registerLink: {
    color: '#FF8F00',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  // Help Container
  helpContainer: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
    alignSelf: 'stretch',
    marginTop: 20,
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  // Info Container
  infoContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  footer: {
    backgroundColor: "#2C0A40",
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  footerSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
});

export default LoginScreen;