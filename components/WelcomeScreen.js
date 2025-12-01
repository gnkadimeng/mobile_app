import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, TextInput, FlatList, Button, ImageBackground, StatusBar, SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import * as Animatable from 'react-native-animatable';
import axios from 'axios';
import { Linking } from 'react-native';

const WelcomeScreen = ({ onNavigateToLogin, onNavigateToLatest, onNavigateToHome }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectModalVisible, setRedirectModalVisible] = useState(false);
  const [pendingUrl, setPendingUrl] = useState('');

  const sendFaqForPrediction = (faq) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: faq },
    ]);
    handleSend(faq);
  };

  const showRedirectConfirmation = (url) => {
    setPendingUrl(url);
    setRedirectModalVisible(true);
  };

  const handleOpenLink = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open the link.');
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };

  const confirmRedirect = () => {
    setRedirectModalVisible(false);
    if (pendingUrl) {
      handleOpenLink(pendingUrl);
    }
    setPendingUrl('');
  };

  const cancelRedirect = () => {
    setRedirectModalVisible(false);
    setPendingUrl('');
  };

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
    { title: "Bursary Programs", type: "bursaries", icon: "school-outline", color: "#4A90E2" },
    { title: "Learnership Grants", type: "learnership grants", icon: "book-outline", color: "#7ED321" },
    { title: "Work-Based Learning", type: "work-based learning programs", icon: "briefcase-outline", color: "#F5A623" },
    { title: "Apprenticeship Grants", type: "apprenticeship grants", icon: "build-outline", color: "#D0021B" }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2C0A40" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Image
            source={require('../assets/images/chieta_logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <TouchableOpacity onPress={onNavigateToHome} style={styles.homeButton}>
            <Ionicons name="home" size={22} color="#FFFFFF" />
            <Text style={styles.homeButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerDivider} />
      </View>

      {/* Main Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.mainContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <Animatable.View animation="fadeInUp" duration={1000} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>Welcome to CHIETA</Text>
              <Text style={styles.heroDescription}>
                Facilitating skills development in the chemical industry.
              </Text>
            </View>
            <View style={styles.heroImageContainer}>
              <Image
                source={require('../assets/images/who_we_are.png')}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" delay={300} duration={1000} style={styles.statsContainer}>
          <View style={styles.statsCard}>
            <Ionicons name="people" size={28} color="#4A90E2" />
            <Text style={styles.statsNumber}>10K+</Text>
            <Text style={styles.statsLabel}>Learners Trained</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="business" size={28} color="#7ED321" />
            <Text style={styles.statsNumber}>500+</Text>
            <Text style={styles.statsLabel}>Partner Companies</Text>
          </View>
          <View style={styles.statsCard}>
            <Ionicons name="trophy" size={28} color="#F5A623" />
            <Text style={styles.statsNumber}>25+</Text>
            <Text style={styles.statsLabel}>Years Experience</Text>
          </View>
        </Animatable.View>

        {/* Latest Updates Section */}
        <Animatable.View animation="fadeInUp" delay={600} duration={1000} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="newspaper" size={24} color="#2C0A40" />
            <Text style={styles.sectionTitle}>Latest Updates</Text>
          </View>
          
          <View style={styles.updatesContainer}>
            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=Discretionary+Grants')}
              activeOpacity={0.8}
            >
              <View style={styles.updateIconContainer}>
                <Ionicons name="gift" size={24} color="#4A90E2" />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>Discretionary Grants</Text>
                <Text style={styles.updateDescription}>
                  Strategic Projects and Learning Programmes (2025/2026 Cycle 1)
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=ssp')}
              activeOpacity={0.8}
            >
              <View style={styles.updateIconContainer}>
                <Ionicons name="document-text" size={24} color="#7ED321" />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>CHIETA SSP</Text>
                <Text style={styles.updateDescription}>
                  Sector Skills Plan Documentation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/?s=Training+Workshops')}
              activeOpacity={0.8}
            >
              <View style={styles.updateIconContainer}>
                <Ionicons name="calendar" size={24} color="#F5A623" />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>Training Workshops</Text>
                <Text style={styles.updateDescription}>
                  Upcoming professional development sessions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.updateCard}
              onPress={() => showRedirectConfirmation('https://chieta.org.za/resource-center/annual-reports/')}
              activeOpacity={0.8}
            >
              <View style={styles.updateIconContainer}>
                <Ionicons name="bar-chart" size={24} color="#D0021B" />
              </View>
              <View style={styles.updateContent}>
                <Text style={styles.updateTitle}>Annual Reports</Text>
                <Text style={styles.updateDescription}>
                  Performance and impact documentation
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Enhanced Chatbot FAB */}
      <Animatable.View animation="pulse" iterationCount="infinite" duration={2000}>
        <TouchableOpacity style={styles.chatbotFab} onPress={() => setModalVisible(true)}>
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
          <View style={styles.chatbotBadge}>
            <Text style={styles.chatbotBadgeText}>!</Text>
          </View>
        </TouchableOpacity>
      </Animatable.View>

      {/* Enhanced Chatbot Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.chatbotAvatar}>
                  <Ionicons name="chatbubble-ellipses" size={24} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>CHIETA Assistant</Text>
                  <Text style={styles.modalSubtitle}>How can I help you today?</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Program Buttons */}
            <View style={styles.programButtonsContainer}>
              <Text style={styles.programButtonsTitle}>Explore Programs</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.programButtonsScroll}>
                {programButtons.map((program, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.programButton, { backgroundColor: program.color + '1A', borderColor: program.color }]}
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

            {/* Enhanced Input Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your message..."
                  placeholderTextColor="#999"
                  value={userInput}
                  onChangeText={setUserInput}
                  onSubmitEditing={handleSend}
                  multiline
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                  <Ionicons name="send" size={20} color="#FFFFFF" />
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
              <Ionicons name="globe" size={32} color="#FF8F00" />
              <Text style={styles.redirectModalTitle}>External Website</Text>
            </View>
            
            <View style={styles.redirectModalBody}>
              <Text style={styles.redirectModalText}>
                You are about to be redirected to the official CHIETA website. This will open in your web browser.
              </Text>
              <Text style={styles.redirectModalSubtext}>
                Do you wish to continue?
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
                <Text style={styles.confirmButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#2C0A40',
    paddingTop: 10,
    paddingBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerLogo: {
    width: 180,
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'white',
    padding: 4,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  mainContent: {
    paddingBottom: 100,
  },
  heroSection: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroText: {
    flex: 2,
    paddingRight: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8F00',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  heroImageContainer: {
    flex: 1,
    alignItems: 'center',
  },
  heroImage: {
    width: 120,
    height: 120,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statsNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginTop: 8,
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginLeft: 8,
  },
  updatesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  updateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  updateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  updateContent: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C0A40',
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  footer: {
    backgroundColor: '#2C0A40',
    paddingVertical: 16,
  },
  footerContent: {
    paddingHorizontal: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginLeft: 8,
    opacity: 0.9,
  },
  copyrightText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  chatbotFab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: '#FF8F00',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF8F00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  chatbotBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    backgroundColor: '#D0021B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatbotBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatbotAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#FF8F00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C0A40',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  programButtonsContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  programButtonsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C0A40',
    marginBottom: 12,
  },
  programButtonsScroll: {
    marginBottom: 12,
  },
  programButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    minWidth: 140,
  },
  programButtonText: {
    fontSize: 12,
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
    color: '#2C0A40',
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
    color: '#2C0A40',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
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
    color: '#2C0A40',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FF8F00',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
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
    borderRadius: 16,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C0A40',
    marginTop: 12,
  },
  redirectModalBody: {
    marginBottom: 24,
  },
  redirectModalText: {
    fontSize: 16,
    color: '#2C0A40',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  redirectModalSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  redirectModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  redirectButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#FF8F00',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WelcomeScreen;