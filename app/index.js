import React, { useState, useEffect } from "react";
import { Provider as PaperProvider } from 'react-native-paper';
import { Linking } from "react-native";
import SplashScreen from "../components/SplashScreen";
import RegisterScreen from "../components/RegisterScreen";
import HomeScreen from "../components/HomeScreen";
import WelcomeScreen from "../components/WelcomeScreen";
import SSDDScreen from "../components/SSDDScreen";
import GMsScreen from "../components/GMsScreen";
import GmsLoginScreen from "../components/GmsLoginScreen";
import IMsLoginScreen from "../components/IMsLoginScreen"; 
import IMsScreen from "../components/IMsScreen";
import SSDDLoginScreen from "../components/SSDDLoginScreen";

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("Welcome");
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(""); // Added to track user role

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleNavigateToRegister = () => {
    setCurrentScreen("Register");
  };

  const handleNavigateToLogin = () => {
    setCurrentScreen("SSDDLogin");
  };

  const handleNavigateFromWelcome = () => {
    setCurrentScreen("SSDDLogin");
  };

  const handleNavigateToHome = () => {
    setCurrentScreen("Home");
  };

  const handleNavigateBack = () => {
    setCurrentScreen("Welcome");
  };

  const handleLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen("SSDDScreen");
  };

  const handleGMLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen("GMsScreen");
  };

  const handleIMLoginSuccess = (email, role) => {
    setUserEmail(email);
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentScreen("IMsScreen");
  };

  const handleNavigateToGMS = () => {
    setCurrentScreen("GmsLogin");
  };

  const handleNavigateToIMS = () => {
    setCurrentScreen("IMsLogin");
  };

  const handleSSDDLoginSuccess = (email) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen("SSDDScreen");
  };

  const openWebsite = (url) => {
    Linking.openURL(url).catch((err) => console.error("Failed to open URL:", err));
  };

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider>
      {currentScreen === "Welcome" ? (
        <WelcomeScreen
          onNavigateToLogin={handleNavigateFromWelcome}
          onNavigateToHome={handleNavigateToHome}
          openWebsite={openWebsite}
        />
      ) : currentScreen === "SSDDLogin" ? (
        <SSDDLoginScreen
          onLoginSuccess={handleSSDDLoginSuccess}
          onNavigateBack={handleNavigateBack}
          onNavigateToGMS={handleNavigateToGMS}
          onNavigateToIMS={handleNavigateToIMS}
        />
      ) : currentScreen === "Register" ? (
        <RegisterScreen onNavigateToLogin={handleNavigateToLogin} />
      ) : currentScreen === "SSDDScreen" ? (
        <SSDDScreen
          onNavigateBack={handleNavigateBack}
          email={userEmail}
        />
      ) : currentScreen === "GMsScreen" ? (
        <GMsScreen
          onNavigateBack={handleNavigateBack}
          onNavigateToLogin={handleNavigateToLogin}
          isLoggedIn={isLoggedIn}
        />
      ) : currentScreen === "GmsLogin" ? (
        <GmsLoginScreen
          onLoginSuccess={handleGMLoginSuccess}
          onNavigateBack={handleNavigateBack}
        />
      ) : currentScreen === "IMsLogin" ? (
        <IMsLoginScreen
          onLoginSuccess={handleIMLoginSuccess}
          onNavigateBack={handleNavigateBack}
        />
      ) : currentScreen === "IMsScreen" ? (
        <IMsScreen
          onNavigateBack={handleNavigateBack}
          email={userEmail}
          isLoggedIn={isLoggedIn}
          role={userRole}
        />
      ) : currentScreen === "Home" ? (
        <HomeScreen
          onNavigateBack={handleNavigateBack}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToGMS={handleNavigateToGMS}
          onNavigateToIMS={handleNavigateToIMS}
        />
      ) : null}
    </PaperProvider>
  );
}