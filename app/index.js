import React, { useState, useEffect } from "react";
import { Provider as PaperProvider } from 'react-native-paper';
import { 
  Linking, 
  Alert, 
  BackHandler, 
  Modal, 
  TouchableOpacity, 
  Image, 
  StyleSheet, 
  View, 
  Text,
  ScrollView,
  useWindowDimensions
} from "react-native";
import SplashScreen from "../components/SplashScreen";
import LoginScreen from "../components/LoginScreen";
import RegisterScreen from "../components/RegisterScreen";
import HomeScreen from "../components/HomeScreen";
import WelcomeScreen from "../components/WelcomeScreen";
import SSDDScreen from "../components/SSDDScreen";
import GMsScreen from "../components/GMsScreen";
import IMsScreen from "../components/IMsScreen";

// Separate responsive component for the portal modal
const PortalModalContent = ({ onPortalSelect, onClose }) => {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 768;
  const isLandscape = width > height;

  return (
    <View style={[
      styles.modalOverlay,
      isLandscape && styles.landscapeOverlay
    ]}>
      <View style={[
        styles.modalContent,
        isSmallScreen && styles.smallModalContent,
        isLargeScreen && styles.largeModalContent,
        isLandscape && styles.landscapeModalContent,
        { maxWidth: isLargeScreen ? 700 : '90%' }
      ]}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.modalHeader}>
            <Text style={[
              styles.modalTitle,
              isSmallScreen && styles.smallModalTitle,
              isLargeScreen && styles.largeModalTitle
            ]}>
              Select Your Portal
            </Text>
            <Text style={[
              styles.modalSubtitle,
              isSmallScreen && styles.smallModalSubtitle
            ]}>
              Choose the portal you want to access
            </Text>
          </View>

          <View style={[
            styles.portalContainer,
            isLandscape && styles.landscapePortalContainer
          ]}>
            {/* IMS Portal Card */}
            <TouchableOpacity 
              style={[
                styles.portalCard,
                isSmallScreen && styles.smallPortalCard,
                isLandscape && styles.landscapePortalCard
              ]}
              onPress={() => onPortalSelect('ims')}
            >
              <View style={[
                styles.portalImageContainer, 
                styles.imsImageContainer,
                isSmallScreen && styles.smallPortalImageContainer,
                isLandscape && styles.landscapePortalImageContainer
              ]}>
                <Image 
                  source={require("../assets/images/chieta_logo.png")} 
                  style={styles.portalImage}
                  resizeMode="cover"
                />
                <View style={styles.portalOverlay}>
                  <Text style={[
                    styles.portalOverlayText,
                    isSmallScreen && styles.smallPortalOverlayText
                  ]}>
                    IMS Portal
                  </Text>
                </View>
              </View>
              <View style={styles.portalInfo}>
                <Text style={[
                  styles.portalName,
                  isSmallScreen && styles.smallPortalName
                ]}>
                  Implementation Manager System
                </Text>
                <Text style={[
                  styles.portalDescription,
                  isSmallScreen && styles.smallPortalDescription
                ]}>
                  Manage grant applications, track submissions, and oversee organizational compliance
                </Text>
                <View style={styles.portalFeatures}>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Grant Application Management
                  </Text>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Document Tracking
                  </Text>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Organization Oversight
                  </Text>
                </View>
              </View>
              <View style={[styles.selectButton, styles.imsButton]}>
                <Text style={[
                  styles.selectButtonText,
                  isSmallScreen && styles.smallSelectButtonText
                ]}>
                  Select IMS Portal
                </Text>
              </View>
            </TouchableOpacity>

            {/* GMS Portal Card */}
            <TouchableOpacity 
              style={[
                styles.portalCard,
                isSmallScreen && styles.smallPortalCard,
                isLandscape && styles.landscapePortalCard
              ]}
              onPress={() => onPortalSelect('gms')}
            >
              <View style={[
                styles.portalImageContainer, 
                styles.gmsImageContainer,
                isSmallScreen && styles.smallPortalImageContainer,
                isLandscape && styles.landscapePortalImageContainer
              ]}>
                <Image 
                  source={require("../assets/images/chieta_logo.png")} 
                  style={styles.portalImage}
                  resizeMode="cover"
                />
                <View style={styles.portalOverlay}>
                  <Text style={[
                    styles.portalOverlayText,
                    isSmallScreen && styles.smallPortalOverlayText
                  ]}>
                    GMS Portal
                  </Text>
                </View>
              </View>
              <View style={styles.portalInfo}>
                <Text style={[
                  styles.portalName,
                  isSmallScreen && styles.smallPortalName
                ]}>
                  Grant Manager System
                </Text>
                <Text style={[
                  styles.portalDescription,
                  isSmallScreen && styles.smallPortalDescription
                ]}>
                  Monitor contracts, track funding, and manage learner placements across programs
                </Text>
                <View style={styles.portalFeatures}>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Contract Management
                  </Text>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Funding Analytics
                  </Text>
                  <Text style={[
                    styles.featureItem,
                    isSmallScreen && styles.smallFeatureItem
                  ]}>
                    • Learner Placement Tracking
                  </Text>
                </View>
              </View>
              <View style={[styles.selectButton, styles.gmsButton]}>
                <Text style={[
                  styles.selectButtonText,
                  isSmallScreen && styles.smallSelectButtonText
                ]}>
                  Select GMS Portal
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[
              styles.closeButton,
              isSmallScreen && styles.smallCloseButton
            ]}
            onPress={onClose}
          >
            <Text style={[
              styles.closeButtonText,
              isSmallScreen && styles.smallCloseButtonText
            ]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
};

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("Home"); // Changed from "Welcome" to "Home"
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [screenHistory, setScreenHistory] = useState(["Home"]); // Changed from ["Welcome"] to ["Home"]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Handle Android back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentScreen === "Home") {
        BackHandler.exitApp();
        return true;
      } else if (isLoggedIn) {
        handleNavigateBack();
        return true;
      } else {
        handleNavigateBack();
        return true;
      }
    });

    return () => backHandler.remove();
  }, [currentScreen, isLoggedIn]);

  // Navigation handlers
  const handleNavigateToRegister = () => {
    setCurrentScreen("Register");
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen("Login");
  };

  const handleNavigateToHome = () => {
    setCurrentScreen("Home");
  };

  const handleNavigateBack = () => {
    if (isLoggedIn) {
      switch (userRole) {
        case "IM":
        case "Implementation Manager":
          setCurrentScreen("IMsScreen");
          break;
        case "Company":
        case "GM":
          setCurrentScreen("GMsScreen");
          break;
        case "Learner":
          setCurrentScreen("SSDDScreen");
          break;
        default:
          setCurrentScreen("Home");
      }
    } else {
      setCurrentScreen("Home");
    }
  };

  // Single login handler for all user types
  const handleLoginSuccess = (email, userData = {}) => {
    console.log("Login successful:", email, "Role:", userData.accounttype);
    setUserEmail(email);
    setIsLoggedIn(true);
    setUserData(userData);
    
    const accountType = userData.accounttype?.toLowerCase() || '';
    
    switch (accountType) {
      case "im":
      case "company":
      case "sdf_company":
        setUserRole("IM");
        setShowPortalModal(true);
        break;
      case "company":
      case "gm":
      case "sdf_company":
        setUserRole("GM");
        setShowPortalModal(true);
        break;
      case "learner":
      case "student":
        setUserRole("Learner");
        setCurrentScreen("SSDDScreen");
        break;
      default:
        console.warn("Unknown role:", userData.accounttype, "Defaulting to Home");
        setUserRole("");
        setCurrentScreen("Home");
    }
  };

  const handlePortalSelection = (portal) => {
    setShowPortalModal(false);
    if (portal === 'ims') {
      setCurrentScreen("IMsScreen");
      setUserRole("IM");
    } else if (portal === 'gms') {
      setCurrentScreen("GMsScreen");
      setUserRole("GM");
    }
  };

  const handleLogout = () => {
    console.log("Logging out user:", userEmail);
    
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = () => {
    setUserEmail("");
    setIsLoggedIn(false);
    setUserRole("");
    setUserData(null);
    setCurrentScreen("Home");
    setShowPortalModal(false);
    
    setTimeout(() => {
      Alert.alert("Logged Out", "You have been successfully logged out.");
    }, 500);
  };

  const openWebsite = (url) => {
    Linking.openURL(url).catch((err) => {
      console.error("Failed to open URL:", err);
      Alert.alert("Error", "Failed to open website. Please try again.");
    });
  };

  const navigateToScreen = (screenName) => {
    setScreenHistory(prev => [...prev, screenName]);
    setCurrentScreen(screenName);
  };

  const goBack = () => {
    if (screenHistory.length > 1) {
      const newHistory = [...screenHistory];
      newHistory.pop();
      const previousScreen = newHistory[newHistory.length - 1];
      setScreenHistory(newHistory);
      setCurrentScreen(previousScreen);
    } else {
      handleNavigateBack();
    }
  };

  // Portal Selection Modal
  const renderPortalModal = () => (
    <Modal
      visible={showPortalModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowPortalModal(false)}
    >
      <PortalModalContent 
        onPortalSelect={handlePortalSelection}
        onClose={() => setShowPortalModal(false)}
      />
    </Modal>
  );

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  const getUserRoleDisplayName = () => {
    switch (userRole) {
      case "IM":
        return "Implementation Manager";
      case "GM":
        return "Grant Manager";
      case "Learner":
        return "Student";
      default:
        return userRole;
    }
  };

  // Render appropriate screen based on currentScreen state
  const renderScreen = () => {
    const commonProps = {
      onNavigateBack: isLoggedIn ? goBack : goBack, // Always use goBack for navigation
    };

    switch (currentScreen) {
      case "Home":
        return (
          <HomeScreen
            {...commonProps}
            onNavigateToLogin={() => navigateToScreen("Login")}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            userRole={getUserRoleDisplayName()}
          />
        );
      
      case "Login":
        return (
          <LoginScreen
            {...commonProps}
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => navigateToScreen("Register")}
          />
        );
      
      case "Register":
        return (
          <RegisterScreen 
            {...commonProps}
            onNavigateToLogin={() => navigateToScreen("Login")}
          />
        );
      
      case "SSDDScreen":
        return (
          <SSDDScreen
            {...commonProps}
            email={userEmail}
            userData={userData}
            userRole={getUserRoleDisplayName()}
          />
        );
      
      case "GMsScreen":
        return (
          <GMsScreen
            {...commonProps}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            userData={userData}
            userRole={getUserRoleDisplayName()}
          />
        );
      
      case "IMsScreen":
        return (
          <IMsScreen
            {...commonProps}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            userRole={getUserRoleDisplayName()}
            userData={userData}
          />
        );
      
      case "Welcome":
        return (
          <WelcomeScreen
            {...commonProps}
            onNavigateToLogin={() => navigateToScreen("Login")}
            onNavigateToHome={() => navigateToScreen("Home")}
            openWebsite={openWebsite}
          />
        );
      
      default:
        return (
          <HomeScreen
            {...commonProps}
            onNavigateToLogin={() => navigateToScreen("Login")}
            userEmail={userEmail}
            isLoggedIn={isLoggedIn}
            userRole={getUserRoleDisplayName()}
          />
        );
    }
  };

  return (
    <PaperProvider>
      {renderScreen()}
      {renderPortalModal()}
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  // Portal Selection Modal Styles - Responsive
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  landscapeOverlay: {
    padding: 5,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    width: "100%",
    maxHeight: "95%",
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  smallModalContent: {
    padding: 12,
    borderRadius: 16,
    maxHeight: "98%",
  },
  largeModalContent: {
    padding: 24,
    maxWidth: 700,
  },
  landscapeModalContent: {
    maxHeight: "98%",
    padding: 16,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // Header Styles
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2C0A40",
    marginBottom: 8,
    textAlign: "center",
  },
  smallModalTitle: {
    fontSize: 20,
    marginBottom: 6,
  },
  largeModalTitle: {
    fontSize: 28,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  smallModalSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  
  // Portal Container
  portalContainer: {
    gap: 16,
    marginBottom: 20,
  },
  landscapePortalContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  
  // Portal Card
  portalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#F3F4F6",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    flex: 1,
  },
  smallPortalCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  landscapePortalCard: {
    flex: 1,
    minHeight: 500,
  },
  
  // Portal Image Container
  portalImageContainer: {
    height: 140,
    position: "relative",
    overflow: "hidden",
  },
  smallPortalImageContainer: {
    height: 100,
  },
  landscapePortalImageContainer: {
    height: 120,
  },
  imsImageContainer: {
    backgroundColor: "#E8F4FD",
  },
  gmsImageContainer: {
    backgroundColor: "#F0F7FF",
  },
  portalImage: {
    width: "100%",
    height: "100%",
  },
  portalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(44, 10, 64, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  portalOverlayText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    textAlign: 'center',
  },
  smallPortalOverlayText: {
    fontSize: 16,
  },
  
  // Portal Info
  portalInfo: {
    padding: 16,
    flex: 1,
  },
  portalName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C0A40",
    marginBottom: 6,
  },
  smallPortalName: {
    fontSize: 16,
    marginBottom: 4,
  },
  portalDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
    marginBottom: 10,
  },
  smallPortalDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  portalFeatures: {
    marginTop: 6,
  },
  featureItem: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
    marginBottom: 3,
  },
  smallFeatureItem: {
    fontSize: 11,
    lineHeight: 14,
    marginBottom: 2,
  },
  
  // Buttons
  selectButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imsButton: {
    backgroundColor: "#3B82F6",
  },
  gmsButton: {
    backgroundColor: "#10B981",
  },
  selectButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  smallSelectButtonText: {
    fontSize: 12,
  },
  closeButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#6B7280",
    marginTop: 8,
  },
  smallCloseButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  closeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  smallCloseButtonText: {
    fontSize: 12,
  },
});