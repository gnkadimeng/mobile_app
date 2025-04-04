import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert, TextInput, FlatList, Button, ImageBackground
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

  const sendFaqForPrediction = (faq) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: 'user', text: faq },
    ]);
    handleSend(faq);
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRight}></View>
      </View>

      <View style={styles.header}>
        <Text style={styles.headerText}>
          Tel: 087 357 6608 | 011 628 7000 | Anti-Fraud Line: 0800 333 120
        </Text>
      </View>

      {/* Logo at top-left corner */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/images/chieta_logo.jpg')}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.mainContent}>
        <Animatable.View animation="fadeInUp" duration={1200} style={styles.descriptionBox}>
          <View style={styles.descriptionContent}>
            <View style={styles.textSection}>
              <Animatable.Text animation="fadeIn" delay={500} style={styles.descriptionText}>
                The Chemical Industries Education & Training Authority (CHIETA) is a statutory body that was established by
                The Skills Development Act 97 of 1998. Our purpose as a SETA is to facilitate skills development in the
                chemical industries sector and to ensure that skills needs are identified and addressed through a number of
                initiatives by the SETA and the sector.
              </Animatable.Text>
            </View>
            <View style={styles.imageSection}>
              <Image
                source={require('../assets/images/who_we_are.png')}
                style={styles.descriptionImage}
                resizeMode="contain"
              />
            </View>
          </View>
          {/* <Animatable.Image
            animation="rotate"
            iterationCount={30}
            delay={100}
            source={require('../assets/images/chieta_logo.jpg')}
            style={styles.logo}
          /> */}
        </Animatable.View>

        {/* Latest Content */}
        <Text style={styles.latestHeader}>Latest Updates</Text>
        <View style={styles.latestContent}>
          <TouchableOpacity
            style={styles.latestItem}
            onPress={() => handleOpenLink('https://chieta.org.za/?s=Discretionary+Grants')}
          >
            <Ionicons name="link-outline" size={20} color="#3A0A53" />
            <Text style={styles.latestText}>
              Discretionary Grants – Strategic Projects and Learning Programmes (2025/2026 Cycle 1)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.latestItem}
            onPress={() => handleOpenLink('https://chieta.org.za/?s=ssp')}
          >
            <Ionicons name="link-outline" size={20} color="#3A0A53" />
            <Text style={styles.latestText}>CHIETA SSP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.latestItem}
            onPress={() => handleOpenLink('https://chieta.org.za/?s=Training+Workshops')}
          >
            <Ionicons name="link-outline" size={20} color="#3A0A53" />
            <Text style={styles.latestText}>Upcoming Training Workshops</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.latestItem}
            onPress={() => handleOpenLink('https://chieta.org.za/resource-center/annual-reports/')}
          >
            <Ionicons name="link-outline" size={20} color="#3A0A53" />
            <Text style={styles.latestText}>Annual Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerButtons}>
          <TouchableOpacity style={styles.footerButton} onPress={onNavigateToLatest}>
            <Ionicons name="newspaper-outline" size={20} color="#fff" style={styles.footerButtonIcon} />
            <Text style={styles.footerButtonText}>Latest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={onNavigateToHome}>
            <Ionicons name="log-in-outline" size={20} color="#fff" style={styles.footerButtonIcon} />
            <Text style={styles.footerButtonText}>Home</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.footerText}>© 2025, CHIETA. All rights reserved.</Text>
      </View>

      {/* Chatbot Icon */}
      <TouchableOpacity style={styles.chatbotIcon} onPress={() => setModalVisible(true)}>
        <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Chatbot Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={30} color="#CE8946" />
            </TouchableOpacity>

            <Text style={styles.modalText}>Chat with us!</Text>

            {/* FAQ Section */}
            <View style={styles.faqContainer}>
              <Text style={styles.faqHeader}>Click to check out available programs</Text>
              <ScrollView style={{ padding: 20 }}>
                <Button title="Our Available Bursaries Programs" onPress={() => fetchPrograms('bursaries')} />
                <Button title="Our Available Learnership Grants" onPress={() => fetchPrograms('learnership grants')} />
                <Button title="Our Available Work-Based Learning Programs" onPress={() => fetchPrograms('work-based learning programs')} />
                <Button title="Our Available Apprenticeships Grant Programs" onPress={() => fetchPrograms('apprenticeship grants')} />
                {loading && <Text>Loading...</Text>}
                {response && <Text style={{ marginTop: 20 }}>{response}</Text>}
              </ScrollView>
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
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              )}
              style={styles.messageList}
              contentContainerStyle={{ paddingBottom: 10 }}
              keyboardShouldPersistTaps="handled"
            />

            {/* Input Field */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={userInput}
                onChangeText={setUserInput}
                onSubmitEditing={handleSend}
              />
              <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                <Ionicons name="send-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3A0A53',
    padding: 9,
    width: '100%',
    zIndex: 10
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerLogo: {
    width: 200,
    height: 70,
    marginRight: 10,
  },
  logo: {
    width: 150,
    height: 50,
  },
  headerRight: {
    flexDirection: 'row',
  },
  mainContent: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
    zIndex: 1,
  },
  descriptionBox: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#ff8f00',
  },
  latestHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A0A53',
    marginVertical: 15,
    alignSelf: 'flex-start',
  },
  latestContent: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  latestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  latestText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#3A0A53',
  },
  footer: {
    backgroundColor: '#3A0A53',
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  footerButton: {
    // backgroundColor: '#b78a28',
    backgroundColor: '#d08c1c',
    // borderBottomWidth: 4,
    // borderBottomColor: '#fff',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    transform: [{ translateY: -2 }],
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#fff',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  footerText: {
    color: '#fff',
    fontSize: 12,
  },
  chatbotIcon: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    // backgroundColor: '#CE8946',
    backgroundColor: '#ff8f00',
    borderRadius: 50,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ translateY: -2 }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
  },
  messageList: {
    flex: 1,
    marginVertical: 10,
  },
  messageBubble: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: '80%',
  },
  userBubble: {
    backgroundColor: '#CE8946',
    alignSelf: 'flex-end',
  },
  botBubble: {
    backgroundColor: '#E0E0E0',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: '#000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: '#CE8946',
    padding: 10,
    borderRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  faqContainer: {
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginVertical: 10,
  },
  faqHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A0A53',
    marginBottom: 10,
  },
  loadingText: {
    color: '#CE8946',
    fontSize: 16,
    marginTop: 10,
  },
  responseText: {
    color: '#3A0A53',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  descriptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  textSection: {
    flex: 2,
    paddingRight: 10,
  },
  imageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  descriptionImage: {
    width: '120%',
    height: 160,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'left',
  },
  logoContainer: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5,
  },
});

export default WelcomeScreen;