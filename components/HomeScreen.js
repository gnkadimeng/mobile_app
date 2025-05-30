import React from "react";
import { View, StyleSheet, TouchableOpacity, ScrollView, Image, Text, Dimensions } from "react-native";
import { Card, Button, IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native'

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Slightly reduced padding
const CARD_HEIGHT = width < 400 ? 180 : 120; // Make cards rectangular but smaller

const ServiceTile = ({ iconName, label, description, onPress, iconColor }) => (
  <View style={styles.tileWrapper}>
    <TouchableOpacity style={styles.tileButton} onPress={onPress}>
      <Ionicons name={iconName} size={28} color={iconColor || "#00B9F1"} />
      <Text style={styles.tileLabel}>{label}</Text>
    </TouchableOpacity>
    <Text style={styles.tileDescription}>{description}</Text>
  </View>
);

const HomeScreen = ({ navigation, onNavigateBack, onNavigateToLogin, onNavigateToGMS }) => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header - Made more compact */}
      <LinearGradient colors={["#430c5a", "#66138a", "#430c5a"]} style={styles.header}>
        {/* <LinearGradient colors={["#3A0A53", "#512b58"]} style={styles.header}> */}
        {/* <View style={styles.backButtonContainer}>
          <IconButton
            icon="arrow-left"
            color="white"
            size={20} // Smaller icon
            onPress={onNavigateBack}
          />
          <View style={{ flex: 1 }} />
        </View> */}
        <TouchableOpacity style={styles.backButtonWrapper} onPress={onNavigateBack}>
          <Ionicons name="arrow-back-outline" size={20} color="#3A0A53" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Logo - Made smaller */}
      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
      </View>

      <View style={styles.bannerContainer}>
        <Image
          source={require("../assets/images/bg_image.png")}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* Main Systems in Grid - More compact */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.tileGrid}>
  <ServiceTile
    iconName="analytics-outline"
    label="SSDD"
    description="Skills Supply Demand Database "
    onPress={onNavigateToLogin}
    iconColor="#3d0f57"
  />
  <ServiceTile
    iconName="wallet-outline"
    label="GMS"
    description="Grants Management System"
    onPress={onNavigateToGMS}
    iconColor="#3d0f57"
  />
  <ServiceTile
    iconName="document-text-outline"
    label="IMS"
    description="Information Management System"
    onPress={onNavigateToLogin}
    iconColor="#3d0f57"
  />
  <ServiceTile
    iconName="add-outline"
    label="ETQA"
    description="Coming soon"
    onPress={() => {}}
     iconColor="#2c9d97"
  />
</View>
      </ScrollView>

      {/* Bottom Navigation - More compact */}
      <View style={styles.bottomNav}>
        <Button mode="text" style={styles.bottomNavButton} labelStyle={styles.bottomNavText}>
          <Ionicons name="home-outline" size={18} color="#3A0A53" />
          <Text style={styles.bottomNavLabel}>Home</Text>
        </Button>
        <Button mode="text" style={styles.bottomNavButton} labelStyle={styles.bottomNavText}>
          <Ionicons name="business-outline" size={18} color="#3A0A53" />
          <Text style={styles.bottomNavLabel}>Systems</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    // padding: 15,
    // paddingTop: 30,
    // paddingBottom: 15,
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "left",
    marginVertical: 5,
  },
  logo: {
    width: 150,
    height: 60,
    resizeMode: "contain",
  },
  scrollContainer: {
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  serviceCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  gradient: {
    // flex: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    marginBottom: 3,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 3,
  },
  systemDescription: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  systemButton: {
    backgroundColor: "#d08c1c",
    borderRadius: 10,
    paddingHorizontal: 8,
    height: 25,
    minWidth: 70,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    // marginTop: 0,
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
  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingBottom: 0,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgb(255, 255, 255)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  bannerContainer: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 5,
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
    height: 220,
    borderRadius: 10,
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
    marginLeft: 10,
    alignSelf: 'flex-start',
    marginBottom: 0,
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
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
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
    // borderColor: '#3A0A53',
    borderColor: '#c78c2e',
    borderWidth: 1,
  },

  tileLabel: {
    fontSize: 12,
    color: '#000',
    marginTop: 6,
    textAlign: 'center',
  },
  tileWrapper: {
    // width: (width - 64) / 2, 
    alignItems: 'center',
    marginBottom: 24,
  },
  
  tileDescription: {
    fontSize: 11,
    color: '#3A0A53',
    marginTop: 6,
    textAlign: 'center',
  },
});

export default HomeScreen;