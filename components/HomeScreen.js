import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Text,
  Dimensions,
  Modal,
  Alert,
  TextInput,
  FlatList,
  StatusBar,
  ImageBackground
} from "react-native";
import { Button } from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

const ServiceTile = ({ iconName, label, description, onPress, iconColor, isComingSoon = false, index }) => (
  <Animatable.View
    animation="fadeInUp"
    duration={800}
    delay={index * 100}
    style={styles.tileWrapper}
  >
    <TouchableOpacity
      style={[
        styles.tileButton,
        isComingSoon && styles.tileButtonDisabled
      ]}
      onPress={onPress}
      disabled={isComingSoon}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.05)']}
        style={styles.tileIconContainer}
      >
        <Ionicons
          name={iconName}
          size={36}
          color={isComingSoon ? "#9CA3AF" : iconColor}
        />
      </LinearGradient>
      <Text style={[
        styles.tileLabel,
        isComingSoon && styles.tileLabelDisabled
      ]}>
        {label}
      </Text>
      {isComingSoon && (
        <LinearGradient
          colors={['#FF6B6B', '#FF8F00']}
          style={styles.comingSoonBadge}
        >
          <Text style={styles.comingSoonText}>Soon</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
    <Text style={[
      styles.tileDescription,
      isComingSoon && styles.tileDescriptionDisabled
    ]}>
      {description}
    </Text>
  </Animatable.View>
);

const HomeScreen = ({
  onNavigateBack,
  onNavigateToLogin,
  userEmail,
  isLoggedIn,
  userRole
}) => {
  const [chatbotModalVisible, setChatbotModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectModalVisible, setRedirectModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');
  // NEW 
  const [ecosystemVisible, setEcosystemVisible] = useState(true);
  const [updatesVisible, setUpdatesVisible] = useState(true);


  const showRedirectConfirmation = (url) => {
    setPendingUrl(url);
    setRedirectModalVisible(true);
  };

  const confirmRedirect = () => {
    setRedirectModalVisible(false);
    if (pendingUrl) {
      Linking.canOpenURL(pendingUrl)
        .then((supported) => {
          if (supported) {
            Linking.openURL(pendingUrl);
          } else {
            Alert.alert('Error', 'Unable to open the link.');
          }
        })
        .catch((err) => console.error('An error occurred', err));
    }
    setPendingUrl('');
  };

  const cancelRedirect = () => {
    setRedirectModalVisible(false);
    setPendingUrl('');
  };

  const handleSystemNavigation = (system) => {
    if (isLoggedIn) {
      switch (system) {
        case 'SSDD':
          if (userRole === 'Learner' || userRole === 'Student') {
            console.log("Navigating to SSDD screen");
          } else {
            Alert.alert("Access Denied", "SSDD system is for students only.");
          }
          break;
        case 'GMS':
          if (userRole === 'GM' || userRole === 'Company') {
            console.log("Navigating to GMS screen");
          } else {
            Alert.alert("Access Denied", "GMS system is for companies only.");
          }
          break;
        case 'IMS':
          if (userRole === 'IM') {
            console.log("Navigating to IMS screen");
          } else {
            Alert.alert("Access Denied", "IMS system is for implementation managers only.");
          }
          break;
        default:
          onNavigateToLogin();
      }
    } else {
      onNavigateToLogin();
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    setMessages((prevMessages) => [...prevMessages, { sender: 'user', text: userInput }]);

    try {
      const response = await axios.post('http://192.168.64.149:5000/get_response', { message: userInput });
      const botResponse = response.data.response;
      setMessages((prevMessages) => [...prevMessages, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the chatbot. Please try again.');
    }

    setUserInput('');
  };

  const programButtons = [
    { title: "Bursaries", type: "bursaries", icon: "school-outline", color: "#FF6B6B" },
    { title: "Learnerships", type: "learnership grants", icon: "book-outline", color: "#4ECDC4" },
    { title: "Work-Based", type: "work-based learning programs", icon: "briefcase-outline", color: "#FFD166" },
    { title: "Apprenticeships", type: "apprenticeship grants", icon: "build-outline", color: "#06D6A0" }
  ];

  const fetchPrograms = async (programType) => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:5000/get_available_programs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ program_type: programType }),
      });
      const data = await res.json();
      setResponse(data.message || 'No response received.');
    } catch (error) {
      console.error(error);
      setResponse('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserGreeting = () => {
    if (isLoggedIn && userEmail) {
      const displayName = userEmail.split('@')[0];
      const roleDisplay = userRole === 'GM' ? 'Company' :
        userRole === 'Learner' ? 'Student' :
          userRole === 'IM' ? 'Implementation Manager' :
            userRole;

      return `Welcome back, ${displayName}!`;
    }
    return "Unlock Your Potential with CHIETA";
  };

  const systems = [
    {
      icon: "analytics-outline",
      label: "SSDD",
      description: "Skills Supply Demand Database",
      color: "#FF6B6B",
      action: () => handleSystemNavigation('SSDD')
    },
    {
      icon: "wallet-outline",
      label: "GMS",
      description: "Grants Management System",
      color: "#4ECDC4",
      action: () => handleSystemNavigation('GMS')
    },
    {
      icon: "document-text-outline",
      label: "IMS",
      description: "Information Management System",
      color: "#FFD166",
      action: () => handleSystemNavigation('IMS')
    },
    {
      icon: "school-outline",
      label: "ETQA",
      description: "Quality Assurance System",
      color: "#06D6A0",
      isComingSoon: true,
      action: () => { }
    }
  ];

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#3c0d5dff" />

      {/* Main ScrollView - Everything inside is scrollable */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header with Gradient */}
        <LinearGradient
          colors={["#562a75ff", "#46235fff", "#3f1b58ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <Image
              source={require("../assets/images/chieta_logo.png")}
              style={styles.headerLogo}
            />

            {/* User Info */}
            {isLoggedIn && (
              <TouchableOpacity style={styles.userInfo} onPress={onNavigateToLogin}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  style={styles.userAvatar}
                >
                  <Ionicons name="person" size={16} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.userText} numberOfLines={1}>
                  {userEmail.split('@')[0]}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </LinearGradient>

        {/* Hero Section */}
        <Animatable.View animation="fadeInDown" duration={800} style={styles.heroContainer}>
          <LinearGradient
            colors={['rgba(26,26,46,0.1)', 'rgba(15,52,96,0.05)']}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>
              {getUserGreeting()}
            </Text>
            <Text style={styles.heroSubtitle}>
              Transforming Skills Development in the Chemical Industry
            </Text>

            {!isLoggedIn && (
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={onNavigateToLogin}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.ctaText}>Get Started</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </LinearGradient>
        </Animatable.View>

        {/* Featured Banner */}
        <Animatable.View animation="fadeInUp" delay={300} duration={800} style={styles.featuredContainer}>
          <TouchableOpacity
            style={styles.featuredTouchable}
            onPress={() => showRedirectConfirmation('https://chieta.org.za')}
            activeOpacity={0.9}
          >
            <ImageBackground
              source={require("../assets/images/chieta_logo.png")}
              style={styles.featuredImage}
              imageStyle={styles.featuredImageStyle}
            >
              <LinearGradient
                colors={['rgba(26,26,46,0.85)', 'rgba(15,52,96,0.7)']}
                style={styles.featuredOverlay}
              >
                <View style={styles.featuredContent}>
                  <Ionicons name="globe-outline" size={32} color="#FFD166" />
                  <Text style={styles.featuredTitle}>Explore CHIETA World</Text>
                  <Text style={styles.featuredDescription}>
                    Discover opportunities, programs, and resources on our official platform
                  </Text>
                  <View style={styles.featuredButton}>
                    <Text style={styles.featuredButtonText}>Visit Website</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </Animatable.View>

        {/* New */}
        {/* Systems section with toggle */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.systemsSection}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => setEcosystemVisible(!ecosystemVisible)}
            activeOpacity={0.8}
          >
            <Animatable.View
              animation={ecosystemVisible ? "pulse" : undefined}
              iterationCount="infinite"
              duration={2000}
              style={styles.glowingIconContainer}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8F00']}
                style={styles.sectionIcon}
              >
                <Ionicons name="apps" size={24} color="#FFFFFF" />
              </LinearGradient>
              {/* glow effect part*/}
              {ecosystemVisible && (
                <LinearGradient
                  colors={['rgba(255,107,107,0.3)', 'rgba(255,143,0,0.3)', 'transparent']}
                  style={styles.glowRing}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
            </Animatable.View>



            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Our Digital Ecosystem</Text>
              <Text style={styles.sectionSubtitle}>
                {isLoggedIn ? "Your gateway to specialized systems" : "Login to access specialized platforms"}
              </Text>
              <View style={styles.toggleIndicator}>
                <Ionicons
                  name={ecosystemVisible ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#FF8F00"
                />
                <Text style={styles.toggleText}>
                  {ecosystemVisible ? "Tap to collapse" : "Tap to expand"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Conditional render of the systems grid */}
          {ecosystemVisible && (
            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={styles.tileGrid}
            >
              {systems.map((system, index) => (
                <ServiceTile
                  key={system.label}
                  iconName={system.icon}
                  label={system.label}
                  description={system.description}
                  onPress={system.action}
                  iconColor={system.color}
                  isComingSoon={system.isComingSoon}
                  index={index}
                />
              ))}
            </Animatable.View>
          )}
        </Animatable.View>
        


        {/* Latest updates with toggle */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.updatesSection}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => setUpdatesVisible(!updatesVisible)}
            activeOpacity={0.8}
          >
            <Animatable.View
              animation={updatesVisible ? "pulse" : undefined}
              iterationCount="infinite"
              duration={2000}
              style={styles.glowingIconContainer}
            >
              <LinearGradient
                colors={['#4ECDC4', '#06D6A0']}
                style={styles.sectionIcon}
              >
                <Ionicons name="megaphone" size={24} color="#FFFFFF" />
              </LinearGradient>
              {/* Glow effect*/}
              {updatesVisible && (
                <LinearGradient
                  colors={['rgba(78, 205, 196, 0.3)', 'rgba(6, 214, 160, 0.3)', 'transparent']}
                  style={styles.glowRing}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              )}
            </Animatable.View>

            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Latest Updates</Text>
              <Text style={styles.sectionSubtitle}>Stay informed with recent developments</Text>
              <View style={styles.toggleIndicator}>
                <Ionicons
                  name={updatesVisible ? "chevron-up" : "chevron-down"}
                  size={16}
                  color="#06D6A0"
                />
                <Text style={[styles.toggleText, { color: '#06D6A0' }]}>
                  {updatesVisible ? "Tap to collapse" : "Tap to expand"}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Conditional render of the updates */}
          {updatesVisible && (
            <Animatable.View
              animation="fadeIn"
              duration={500}
              style={styles.updatesContainer}
            >
              <TouchableOpacity
                style={styles.updateCard}
                onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=Discretionary+Grants')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  style={styles.updateIconContainer}
                >
                  <Ionicons name="gift" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>2025 Grants Launch</Text>
                  <Text style={styles.updateDescription}>Discretionary grants for strategic projects now open</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.updateCard}
                onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=ssp')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#4ECDC4', '#06D6A0']}
                  style={styles.updateIconContainer}
                >
                  <Ionicons name="document-text" size={20} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.updateContent}>
                  <Text style={styles.updateTitle}>Sector Skills Plan</Text>
                  <Text style={styles.updateDescription}>Updated industry guidelines published</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#4ECDC4" />
              </TouchableOpacity>
            </Animatable.View>
          )}
        </Animatable.View>
        {/* new ends */}

      

        {/* Systems Grid */}
        {/* <Animatable.View animation="fadeInUp" delay={400} style={styles.systemsSection}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8F00']}
              style={styles.sectionIcon}
            >
              <Ionicons name="apps" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.sectionTitle}>Our Digital Ecosystem</Text>
              <Text style={styles.sectionSubtitle}>
                {isLoggedIn ? "Your gateway to specialized systems" : "Login to access specialized platforms"}
              </Text>
            </View>
          </View>
          
          <View style={styles.tileGrid}>
            {systems.map((system, index) => (
              <ServiceTile
                key={system.label}
                iconName={system.icon}
                label={system.label}
                description={system.description}
                onPress={system.action}
                iconColor={system.color}
                isComingSoon={system.isComingSoon}
                index={index}
              />
            ))}
          </View>
        </Animatable.View> */}

        {/* Latest Updates */}
        {/* <Animatable.View animation="fadeInUp" delay={500} style={styles.updatesSection}>
          <View style={styles.sectionHeader}>
            <LinearGradient
              colors={['#4ECDC4', '#06D6A0']}
              style={styles.sectionIcon}
            >
              <Ionicons name="megaphone" size={24} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={styles.sectionTitle}>Latest Updates</Text>
              <Text style={styles.sectionSubtitle}>Stay informed with recent developments</Text>
            </View>
          </View>
          
          <View style={styles.updatesContainer}>
            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=Discretionary+Grants')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#FF6B6B', '#FF8F00']}
                style={styles.updateIconContainer}
              >
                <Ionicons name="gift" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>2025 Grants Launch</Text>
                <Text style={styles.updateDescription}>Discretionary grants for strategic projects now open</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#FF6B6B" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=ssp')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#4ECDC4', '#06D6A0']}
                style={styles.updateIconContainer}
              >
                <Ionicons name="document-text" size={20} color="#FFFFFF" />
              </LinearGradient>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>Sector Skills Plan</Text>
                <Text style={styles.updateDescription}>Updated industry guidelines published</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        </Animatable.View> */}


        {/* Quick Access */}
        {isLoggedIn && (
          <Animatable.View animation="fadeInUp" delay={600} style={styles.quickActions}>
            <View style={styles.sectionHeader}>
              <LinearGradient
                colors={['#FFD166', '#FFB347']}
                style={styles.sectionIcon}
              >
                <Ionicons name="flash" size={24} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <Text style={styles.sectionSubtitle}>Your most used actions</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="notifications" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionButtonText}>Alerts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#4ECDC4', '#06D6A0']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="settings" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionButtonText}>Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#FFD166', '#FFB347']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="help-circle" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionButtonText}>Support</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.9}>
                <LinearGradient
                  colors={['#118AB2', '#06D6A0']}
                  style={styles.actionIcon}
                >
                  <Ionicons name="download" size={20} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.actionButtonText}>Reports</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        )}

      </ScrollView>

      {/* Floating Chatbot Button */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        duration={1500}
        style={styles.chatbotContainer}
      >
        <TouchableOpacity
          style={styles.chatbotFab}
          onPress={() => setChatbotModalVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FF6B6B', '#FF8F00']}
            style={styles.chatbotGradient}
          >
            <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
          </LinearGradient>
          <View style={styles.chatbotBadge}>
            <Text style={styles.chatbotBadgeText}>AI</Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>

      {/* Enhanced Chatbot Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={chatbotModalVisible}
        onRequestClose={() => setChatbotModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <LinearGradient
              colors={['#6A0DAD', '#6A0DAD']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderLeft}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  style={styles.chatbotAvatar}
                >
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                </LinearGradient>
                <View>
                  <Text style={styles.modalTitle}>CHIETA Assistant</Text>
                  <Text style={styles.modalSubtitle}>Your AI-powered guide</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setChatbotModalVisible(false)}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </LinearGradient>

            {/* Program Buttons */}
            <View style={styles.programButtonsContainer}>
              <Text style={styles.programButtonsTitle}>Explore Programs</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.programButtonsScroll}>
                {programButtons.map((program, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.programButton, { borderColor: program.color }]}
                    onPress={() => fetchPrograms(program.type)}
                  >
                    <Ionicons name={program.icon} size={20} color={program.color} />
                    <Text style={[styles.programButtonText, { color: program.color }]}>{program.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {loading && (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading programs...</Text>
                </View>
              )}
              {response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseText}>{response}</Text>
                </View>
              )}
            </View>

            {/* Chat Messages */}
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.messageBubble,
                    item.sender === 'user' ? styles.userBubble : styles.botBubble,
                  ]}
                >
                  <Text style={[styles.messageText, item.sender === 'user' ? styles.userMessageText : styles.botMessageText]}>
                    {item.text}
                  </Text>
                </View>
              )}
              style={styles.messageList}
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
            />

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Ask me anything about CHIETA..."
                  placeholderTextColor="#999"
                  value={userInput}
                  onChangeText={setUserInput}
                  onSubmitEditing={handleSend}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8F00']}
                    style={styles.sendGradient}
                  >
                    <Ionicons name="send" size={20} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Redirect Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={redirectModalVisible}
        onRequestClose={cancelRedirect}
      >
        <View style={styles.redirectModalOverlay}>
          <View style={styles.redirectModalContent}>
            <View style={styles.redirectModalHeader}>
              <Ionicons name="globe" size={40} color="#FF8F00" />
              <Text style={styles.redirectModalTitle}>External Website</Text>
            </View>

            <View style={styles.redirectModalBody}>
              <Text style={styles.redirectModalText}>
                You are about to visit the official CHIETA website
              </Text>
              <Text style={styles.redirectModalSubtext}>
                This will open in your web browser
              </Text>
            </View>

            <View style={styles.redirectModalButtons}>
              <TouchableOpacity
                style={[styles.redirectButton, styles.cancelButton]}
                onPress={cancelRedirect}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.redirectButton, styles.confirmButton]}
                onPress={confirmRedirect}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#FF8F00']}
                  style={styles.confirmGradient}
                >
                  <Text style={styles.confirmButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation - Fixed at bottom */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.bottomNavButton} activeOpacity={0.7}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8F00']}
            style={styles.navIcon}
          >
            <Ionicons name="home" size={22} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.bottomNavLabel}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomNavButton}
          onPress={onNavigateToLogin}
          activeOpacity={0.7}
        >
          <View style={[styles.navIcon, styles.navIconSecondary]}>
            <Ionicons name="apps" size={22} color="#1A1A2E" />
          </View>
          <Text style={[styles.bottomNavLabel, styles.bottomNavLabelSecondary]}>Systems</Text>
        </TouchableOpacity>

        {isLoggedIn ? (
          <TouchableOpacity style={styles.bottomNavButton} activeOpacity={0.7}>
            <View style={[styles.navIcon, styles.navIconSecondary]}>
              <Ionicons name="person" size={22} color="#1A1A2E" />
            </View>
            <Text style={[styles.bottomNavLabel, styles.bottomNavLabelSecondary]}>Profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.bottomNavButton}
            onPress={onNavigateToLogin}
            activeOpacity={0.7}
          >
            <View style={[styles.navIcon, styles.navIconSecondary]}>
              <Ionicons name="log-in" size={22} color="#1A1A2E" />
            </View>
            <Text style={[styles.bottomNavLabel, styles.bottomNavLabelSecondary]}>Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom nav and chatbot button
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLogo: {
    width: 140,
    height: 50,
    resizeMode: 'contain',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  userAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  userText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  heroContainer: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  heroGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A2E',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 34,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  ctaButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featuredContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 160,
  },
  featuredImageStyle: {
    borderRadius: 20,
  },
  featuredOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  featuredContent: {
    alignItems: 'center',
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  featuredButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  featuredButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  systemsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },

  // new
  sectionHeaderTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,107,107,0.1)',
  },

  glowingIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  glowRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 16,
    top: -4,
    left: -4,
    zIndex: 1,
  },

  sectionHeaderText: {
    flex: 1,
  },

  toggleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },

  toggleText: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '500',
  },
  // new ends


  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
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
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    position: 'relative',
    width: '100%',
  },
  tileIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  tileButtonDisabled: {
    backgroundColor: '#F8F9FA',
    opacity: 0.7,
  },
  tileLabel: {
    fontSize: 16,
    color: '#1A1A2E',
    textAlign: 'center',
    fontWeight: '700',
    marginBottom: 4,
  },
  tileLabelDisabled: {
    color: '#9CA3AF',
  },
  tileDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
  },
  tileDescriptionDisabled: {
    color: '#9CA3AF',
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  comingSoonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  updatesSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  updatesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  updateIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  quickActions: {
    paddingHorizontal: 20,
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
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#1A1A2E',
    fontWeight: '600',
  },
  missionSection: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  missionContainer: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  missionContent: {
    alignItems: 'center',
  },
  missionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 12,
    marginBottom: 8,
  },
  missionDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  missionFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 16,
  },
  missionFeature: {
    alignItems: 'center',
    gap: 6,
  },
  missionFeatureText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  chatbotContainer: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    zIndex: 1000,
  },
  chatbotFab: {
    position: 'relative',
  },
  chatbotGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  chatbotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 24,
    height: 24,
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  chatbotBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatbotAvatar: {
    width: 44,
    height: 44,
    backgroundColor: '#FF8F00',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  programButtonsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  programButtonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  programButtonsScroll: {
    marginBottom: 12,
  },
  programButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    minWidth: 140,
    backgroundColor: 'white',
  },
  programButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  loadingContainer: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    alignItems: 'center',
  },
  loadingText: {
    color: '#FF8F00',
    fontSize: 14,
    fontWeight: '500',
  },
  responseContainer: {
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
  },
  responseText: {
    color: '#1A1A2E',
    fontSize: 14,
    lineHeight: 18,
  },
  messageList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#FF8F00',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#F0F0F0',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 18,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  botMessageText: {
    color: '#1A1A2E',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8F9FA',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    marginLeft: 8,
    overflow: 'hidden',
    borderRadius: 20,
  },
  sendGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  redirectModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  redirectModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  redirectModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  redirectModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A2E',
    marginTop: 12,
  },
  redirectModalBody: {
    marginBottom: 24,
  },
  redirectModalText: {
    fontSize: 16,
    color: '#1A1A2E',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  redirectModalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  redirectModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  redirectButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    overflow: 'hidden',
  },
  confirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 14,
    textAlign: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  bottomNavButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  navIconSecondary: {
    backgroundColor: '#F8F9FA',
  },
  bottomNavLabel: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '600',
  },
  bottomNavLabelSecondary: {
    color: '#666',
  },
});

export default HomeScreen;