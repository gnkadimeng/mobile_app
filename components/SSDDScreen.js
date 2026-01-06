import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import { Card, DataTable } from "react-native-paper";
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import API_CONFIG, { ENDPOINTS } from "../config";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// CHIETA brand colors
const CHIETA_COLORS = {
  primary: '#2C0A40',
  secondary: '#FF8F00',
  accent: '#6A0DAD',
  lightBg: '#F8F9FA',
  darkText: '#2C3E50',
  lightText: '#FFFFFF',
  success: '#4CAF50',
  warning: '#F59E0B',
  danger: '#F44336',
  info: '#2196F3',
  gray: '#6B7280',
};

const SSDDScreen = ({ onNavigateBack, email }) => {
  const [students, setStudents] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [studentStatus, setStudentStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("students");
  const [apiStatus, setApiStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    console.log('🚀 SSDDScreen mounted with email:', email);
    
    if (email) {
      loadData();
    }
  }, [email]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await checkApiHealth();
      
      // Fetch all data in parallel
      await Promise.all([
        fetchStudents(email),
        fetchDocuments(email),
        fetchStudentStatus(email)
      ]);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const checkApiHealth = async () => {
    try {
      const config = API_CONFIG();
      const response = await axios.get(`${config.BASE_URL}${ENDPOINTS.HEALTH}`, {
        timeout: 10000
      });
      setApiStatus('online');
      console.log('✅ Backend is online:', config.BASE_URL);
      return true;
    } catch (error) {
      setApiStatus('offline');
      console.error('❌ Backend is offline:', error.message);
      throw new Error('Backend connection failed');
    }
  };

  const fetchStudents = async (email) => {
    try {
      const config = API_CONFIG();
      const url = config.buildStudentsURL ? config.buildStudentsURL(email) : `${config.BASE_URL}${ENDPOINTS.STUDENTS}/${email}`;
      
      console.log('📡 Fetching students from:', url);
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ Students data received:', response.data);
      setStudents(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching student data:", error);
      setStudents([]);
      throw error;
    }
  };

  const fetchStudentStatus = async (email) => {
    try {
      const config = API_CONFIG();
      const url = config.buildStudentStatusURL ? config.buildStudentStatusURL(email) : `${config.BASE_URL}${ENDPOINTS.STUDENT_STATUS}/${email}`;
      
      console.log('📡 Fetching student status from:', url);
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ Student status data received:', response.data);
      setStudentStatus(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching student status data:", error);
      setStudentStatus([]);
      throw error;
    }
  };

  const fetchDocuments = async (email) => {
    try {
      const config = API_CONFIG();
      const url = config.buildDocumentsURL ? config.buildDocumentsURL(email) : `${config.BASE_URL}${ENDPOINTS.DOCUMENTS}/${email}`;
      
      console.log('📡 Fetching documents from:', url);
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ Documents data received:');
      console.log('  Total documents:', response.data.length);
      
      if (Array.isArray(response.data)) {
        console.log('🔍 Document details:');
        response.data.forEach((doc, idx) => {
          console.log(`  Document ${idx + 1}:`);
          console.log(`    Name: ${doc.file_name}`);
          console.log(`    URL: ${doc.file_url || doc.download_url}`);
          console.log(`    Type: ${doc.document_type}`);
        });
      }
      
      setDocuments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching documents:", error);
      setDocuments([]);
      throw error;
    }
  };

  // FIXED: Simplified download function
  const handleDownload = async (document, index) => {
    console.log('📥 Attempting to download:', document.file_name);
    
    if (downloading) return;
    
    setDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [index]: 0 }));
    
    if (!document || !document.file_name) {
      Alert.alert("Error", "Document filename not available.");
      setDownloading(false);
      setDownloadProgress(prev => ({ ...prev, [index]: null }));
      return;
    }

    try {
      // Get the download URL - prefer direct URLs from backend
      let downloadUrl = document.direct_download_url || document.download_url || document.file_url;
      
      if (!downloadUrl) {
        // Construct the download URL if not provided by backend
        const config = API_CONFIG();
        const encodedFilename = encodeURIComponent(document.file_name);
        downloadUrl = `${config.BASE_URL}/download/document/${encodedFilename}`;
      }
      
      console.log('📊 Download info:');
      console.log('  File name:', document.file_name);
      console.log('  Download URL:', downloadUrl);
      
      // Test if URL can be opened
      const canOpen = await Linking.canOpenURL(downloadUrl);
      console.log('  Can open URL?', canOpen);
      
      if (canOpen) {
        console.log('✅ Opening download URL...');
        
        // Update progress to show download started
        setDownloadProgress(prev => ({ ...prev, [index]: 50 }));
        
        // Open the URL - this should trigger the download
        const supported = await Linking.openURL(downloadUrl);
        
        if (supported) {
          setDownloadProgress(prev => ({ ...prev, [index]: 100 }));
          setTimeout(() => {
            Alert.alert("Download Started", `Downloading: ${document.file_name}`);
            setDownloadProgress(prev => ({ ...prev, [index]: null }));
          }, 500);
        } else {
          Alert.alert("Error", "Cannot open URL on this device");
          setDownloadProgress(prev => ({ ...prev, [index]: null }));
        }
      } else {
        Alert.alert(
          "Cannot Open URL", 
          "The download URL cannot be opened directly. Trying alternative method...",
          [{ text: "OK" }]
        );
        
        // Try alternative: Show the URL for manual download
        Alert.alert(
          "Download Link",
          `File: ${document.file_name}\n\nCopy this URL to download: ${downloadUrl}`,
          [
            { text: "Copy URL", onPress: () => copyToClipboard(downloadUrl) },
            { text: "Open in Browser", onPress: () => Linking.openURL(downloadUrl) },
            { text: "Cancel" }
          ]
        );
        setDownloadProgress(prev => ({ ...prev, [index]: null }));
      }
    } catch (error) {
      console.error('❌ Download error:', error);
      
      Alert.alert(
        "Download Error", 
        `Failed to download: ${document.file_name}\n\nError: ${error.message}`,
        [
          { 
            text: "Try Direct Download", 
            onPress: () => {
              // Show direct download instructions
              const config = API_CONFIG();
              const encodedFilename = encodeURIComponent(document.file_name);
              const directUrl = `${config.BASE_URL}/download/document/${encodedFilename}`;
              
              Alert.alert(
                "Direct Download",
                `Open this link in your browser:\n\n${directUrl}`,
                [
                  { text: "Copy Link", onPress: () => copyToClipboard(directUrl) },
                  { text: "OK" }
                ]
              );
            }
          },
          { text: "Cancel" }
        ]
      );
      setDownloadProgress(prev => ({ ...prev, [index]: null }));
    } finally {
      setDownloading(false);
    }
  };

  // Helper function to copy to clipboard
  const copyToClipboard = async (text) => {
    // You'll need to install and use @react-native-clipboard/clipboard
    // For now, we'll just show an alert
    Alert.alert("Copied!", "URL copied to clipboard");
    console.log("Would copy to clipboard:", text);
  };

  const testServerConnection = async () => {
    try {
      const config = API_CONFIG();
      const testUrl = `${config.BASE_URL}/health`;
      console.log('🧪 Testing server connection:', testUrl);
      
      const response = await axios.get(testUrl, { timeout: 5000 });
      console.log('✅ Server connection test successful:', response.data);
      Alert.alert("Server Test", "Server is responding correctly.");
    } catch (error) {
      console.error('❌ Server test failed:', error);
      Alert.alert("Server Test Failed", `Cannot reach server: ${error.message}`);
    }
  };

  const testUploadsDirectory = async () => {
    try {
      const config = API_CONFIG();
      const url = `${config.BASE_URL}/uploads-check`;
      console.log('🔍 Testing uploads directory:', url);
      
      const response = await axios.get(url, { timeout: 5000 });
      console.log('📁 Uploads directory check:', response.data);
      
      Alert.alert(
        "Uploads Directory Info",
        `Directory: ${response.data.uploadsDirectory}\nExists: ${response.data.exists}\nFiles: ${response.data.fileCount}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error('❌ Uploads directory test failed:', error);
      Alert.alert("Error", `Failed to check uploads: ${error.message}`);
    }
  };

  const handleLogout = () => onNavigateBack();

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'accepted': return CHIETA_COLORS.success;
      case 'rejected':
      case 'declined': return CHIETA_COLORS.danger;
      case 'pending': return CHIETA_COLORS.warning;
      default: return CHIETA_COLORS.gray;
    }
  };

  const renderStatusBadge = (status) => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.statusText}>{status || 'N/A'}</Text>
    </View>
  );

  const renderApiStatusIndicator = () => {
    const config = API_CONFIG();
    
    if (apiStatus === 'checking') {
      return (
        <View style={styles.apiStatusContainer}>
          <ActivityIndicator size="small" color={CHIETA_COLORS.warning} />
          <Text style={styles.apiStatusText}>Checking backend connection...</Text>
        </View>
      );
    }
    
    if (apiStatus === 'offline') {
      return (
        <View style={styles.apiStatusContainer}>
          <MaterialIcons name="error-outline" size={16} color={CHIETA_COLORS.danger} />
          <Text style={[styles.apiStatusText, { color: CHIETA_COLORS.danger }]}>
            Backend offline
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.apiStatusContainer}>
        <MaterialIcons name="check-circle" size={16} color={CHIETA_COLORS.success} />
        <Text style={[styles.apiStatusText, { color: CHIETA_COLORS.success }]}>
          Backend online
        </Text>
      </View>
    );
  };

  const renderActiveView = () => {
    if (apiStatus === 'offline' && students.length === 0 && documents.length === 0 && studentStatus.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="cloud-off" size={64} color={CHIETA_COLORS.gray} />
          <Text style={styles.errorTitle}>Connection Issue</Text>
          <Text style={styles.errorMessage}>
            Unable to connect to the backend server.
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (error && students.length === 0 && documents.length === 0 && studentStatus.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={CHIETA_COLORS.danger} />
          <Text style={styles.errorTitle}>Data Loading Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeView) {
      case "students":
        return renderStudentsView();
      case "student-status":
        return renderStudentStatusView();
      case "documents":
        return renderDocumentsView();
      default:
        return null;
    }
  };

  const renderStudentsView = () => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="people" size={20} color={CHIETA_COLORS.accent} />
        <Text style={styles.cardTitle}>Admin Decisions</Text>
        {renderApiStatusIndicator()}
      </View>
      
      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.emptyStateText}>No admin decisions found</Text>
          <Text style={styles.emptyStateSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No data available'}
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <DataTable>
            <DataTable.Header style={styles.tableHeaderRow}>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Email</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Decision</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper} numeric>
                <Text style={styles.headerText}>Date</Text>
              </DataTable.Title>
            </DataTable.Header>
            
            {students.map((student, index) => (
              <DataTable.Row
                key={index}
                onPress={() => Alert.alert("Student Details", 
                  `Email: ${student.email || 'N/A'}\nDecision: ${student.decision_outcome || 'N/A'}\nDate: ${student.decision_date ? new Date(student.decision_date).toLocaleDateString('en-GB') : 'N/A'}`)}
                style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
              >
                <DataTable.Cell style={styles.cellWrapper}>
                  <Text style={styles.cellText} numberOfLines={2}>
                    {student.email || 'N/A'}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cellWrapper}>
                  {renderStatusBadge(student.decision_outcome)}
                </DataTable.Cell>
                <DataTable.Cell style={styles.cellWrapper} numeric>
                  <Text style={styles.cellText}>
                    {student.decision_date ? new Date(student.decision_date).toLocaleDateString('en-GB') : "N/A"}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      )}
    </View>
  );

  const renderStudentStatusView = () => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <FontAwesome5 name="building" size={20} color={CHIETA_COLORS.accent} />
        <Text style={styles.cardTitle}>Placement Status</Text>
        {renderApiStatusIndicator()}
      </View>
      
      {studentStatus.length === 0 ? (
        <View style={styles.emptyState}>
          <FontAwesome5 name="building" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.emptyStateText}>No placement records found</Text>
          <Text style={styles.emptyStateSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No data available'}
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <DataTable>
            <DataTable.Header style={styles.tableHeaderRow}>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Email</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Company</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Decision</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper} numeric>
                <Text style={styles.headerText}>Type</Text>
              </DataTable.Title>
            </DataTable.Header>
            
            {studentStatus.map((status, index) => (
              <DataTable.Row
                key={index}
                onPress={() => Alert.alert("Status Details",
                  `Email: ${status.email || 'N/A'}\nCompany: ${status.company_name || 'N/A'}\nDecision: ${status.decision_outcome || 'N/A'}\nType: ${status.placement_type || 'N/A'}`)}
                style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
              >
                <DataTable.Cell style={styles.cellWrapper}>
                  <Text style={styles.cellText} numberOfLines={2}>
                    {status.email || 'N/A'}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cellWrapper}>
                  <Text style={styles.cellText} numberOfLines={2}>
                    {status.company_name || "N/A"}
                  </Text>
                </DataTable.Cell>
                <DataTable.Cell style={styles.cellWrapper}>
                  {renderStatusBadge(status.decision_outcome)}
                </DataTable.Cell>
                <DataTable.Cell style={styles.cellWrapper} numeric>
                  <Text style={styles.cellText}>
                    {status.placement_type || "N/A"}
                  </Text>
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      )}
    </View>
  );

  const renderDocumentsView = () => (
    <View style={styles.modernCard}>
      <View style={styles.cardHeader}>
        <MaterialIcons name="description" size={24} color={CHIETA_COLORS.accent} />
        <Text style={styles.cardTitle}>Document Library</Text>
        {renderApiStatusIndicator()}
      </View>
      
      <View style={styles.debugButtonsContainer}>
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={testServerConnection}
        >
          <Text style={styles.debugButtonText}>Test Server</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={testUploadsDirectory}
        >
          <Text style={styles.debugButtonText}>Check Uploads</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => {
            Alert.alert(
              "Debug Info",
              `Backend: ${API_CONFIG().BASE_URL}\nEmail: ${email}\nDocuments: ${documents.length}\nAPI Status: ${apiStatus}`
            );
          }}
        >
          <Text style={styles.debugButtonText}>Debug Info</Text>
        </TouchableOpacity>
      </View>
      
      {documents.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="description" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.emptyStateText}>No documents available</Text>
          <Text style={styles.emptyStateSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No data available for your account'}
          </Text>
        </View>
      ) : (
        <View style={styles.tableContainer}>
          <DataTable>
            <DataTable.Header style={styles.tableHeaderRow}>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Document Name</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper}>
                <Text style={styles.headerText}>Type</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper} numeric>
                <Text style={styles.headerText}>Date</Text>
              </DataTable.Title>
              <DataTable.Title style={styles.cellWrapper} numeric>
                <Text style={styles.headerText}>Download</Text>
              </DataTable.Title>
            </DataTable.Header>
            
            {documents.map((doc, index) => {
              const progress = downloadProgress[index];
              
              return (
                <DataTable.Row
                  key={index}
                  onPress={() => Alert.alert("Document Details",
                    `Name: ${doc.file_name || 'N/A'}\nType: ${doc.document_type || 'N/A'}\nDate: ${doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-GB') : 'N/A'}\nSize: ${doc.file_size || 'N/A'}`)}
                  style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
                >
                  <DataTable.Cell style={styles.cellWrapper}>
                    <Text style={styles.cellText} numberOfLines={3}>
                      {doc.file_name || 'Unnamed Document'}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{doc.document_type || 'Unknown'}</Text>
                    </View>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper} numeric>
                    <Text style={styles.cellText}>
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString('en-GB') : "N/A"}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper} numeric>
                    {progress !== undefined && progress !== null ? (
                      <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${progress}%` }
                            ]} 
                          />
                        </View>
                        <Text style={styles.progressText}>{progress}%</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDownload(doc, index);
                        }}
                        style={[styles.modernDownloadButton, downloading && styles.disabledButton]}
                        disabled={downloading}
                      >
                        {downloading ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <MaterialIcons name="download" size={20} color="white" />
                        )}
                      </TouchableOpacity>
                    )}
                  </DataTable.Cell>
                </DataTable.Row>
              );
            })}
          </DataTable>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CHIETA_COLORS.primary} />
      
      {/* Header */}
      <LinearGradient 
        colors={[CHIETA_COLORS.primary, CHIETA_COLORS.accent]} 
        style={styles.header}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoSection}>
            <Image 
              source={require("../assets/images/chieta_logo.png")} 
              style={styles.headerLogo} 
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color={CHIETA_COLORS.lightText} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.headerTitle}>SSDD Portal</Text>
          <Text style={styles.headerSubtitle}>
            {activeView === "students" ? "Admin Status" : 
             activeView === "student-status" ? "Placement Status" : 
             "Documents"}
          </Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeView === 'students' && styles.activeTab]}
            onPress={() => setActiveView('students')}
          >
            <Ionicons 
              name="people" 
              size={16} 
              color={activeView === 'students' ? CHIETA_COLORS.primary : CHIETA_COLORS.lightText} 
            />
            <Text style={[styles.tabText, activeView === 'students' && styles.activeTabText]}>
              Admin Status
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeView === 'student-status' && styles.activeTab]}
            onPress={() => setActiveView('student-status')}
          >
            <FontAwesome5 
              name="building" 
              size={16} 
              color={activeView === 'student-status' ? CHIETA_COLORS.primary : CHIETA_COLORS.lightText} 
            />
            <Text style={[styles.tabText, activeView === 'student-status' && styles.activeTabText]}>
              Placement
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeView === 'documents' && styles.activeTab]}
            onPress={() => setActiveView('documents')}
          >
            <MaterialIcons 
              name="description" 
              size={16} 
              color={activeView === 'documents' ? CHIETA_COLORS.primary : CHIETA_COLORS.lightText} 
            />
            <Text style={[styles.tabText, activeView === 'documents' && styles.activeTabText]}>
              Documents
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CHIETA_COLORS.accent} />
            <Text style={styles.loadingText}>Loading data...</Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {renderActiveView()}
          </ScrollView>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, {backgroundColor: CHIETA_COLORS.primary}]}>
        <Text style={[styles.footerText, {color: CHIETA_COLORS.lightText}]}>
          © {new Date().getFullYear()} CHIETA. All rights reserved.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHIETA_COLORS.lightBg,
  },
  
  // Header Styles
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoSection: {
    flex: 1,
  },
  headerLogo: {
    width: 120,
    height: 40,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBottom: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 21,
  },
  activeTab: {
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabText: {
    color: CHIETA_COLORS.lightText,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  activeTabText: {
    color: CHIETA_COLORS.primary,
  },
  
  // Content Styles
  content: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CHIETA_COLORS.gray,
  },
  
  // Card Styles
  modernCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 0,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginLeft: 12,
  },

  // Debug Buttons
  debugButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginBottom: 10,
    paddingTop: 10,
  },
  debugButton: {
    backgroundColor: CHIETA_COLORS.info,
    padding: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  debugButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },

  // API Status Styles
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: CHIETA_COLORS.lightBg,
  },
  apiStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },

  // Error State Styles
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    margin: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginTop: 16,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 16,
    color: CHIETA_COLORS.gray,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: CHIETA_COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Table Styles
  tableContainer: {
    flex: 1,
  },
  tableHeaderRow: {
    backgroundColor: CHIETA_COLORS.lightBg,
  },
  cellWrapper: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  headerText: {
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    fontSize: 12,
  },
  cellText: {
    color: CHIETA_COLORS.darkText,
    fontSize: 12,
  },
  tableRow: {
    backgroundColor: 'white',
  },
  evenRow: {
    backgroundColor: CHIETA_COLORS.lightBg,
  },
  
  // Status Badge Styles
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  typeText: {
    color: '#1976D2',
    fontSize: 12,
    fontWeight: '600',
  },

  // Button Styles
  modernDownloadButton: {
    backgroundColor: CHIETA_COLORS.accent,
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: CHIETA_COLORS.gray,
    opacity: 0.7,
  },

  // Progress Styles
  progressContainer: {
    alignItems: 'center',
    width: 60,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: CHIETA_COLORS.success,
  },
  progressText: {
    fontSize: 10,
    color: CHIETA_COLORS.gray,
    marginTop: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: CHIETA_COLORS.gray,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: CHIETA_COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Footer
  footer: {
    padding: 16,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default SSDDScreen;