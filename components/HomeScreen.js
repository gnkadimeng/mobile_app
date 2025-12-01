import React from "react";
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Text, 
  Dimensions 
} from "react-native";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const ServiceTile = ({ iconName, label, description, onPress, iconColor, isComingSoon = false }) => (
  <View style={styles.tileWrapper}>
    <TouchableOpacity 
      style={[
        styles.tileButton, 
        isComingSoon && styles.tileButtonDisabled
      ]} 
      onPress={onPress}
      disabled={isComingSoon}
    >
      <Ionicons 
        name={iconName} 
        size={28} 
        color={isComingSoon ? "#9CA3AF" : (iconColor || "#3d0f57")} 
      />
      <Text style={[
        styles.tileLabel,
        isComingSoon && styles.tileLabelDisabled
      ]}>
        {label}
      </Text>
      {isComingSoon && (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
    </TouchableOpacity>
    <Text style={[
      styles.tileDescription,
      isComingSoon && styles.tileDescriptionDisabled
    ]}>
      {description}
    </Text>
  </View>
);

const HomeScreen = ({ 
  onNavigateBack, 
  onNavigateToLogin, 
  userEmail, 
  isLoggedIn, 
  userRole 
}) => {
  
  const handleSystemNavigation = (system) => {
    if (isLoggedIn) {
      // User is already logged in, navigate based on their role and selected system
      switch (system) {
        case 'SSDD':
          // Navigate to SSDD screen if user is a student
          if (userRole === 'Learner') {
            // This would navigate to SSDD screen
            console.log("Navigating to SSDD screen");
          } else {
            Alert.alert("Access Denied", "SSDD system is for students only.");
          }
          break;
        case 'GMS':
          // Navigate to GMS screen if user is a company
          if (userRole === 'GM' || userRole === 'Company') {
            // This would navigate to GMS screen
            console.log("Navigating to GMS screen");
          } else {
            Alert.alert("Access Denied", "GMS system is for companies only.");
          }
          break;
        case 'IMS':
          // Navigate to IMS screen if user is an IM
          if (userRole === 'IM') {
            // This would navigate to IMS screen
            console.log("Navigating to IMS screen");
          } else {
            Alert.alert("Access Denied", "IMS system is for implementation managers only.");
          }
          break;
        default:
          onNavigateToLogin();
      }
    } else {
      // User not logged in, go to login screen
      onNavigateToLogin();
    }
  };

  const getUserGreeting = () => {
    if (isLoggedIn && userEmail) {
      const displayName = userEmail.split('@')[0];
      const roleDisplay = userRole === 'GM' ? 'Company' : 
                         userRole === 'Learner' ? 'Student' : 
                         userRole === 'IM' ? 'Implementation Manager' : 
                         userRole;
      
      return `Welcome back, ${displayName}! (${roleDisplay})`;
    }
    return "Welcome to CHIETA Systems";
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <LinearGradient 
        colors={["#430c5a", "#66138a", "#430c5a"]} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButtonWrapper} onPress={onNavigateBack}>
            <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          {/* User Info */}
          {isLoggedIn && (
            <View style={styles.userInfo}>
              <Ionicons name="person-circle-outline" size={16} color="#FFFFFF" />
              <Text style={styles.userText}>
                {userEmail.split('@')[0]}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image 
          source={require("../assets/images/chieta_logo.png")} 
          style={styles.logo} 
        />
      </View>

      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeText}>
          {getUserGreeting()}
        </Text>
        {!isLoggedIn && (
          <Text style={styles.welcomeSubtext}>
            Sign in to access your systems
          </Text>
        )}
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <Image
          source={require("../assets/images/bg_image.png")}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Main Systems Grid */}
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.systemsSection}>
          <Text style={styles.sectionTitle}>Available Systems</Text>
          <Text style={styles.sectionSubtitle}>
            {isLoggedIn 
              ? "Access your authorized systems below" 
              : "Sign in to access these systems"
            }
          </Text>
          
          <View style={styles.tileGrid}>
            <ServiceTile
              iconName="analytics-outline"
              label="SSDD"
              description="Skills Supply Demand Database"
              onPress={() => handleSystemNavigation('SSDD')}
              iconColor="#3d0f57"
            />
            <ServiceTile
              iconName="wallet-outline"
              label="GMS"
              description="Grants Management System"
              onPress={() => handleSystemNavigation('GMS')}
              iconColor="#3d0f57"
            />
            <ServiceTile
              iconName="document-text-outline"
              label="IMS"
              description="Information Management System"
              onPress={() => handleSystemNavigation('IMS')}
              iconColor="#3d0f57"
            />
            <ServiceTile
              iconName="school-outline"
              label="ETQA"
              description="Education & Training Quality Assurance"
              onPress={() => {}}
              iconColor="#2c9d97"
              isComingSoon={true}
            />
          </View>
        </View>

        {/* Quick Actions */}
        {isLoggedIn && (
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="notifications-outline" size={20} color="#3A0A53" />
                <Text style={styles.actionButtonText}>Notifications</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="settings-outline" size={20} color="#3A0A53" />
                <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="help-circle-outline" size={20} color="#3A0A53" />
                <Text style={styles.actionButtonText}>Help</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* System Access Info */}
        {!isLoggedIn && (
          <View style={styles.accessInfo}>
            <Text style={styles.accessTitle}>System Access Information</Text>
            <View style={styles.accessItem}>
              <Ionicons name="school-outline" size={16} color="#3A0A53" />
              <Text style={styles.accessText}>SSDD - For Students and Learners</Text>
            </View>
            <View style={styles.accessItem}>
              <Ionicons name="business-outline" size={16} color="#3A0A53" />
              <Text style={styles.accessText}>GMS - For Companies and Grant Managers</Text>
            </View>
            <View style={styles.accessItem}>
              <Ionicons name="person-outline" size={16} color="#3A0A53" />
              <Text style={styles.accessText}>IMS - For Implementation Managers</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Button 
          mode="text" 
          style={styles.bottomNavButton} 
          labelStyle={styles.bottomNavText}
          icon="home"
        >
          <Text style={styles.bottomNavLabel}>Home</Text>
        </Button>
        <Button 
          mode="text" 
          style={styles.bottomNavButton} 
          labelStyle={styles.bottomNavText}
          icon="view-grid"
          onPress={onNavigateToLogin}
        >
          <Text style={styles.bottomNavLabel}>Systems</Text>
        </Button>
        {isLoggedIn ? (
          <Button 
            mode="text" 
            style={styles.bottomNavButton} 
            labelStyle={styles.bottomNavText}
            icon="account"
          >
            <Text style={styles.bottomNavLabel}>Profile</Text>
          </Button>
        ) : (
          <Button 
            mode="text" 
            style={styles.bottomNavButton} 
            labelStyle={styles.bottomNavText}
            icon="login"
            onPress={onNavigateToLogin}
          >
            <Text style={styles.bottomNavLabel}>Login</Text>
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  userText: {
    marginLeft: 4,
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: "contain",
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C0A40',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  systemsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tileWrapper: {
    alignItems: 'center',
    marginBottom: 24,
    width: (width - 64) / 2,
  },
  tileButton: {
    width: (width - 64) / 4,
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    borderColor: '#c78c2e',
    borderWidth: 1,
    position: 'relative',
  },
  tileButtonDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#D1D5DB',
    opacity: 0.7,
  },
  tileLabel: {
    fontSize: 12,
    color: '#000',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  tileLabelDisabled: {
    color: '#9CA3AF',
  },
  tileDescription: {
    fontSize: 11,
    color: '#3A0A53',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 14,
  },
  tileDescriptionDisabled: {
    color: '#9CA3AF',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF8F00',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  quickActions: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#3A0A53',
    fontWeight: '500',
  },
  accessInfo: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  accessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginBottom: 12,
    textAlign: 'center',
  },
  accessItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  accessText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  bottomNavButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 5,
  },
  bottomNavText: {
    fontSize: 10,
    color: "#3A0A53",
  },
  bottomNavLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});

export default HomeScreen;