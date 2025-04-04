import React, { useState, useEffect } from "react";
import { Provider as PaperProvider } from 'react-native-paper';
import { Linking } from "react-native";
import SplashScreen from "../components/SplashScreen";
import LoginScreen from "../components/LoginScreen";
import RegisterScreen from "../components/RegisterScreen";
import HomeScreen from "../components/HomeScreen";
import WelcomeScreen from "../components/WelcomeScreen";
import SSDDScreen from "../components/SSDDScreen";
import GMsScreen from "../components/GMsScreen";
import GmsLoginScreen from "../components/GmsLoginScreen"; 

export default function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [currentScreen, setCurrentScreen] = useState("Welcome");
  const [userEmail, setUserEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    setCurrentScreen("Login");
  };

  const handleNavigateFromWelcome = () => {
    setCurrentScreen("Login");
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
    setCurrentScreen("GMsScreen"); // Redirect to GMsScreen after successful GM login
  };

  const handleNavigateToGMS = () => {
    setCurrentScreen("GmsLogin"); // Change this to navigate to GmsLoginScreen first
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
      ) : currentScreen === "Login" ? (
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onNavigateBack={handleNavigateBack}
          onNavigateToGMS={handleNavigateToGMS}
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
      ) : currentScreen === "Home" ? (
        <HomeScreen
          onNavigateBack={handleNavigateBack}
          onNavigateToLogin={handleNavigateToLogin}
          onNavigateToGMS={handleNavigateToGMS}
        />
      ) : null}
    </PaperProvider>
  );
}