import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { DataTable } from "react-native-paper";
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const IMsScreen = () => {
  const [activeTab, setActiveTab] = useState("bursary");
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableWidth, setTableWidth] = useState(Dimensions.get('window').width * 1.5);
  const [activeMenu, setActiveMenu] = useState("status"); // Added menu state

  // Documents data
  const documents = [
    {
      id: 1,
      title: "WSP Template",
      type: "WSP",
      icon: <MaterialIcons name="description" size={40} color="#6A0DAD" />,
    },
    {
      id: 2,
      title: "MOA Document",
      type: "MOA",
      icon: <FontAwesome5 name="file-contract" size={40} color="#6A0DAD" />,
    },
    {
      id: 3,
      title: "Award Letter",
      type: "AWARD",
      icon: <MaterialCommunityIcons name="certificate" size={40} color="#6A0DAD" />,
    },
    {
      id: 4,
      title: "Guidelines",
      type: "GUIDE",
      icon: <MaterialIcons name="menu-book" size={40} color="#6A0DAD" />,
    },
    {
      id: 5,
      title: "Application Form",
      type: "FORM",
      icon: <MaterialIcons name="assignment" size={40} color="#6A0DAD" />,
    },
  ];

  // Menu options
  const menuOptions = [
    { id: "status", title: "Application Status", icon: "list-alt" },
    { id: "documents", title: "Letters", icon: "folder" },

  ];

  // Get view title based on active menu
  const getViewTitle = () => {
    const activeOption = menuOptions.find(option => option.id === activeMenu);
    return activeOption ? activeOption.title : "Application Status";
  };

// Replace the useEffect hook that fetches data with this hardcoded data
useEffect(() => {
  if (activeMenu === "status") {
    setLoading(true);
    try {
    
      const hardcodedBursaryData = [
        {
          ApplicationId: "401",
          ApprovalStatusId: 1, // 1 = Approved, 2 = Rejected, 0 = Pending
          Comments: "Recommended for award.",
          Outcome: "Recommended by: Baswabile Maetisa",
          OutcomeDate: "2024-09-22 19:35:14.570"
        },  

      ];

 
      const hardcodedDGData = [
        {
          Id: "1475",
          ApprovalStatusId: 1,
          Comments: "No tax clearance certificate",
          Outcome: "Not Recommended by: Danricke Mentoor",
          DateCreated: "2022-07-06 13:41:10.493"
        },
        {
          Id: "1634",
          ApprovalStatusId: 1,
          Comments: "",
          Outcome: "Recommended by: Danricke Mentoor",
          DateCreated: "2022-07-06 13:25:53.900"
        }
      ];

      // Set the appropriate data based on active tab
      const data = activeTab === "bursary" ? hardcodedBursaryData : hardcodedDGData;
      setStatusData(data);
    } catch (err) {
      console.error("Error setting hardcoded data:", err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }
}, [activeTab, activeMenu]); // Added activeMenu to dependencies
  // Update table width on orientation change
  useEffect(() => {
    const updateTableWidth = () => {
      const windowWidth = Dimensions.get('window').width;
      setTableWidth(windowWidth < 500 ? windowWidth * 1.8 : windowWidth * 1.5);
    };

    Dimensions.addEventListener('change', updateTableWidth);
    return () => Dimensions.removeEventListener('change', updateTableWidth);
  }, []);

  const getStatusText = (statusId) => {
    switch (statusId) {
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Pending";
    }
  };

  const getStatusColor = (statusId) => {
    switch (statusId) {
      case 1:
        return "#4CAF50"; // Green for approved
      case 2:
        return "#F44336"; // Red for rejected
      default:
        return "#FFC107"; // Yellow for pending
    }
  };

  const handleDownload = (docType) => {
    // In a real app, this would trigger the actual download
    alert(`Downloading ${docType} document...`);
  };

  const renderBursaryTable = () => (
    <DataTable style={[styles.dataTable, { width: tableWidth }]}>
      <DataTable.Header style={styles.tableHeader}>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>App ID</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Status</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Comments</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Outcome</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Date</DataTable.Title>
      </DataTable.Header>

      {statusData.map((item, index) => (
        <DataTable.Row key={index} style={styles.tableRow}>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText}>{item.ApplicationId}</Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.ApprovalStatusId) }]}>
              <Text style={styles.statusText}>
                {getStatusText(item.ApprovalStatusId)}
              </Text>
            </View>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">
              {item.Comments || "N/A"}
            </Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">
              {item.Outcome || "N/A"}
            </Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText}>
              {item.OutcomeDate ? new Date(item.OutcomeDate).toLocaleDateString() : "N/A"}
            </Text>
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );

  const renderDGTable = () => (
    <DataTable style={[styles.dataTable, { width: tableWidth }]}>
      <DataTable.Header style={styles.tableHeader}>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>ID</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Status</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Comments</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Outcome</DataTable.Title>
        <DataTable.Title style={styles.titleStyle} textStyle={styles.headerText}>Date Created</DataTable.Title>
      </DataTable.Header>

      {statusData.map((item, index) => (
        <DataTable.Row key={index} style={styles.tableRow}>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText}>{item.Id}</Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.ApprovalStatusId) }]}>
              <Text style={styles.statusText}>
                {getStatusText(item.ApprovalStatusId)}
              </Text>
            </View>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">
              {item.Comments || "N/A"}
            </Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText} numberOfLines={2} ellipsizeMode="tail">
              {item.Outcome || "N/A"}
            </Text>
          </DataTable.Cell>
          <DataTable.Cell style={styles.cellStyle}>
            <Text style={styles.cellText}>
              {item.DateCreated ? new Date(item.DateCreated).toLocaleDateString() : "N/A"}
            </Text>
          </DataTable.Cell>
        </DataTable.Row>
      ))}
    </DataTable>
  );

  const renderDocumentsSection = () => (
    <View style={styles.documentsContainer}>
      <Text style={styles.sectionTitle}>Download Letters</Text>
      <Text style={styles.sectionSubtitle}>Important documents for your application process</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.documentsScroll}
      >
        {documents.map((doc) => (
          <TouchableOpacity 
            key={doc.id}
            style={styles.documentCard}
            onPress={() => handleDownload(doc.type)}
          >
            <View style={styles.documentIconContainer}>
              {doc.icon}
            </View>
            <Text style={styles.documentTitle}>{doc.title}</Text>
            <View style={styles.downloadButton}>
              <MaterialIcons name="cloud-download" size={24} color="white" />
              <Text style={styles.downloadText}>Download</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // const renderMessagesSection = () => (
  //   <View style={styles.messagesContainer}>
  //     <Text style={styles.sectionTitle}>Messages</Text>
  //     <Text style={styles.sectionSubtitle}>No new messages</Text>
  //   </View>
  // );

  // const renderProfileSection = () => (
  //   <View style={styles.profileContainer}>
  //     <Text style={styles.sectionTitle}>Profile Information</Text>
  //     <Text style={styles.sectionSubtitle}>Update your personal details</Text>
  //   </View>
  // );

  const renderActiveView = () => {
    switch (activeMenu) {
      case "status":
        return (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "bursary" && styles.activeTab]}
                onPress={() => setActiveTab("bursary")}
              >
                <Text style={styles.tabText}>Bursary</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "dg" && styles.activeTab]}
                onPress={() => setActiveTab("dg")}
              >
                <Text style={styles.tabText}>Discretionary Grant</Text>
              </TouchableOpacity>
            </View>

            <LinearGradient colors={["#6A0DAD", "#3A0A53"]} style={styles.section}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Loading status...</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>Error: {error}</Text>
                </View>
              ) : statusData.length > 0 ? (
                <View style={styles.scrollContainer}>
                  <ScrollView 
                    horizontal={true} 
                    style={styles.tableContainer}
                    contentContainerStyle={styles.scrollContent}
                    showsHorizontalScrollIndicator={false}
                  >
                    {activeTab === "bursary" ? renderBursaryTable() : renderDGTable()}
                  </ScrollView>
                </View>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>No status data available</Text>
                </View>
              )}
            </LinearGradient>
          </>
        );
      case "documents":
        return renderDocumentsSection();
      case "messages":
        return renderMessagesSection();
      case "profile":
        return renderProfileSection();
      default:
        return null;
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
          <Text style={styles.navbarTitle}>{getViewTitle()}</Text>
        </View>
      </LinearGradient>

      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/images/chieta_logo.png")}
          style={styles.logo}
        />
      </View>

      {/* Menu Options */}
      <View style={styles.menuContainer}>
        {menuOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.menuButton, activeMenu === option.id && styles.activeMenuButton]}
            onPress={() => setActiveMenu(option.id)}
          >
            <MaterialIcons 
              name={option.icon} 
              size={24} 
              color={activeMenu === option.id ? "#6A0DAD" : "#666"} 
            />
            <Text 
              style={[
                styles.menuText,
                activeMenu === option.id && styles.activeMenuText
              ]}
            >
              {option.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Active View Content */}
      {renderActiveView()}

      <LinearGradient colors={["#3A0A53", "#6A0DAD"]} style={styles.footer}>
        <Text style={styles.footerText}>
          Copyright © {new Date().getFullYear()}, CHIETA. All rights reserved.
        </Text>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "space-between" },
  backgroundImage: {
    resizeMode: "contain",
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "30%",
    height: "30%",
  },
  navbar: {
    height: 80,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  navbarContent: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  navbarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
  },
  // Menu styles
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 3,
  },
  menuButton: {
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
  },
  activeMenuButton: {
    backgroundColor: "#EDE7F6",
  },
  menuText: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  activeMenuText: {
    color: "#6A0DAD",
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: "#3A0A53",
  },
  activeTab: {
    backgroundColor: "#6A0DAD",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  tabText: {
    color: "white",
    fontWeight: "bold",
  },
  section: {
    flex: 1,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  tableContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  dataTable: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8,
    padding: 8,
    minWidth: '100%',
  },
  tableHeader: {
    backgroundColor: "#3A0A53",
    height: 50,
  },
  titleStyle: {
    justifyContent: 'center',
    minWidth: 100,
    maxWidth: 150,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: 'center',
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    minHeight: 60,
  },
  cellStyle: {
    justifyContent: 'center',
    minWidth: 100,
    maxWidth: 150,
    paddingVertical: 8,
  },
  cellText: {
    fontSize: 12,
    flexWrap: 'wrap',
    textAlign: 'center',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },
  noDataContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDataText: {
    color: "white",
    fontSize: 16,
  },
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 14,
  },
  // Documents section styles
  documentsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    flex: 1,
  },
  sectionTitle: {
    color: '#3A0A53',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  documentsScroll: {
    paddingBottom: 8,
  },
  documentCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 16,
    width: 160,
    marginRight: 12,
    alignItems: 'center',
  },
  documentIconContainer: {
    backgroundColor: '#EDE7F6',
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentTitle: {
    color: '#3A0A53',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  downloadButton: {
    flexDirection: 'row',
    backgroundColor: '#6A0DAD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Messages and Profile sections
  messagesContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
    flex: 1,
  },
});

export default IMsScreen;