import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const RegisterScreen = ({ onNavigateToLogin }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [careersOpen, setCareersOpen] = useState(false);
  const [procurementOpen, setProcurementOpen] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all the fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      // Store the registered details in AsyncStorage
      await AsyncStorage.setItem('userDetails', JSON.stringify({ username, password }));
      Alert.alert('Success', `Welcome, ${username}! Your account has been registered.`);
      
      // Clear input fields
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to save user details');
    }
  };

  return (
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setCareersOpen(!careersOpen)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Careers ▼</Text>
          </TouchableOpacity>
          {careersOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem}><Text>Careers in Chemical Industry</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Vacancies</Text></TouchableOpacity>
            </View>
          )}
          <TouchableOpacity onPress={() => setProcurementOpen(!procurementOpen)} style={styles.dropdownButton}>
            <Text style={styles.dropdownButtonText}>Procurement ▼</Text>
          </TouchableOpacity>
          {procurementOpen && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity style={styles.dropdownItem}><Text>Active Tender</Text></TouchableOpacity>
              <TouchableOpacity style={styles.dropdownItem}><Text>Closed Tender</Text></TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      <Image source={require('../assets/images/chieta_logo.png')} style={styles.logo} />
      <Text style={styles.welcomeText}>Welcome to CHIETA</Text>
      
      <View style={styles.inputContainer}>
        <Icon name="user" size={24} color="#512b58" style={styles.icon} />
        <TextInput
          placeholder="Enter username"
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="envelope" size={24} color="#512b58" style={styles.icon} />
        <TextInput
          placeholder="Enter email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#512b58" style={styles.icon} />
        <TextInput
          placeholder="Enter password"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Icon name="lock" size={24} color="#512b58" style={styles.icon} />
        <TextInput
          placeholder="Confirm password"
          secureTextEntry
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>
        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.linkContainer}>
          <Text>
            Already have an account?{' '}
            <Text style={styles.linkText} onPress={onNavigateToLogin}>
              Log in
            </Text>
          </Text>
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024, CHIETA. All rights reserved.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 200, 
   
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3A0A53',
    padding: 15,
    width: '100%',
  },
  headerRight: {
    flex: 1,             
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    alignItems: 'center',
  },
  dropdownButton: {
    paddingHorizontal: 10,
  },
  dropdownButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    position: 'absolute',
    top: 40,
    right: 0,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownText: {
    color: '#512b58',
    fontSize: 16,
  },
  logo: {
    width: 250,
    height: 110,
    marginBottom: 40, 
    marginTop: 40, 
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#512b58',
    marginBottom: 40, // Add more space between welcomeText and the form
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    width: '80%',
    marginBottom: 15,
    paddingLeft: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  signUpButton: {
    backgroundColor: '#b78a28', 
    borderRadius: 25,
    width: '80%',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },  
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: '#b78a28',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#3A0A53',
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
  },

});
export default RegisterScreen;