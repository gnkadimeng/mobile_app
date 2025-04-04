import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Card, Button, DataTable, Menu, Divider } from "react-native-paper";
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";

const SSDDScreen = ({ onNavigateBack, email }) => {
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [studentStatus, setStudentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [activeView, setActiveView] = useState("students"); 

  useEffect(() => {
    console.log("Email prop in SSDDScreen:", email);
    if (email) {
      fetchStudents(email);
      fetchDocuments(email);
      fetchStudentStatus(email);
    }
  }, [email]);

  const fetchStudents = async (email) => {
    try {
      console.log("Fetching students for email:", email);
      const response = await axios.get(`http://10.114.21.31:5000/students/${email}`);
      console.log("Students API Response:", response.data);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching student data:", error.message);
      console.error("Error details:", error.response?.data || error);
    }
  };

  const fetchStudentStatus = async (email) => {
    try {
      const response = await axios.get(`http://10.114.21.31:5000/student-status/${email}`);
      console.log("Student Status API Response:", response.data);
      setStudentStatus(response.data);
    } catch (error) {
      console.error("Error fetching student status data:", error.message);
      console.error("Error details:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (email) => {
    try {
      const response = await axios.get(`http://10.114.21.31:5000/documents/${email}`);
      console.log("Documents API Response:", response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error("Error fetching documents:", error.message);
      console.error("Error details:", error.response?.data || error);
    }
  };

  const handleDownload = (documentUrl, documentName, documentType) => {
    console.log("Download button pressed. Document URL:", documentUrl);
    console.log("Document Name:", documentName);
    console.log("Document Type:", documentType);
  
    if (!documentUrl) {
      alert("Downloaded Successfully.");
      return;
    }
  
    Linking.openURL(documentUrl).catch((err) => {
      console.error("Error opening document:", err);
      alert("Failed to open the document. Please try again later.");
    });
  };

  const handleLogout = () => {
    onNavigateBack();
  };

  const openMenu = () => setVisibleMenu(true);
  const closeMenu = () => setVisibleMenu(false);

  const renderActiveView = () => {
    switch (activeView) {
      case "students":
        return (
          <Card style={styles.dataTableCard}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title>Decision</DataTable.Title>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Comment</DataTable.Title>
              </DataTable.Header>

              {students.map((student, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{student.email}</DataTable.Cell>
                  <DataTable.Cell>{student.decision_outcome || "N/A"}</DataTable.Cell>
                  <DataTable.Cell>{student.decision_date || "N/A"}</DataTable.Cell>
                  <DataTable.Cell>{student.decision_verdict || "N/A"}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card>
        );
      case "student-status":
        return (
          <Card style={styles.dataTableCard}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Email</DataTable.Title>
                <DataTable.Title>Company</DataTable.Title>
                <DataTable.Title>Decision</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
              </DataTable.Header>

              {studentStatus.map((status, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{status.email}</DataTable.Cell>
                  <DataTable.Cell>{status.company_name || "N/A"}</DataTable.Cell>
                  <DataTable.Cell>{status.decision_outcome || "N/A"}</DataTable.Cell>
                  <DataTable.Cell>{status.placement_type || "N/A"}</DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card>
        );
      case "documents":
        return (
          <Card style={styles.dataTableCard}>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Document Name</DataTable.Title>
                <DataTable.Title>Type</DataTable.Title>
                <DataTable.Title>Date</DataTable.Title>
                <DataTable.Title>Action</DataTable.Title>
              </DataTable.Header>

              {documents.map((doc, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{doc.file_name}</DataTable.Cell>
                  <DataTable.Cell>{doc.document_type}</DataTable.Cell>
                  <DataTable.Cell>{new Date(doc.uploaded_at).toLocaleDateString()}</DataTable.Cell>
                  <DataTable.Cell>
                    <TouchableOpacity onPress={() => handleDownload(doc.file_url, doc.file_name, doc.document_type)}>
                      <MaterialIcons name="file-download" size={24} color="#6A0DAD" />
                    </TouchableOpacity>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </Card>
        );
      default:
        return null;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "students": return "Admin Status";
      case "student-status": return "Placement Status";
      case "documents": return "Uploaded Documents";
      default: return "";
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/home2.png")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      <LinearGradient colors={["#3A0A53", "#6A0DAD"]} style={styles.navbar}>
        <View style={styles.navbarContent}>
          <Menu
            visible={visibleMenu}
            onDismiss={closeMenu}
            anchor={
              <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
                <Feather name="menu" size={24} color="white" />
                <Text style={styles.menuButtonText}>{getViewTitle()}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="white" />
              </TouchableOpacity>
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={() => {
                setActiveView("students");
                closeMenu();
              }} 
              title="Admin Status" 
              leadingIcon={() => <Ionicons name="person" size={20} color="#6A0DAD" />}
              style={activeView === "students" ? styles.activeMenuItem : null}
              titleStyle={activeView === "students" ? styles.activeMenuText : styles.menuText}
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setActiveView("student-status");
                closeMenu();
              }} 
              title="Placement Status" 
              leadingIcon={() => <FontAwesome5 name="building" size={20} color="#6A0DAD" />}
              style={activeView === "student-status" ? styles.activeMenuItem : null}
              titleStyle={activeView === "student-status" ? styles.activeMenuText : styles.menuText}
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setActiveView("documents");
                closeMenu();
              }} 
              title="Documents" 
              leadingIcon={() => <MaterialIcons name="description" size={20} color="#6A0DAD" />}
              style={activeView === "documents" ? styles.activeMenuItem : null}
              titleStyle={activeView === "documents" ? styles.activeMenuText : styles.menuText}
            />
          </Menu>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="white" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.logoContainer}>
        <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
      </View>

      <ScrollView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#6A0DAD" />
        ) : (
          <LinearGradient colors={["#6A0DAD", "#3A0A53"]} style={styles.section}>
            <Text style={styles.sectionTitle}>{getViewTitle()}</Text>
            {renderActiveView()}
          </LinearGradient>
        )}
      </ScrollView>

      <LinearGradient colors={["#3A0A53", "#6A0DAD"]} style={styles.footer}>
        <Text style={styles.footerText}>Copyright © 2025, CHIETA. All rights reserved.</Text>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "space-between" },
  backgroundImage: { resizeMode: "contain", position: "absolute", bottom: 0, left: 0, width: "30%", height: "30%" },
  navbar: {
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  navbarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  menuButtonText: {
    color: "white",
    fontSize: 16,
    marginHorizontal: 8,
    fontWeight: "bold",
  },
  menuContent: {
    backgroundColor: "white",
    borderRadius: 8,
    marginTop: 40,
  },
  menuText: {
    color: "#6A0DAD",
  },
  activeMenuItem: {
    backgroundColor: "rgba(106, 13, 173, 0.1)",
  },
  activeMenuText: {
    color: "#6A0DAD",
    fontWeight: "bold",
  },
  logoutButton: { 
    flexDirection: "row", 
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  logoutText: { 
    color: "white", 
    fontSize: 16, 
    marginLeft: 5,
    fontWeight: "bold",
  },
  logoContainer: { 
    justifyContent: "center", 
    alignItems: "center", 
    marginTop: 20,
    marginBottom: 10,
  },
  logo: { 
    width: 200, 
    height: 80, 
    resizeMode: "contain" 
  },
  container: { 
    flex: 1, 
    backgroundColor: "#F8F8F8", 
    padding: 16 
  },
  section: { 
    marginBottom: 20, 
    borderRadius: 12, 
    padding: 16, 
    elevation: 4,
    minHeight: Dimensions.get('window').height * 0.5,
  },
  dataTableCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "white",
    padding: 8,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    textAlign: "center",
  },
  footer: { 
    padding: 20, 
    alignItems: "center" 
  },
  footerText: { 
    color: "white", 
    fontSize: 14 
  },
});

export default SSDDScreen;