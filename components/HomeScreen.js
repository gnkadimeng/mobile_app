import React from "react";
import { View, StyleSheet, ScrollView, Image, Text, Dimensions } from "react-native";
import { Card, Button, IconButton } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native'

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 40) / 2; // Slightly reduced padding
const CARD_HEIGHT = width < 400 ? 180 : 120; // Make cards rectangular but smaller

const HomeScreen = ({ navigation, onNavigateBack, onNavigateToLogin, onNavigateToGMS }) => {
  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header - Made more compact */}
      <LinearGradient colors={["#430c5a", "#66138a", "#430c5a"]} style={styles.header}>
      {/* <LinearGradient colors={["#3A0A53", "#512b58"]} style={styles.header}> */}
        <View style={styles.backButtonContainer}>
          <IconButton
            icon="arrow-left"
            color="white"
            size={20} // Smaller icon
            onPress={onNavigateBack}
          />
          <View style={{ flex: 1 }} />
        </View>
        <Text style={styles.headerTitle}>CHIETA Systems</Text>
        <Text style={styles.headerSubtitle}>Specialized systems</Text>
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
        {/* Row 1 */}
        <View style={styles.row}>
          {/* SSDD Container */}
          <Card style={[styles.serviceCard, { marginRight: 10 }]}>
            {/* <LinearGradient colors={["#3A0A53", "#512b58"]} style={styles.gradient}> */}
            <LinearGradient colors={["#3A0A53", "#552c6b", "#806190", "#fff"]} style={styles.gradient}>
              <Ionicons name="analytics-outline" size={30} color="#fff" style={styles.icon} />
              <Text style={styles.serviceTitle}>SSDD</Text>
              <Text style={styles.systemDescription}>
                Skills Database
              </Text>
              <Button
                mode="contained"
                style={styles.systemButton}
                onPress={onNavigateToLogin}
                labelStyle={{ color: 'white', fontSize: 10 }}
                contentStyle={{ height: 50 }}
              >
                Explore
              </Button>
            </LinearGradient>
          </Card>

          {/* GMS Container */}
          <Card style={styles.serviceCard}>
            {/* <LinearGradient colors={["#CE8946", "#feb47b"]} style={styles.gradient}> */}
            {/* <LinearGradient colors={["#c73761", "#d46686", "#fff"]} style={styles.gradient}> */}
            <LinearGradient colors={["#3A0A53", "#552c6b","#806190", "#fff"]} style={styles.gradient}>
              <Ionicons name="wallet-outline" size={30} color="#fff" style={styles.icon} />
              <Text style={styles.serviceTitle}>GMS</Text>
              <Text style={styles.systemDescription}>
                Grants System
              </Text>
              <Button
                mode="contained"
                style={styles.systemButton}
                onPress={onNavigateToGMS}
                labelStyle={{ color: 'white', fontSize: 10 }}
                contentStyle={{ height: 50 }}
              >
                Explore
              </Button>
            </LinearGradient>
          </Card>
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          {/* IMS Container */}
          <Card style={[styles.serviceCard, { marginRight: 10 }]}>
            {/* <LinearGradient colors={["#3A0A53", "#6a11cb"]} style={styles.gradient}> */}
            {/* <LinearGradient colors={["#2c9c94", "#5fb4ae", "#fff"]} style={styles.gradient}> */}
            <LinearGradient colors={["#3A0A53", "#552c6b", "#806190", "#fff"]} style={styles.gradient}>
              <Ionicons name="document-text-outline" size={30} color="#fff" style={styles.icon} />
              <Text style={styles.serviceTitle}>IMS</Text>
              <Text style={styles.systemDescription}>
                Information System
              </Text>
              <Button
                mode="contained"
                style={styles.systemButton}
                onPress={onNavigateToLogin}
                labelStyle={{ color: 'white', fontSize: 10 }}
                contentStyle={{ height: 50 }}
              >
                Explore
              </Button>
            </LinearGradient>
          </Card>

          {/* Empty Card */}
          <Card style={styles.serviceCard}>
            {/* <LinearGradient colors={["#3A0A53", "#512b58"]} style={styles.gradient}> */}
            {/* <LinearGradient colors={["#bf591b", "#d0875a", "#fff"]} style={styles.gradient}> */}
            <LinearGradient colors={["#2c9c94", "#48a9a2", "#5db2ac", "#fff"]} style={styles.gradient}>
              <Ionicons name="add-outline" size={30} color="#fff" style={styles.icon} />
              <Text style={styles.serviceTitle}>More(EQTA)</Text>
              <Text style={styles.systemDescription}>
                Coming soon
              </Text>
              <Button
                mode="contained"
                style={styles.systemButton}
                onPress={() => { }}
                labelStyle={{ color: 'white', fontSize: 10 }}
                contentStyle={{ height: 50 }}
              >
                Soon
              </Button>
            </LinearGradient>
          </Card>
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
});

export default HomeScreen;