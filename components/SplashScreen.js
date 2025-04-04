import React from 'react';
import { View, Text, StyleSheet, Image, ImageBackground, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function App() {
  return (
    <ImageBackground
      source={require('../assets/images/home2.png')}  // Path to the background image
      style={styles.background}
      imageStyle={styles.backgroundImage}  // Custom styling for the background image
    >
      {/* Navbar Section */}
      <View style={styles.navbar}>
        <Text style={styles.navbarText}></Text>
      
      </View>

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/chieta_logo.png')} style={styles.logo} />
      </View>

      {/* Loader Section */}
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#CE8946" />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Copyright © 2025, CHIETA. All rights reserved.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'space-between',  
  },
  backgroundImage: {
    resizeMode: 'contain',  
    position: 'absolute',   
    bottom: 0,              
    left: 0,                
    width: '30%',           
    height: '30%',         
  },
  
  navbar: {
    backgroundColor: '#3A0A53',   
    height: 60,                   
    flexDirection: 'row',          
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,         
    paddingTop: 10,                
  },
  navbarText: {
    color: 'white',
    fontSize: 18,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,  // Adjust this value if you need more space at the top
  },
  logo: {
    width: 200,       // Adjust the width for the logo
    height: 80,       // Adjust the height for the logo
    resizeMode: 'contain',  // Maintain aspect ratio for the logo
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    backgroundColor: '#3A0A53',  
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 14,
  },
});
