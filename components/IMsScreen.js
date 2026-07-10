import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  Dimensions,
  Image,
  Linking,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isLargeScreen = width > 768;


// CHIETA Colors
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

const IMsScreen = ({ onNavigateBack, userEmail, userRole, userData }) => {
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState('');
  const [mgWindows, setMgWindows] = useState([]);
  const [dgWindows, setDgWindows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeMgWindow, setActiveMgWindow] = useState(null);
  const [activeDgWindow, setActiveDgWindow] = useState(null);
  const [linkedOrgs, setLinkedOrgs] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [mgApplications, setMgApplications] = useState([]);
  const [dgApplications, setDgApplications] = useState([]);
  const [downloadingDoc, setDownloadingDoc] = useState(false);
  const [documentMapping, setDocumentMapping] = useState({}); // Store document IDs for MG/DG

  useEffect(() => {
    if (userEmail) {
      loadData();
    }
  }, [userEmail]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await checkApiHealth();
      
      // Fetch all data in parallel
      await Promise.all([
        fetchMGStatus(),
        fetchDGStatus(),
        fetchOrganisationApplications()
      ]);
    } catch (error) {
      console.error("Error loading IM data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if backend API is available
  const checkApiHealth = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/health`, {
        timeout: 10000
      });
      setApiStatus('online');
      console.log('✅ Backend is online:', BASE_URL);
      return true;
    } catch (error) {
      setApiStatus('offline');
      console.error('❌ Backend is offline:', error.message);
      throw new Error('Backend connection failed');
    }
  };

  // Fetch MG Status
  const fetchMGStatus = async () => {
    try {
      const url = `${BASE_URL}/mg-status`;
      console.log('📡 Fetching MG status from:', url);
      
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ MG status received:', response.data);
      
      setMgWindows(Array.isArray(response.data) ? response.data : []);
      
      // Find active MG window
      const now = new Date();
      const activeMg = response.data.find(window => {
        const start = new Date(window.startdate);
        const end = new Date(window.endDate);
        return now >= start && now <= end;
      });
      setActiveMgWindow(activeMg || null);
    } catch (error) {
      console.error("❌ Error fetching MG status:", error);
      setMgWindows([]);
      throw error;
    }
  };

  // Fetch DG Status
  const fetchDGStatus = async () => {
    try {
      const url = `${BASE_URL}/dg-status`;
      console.log('📡 Fetching DG status from:', url);
      
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ DG status received:', response.data);
      
      setDgWindows(Array.isArray(response.data) ? response.data : []);
      
      // Find active DG window
      const now = new Date();
      const activeDg = response.data.find(window => {
        const launch = new Date(window.launchDte);
        const deadline = new Date(window.deadlineTime);
        return now >= launch && now <= deadline;
      });
      setActiveDgWindow(activeDg || null);
    } catch (error) {
      console.error("❌ Error fetching DG status:", error);
      setDgWindows([]);
      throw error;
    }
  };

  // Fetch Organisation Applications
  const fetchOrganisationApplications = async () => {
    try {
      const url = `${BASE_URL}/organisation-applications/${userEmail}`;
      console.log('📡 Fetching organisation applications from:', url);
      
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ Organisation applications received:', response.data);
      
      setLinkedOrgs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("❌ Error fetching organisation applications:", error);
      setLinkedOrgs([]);
      throw error;
    }
  };

  // Fetch MG application details
  const fetchMGApplications = async (sdlNo) => {
    try {
      const url = `${BASE_URL}/mg-applications-details/${sdlNo}`;
      console.log('📡 Fetching MG applications for SDL:', sdlNo);
      
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ MG applications received:', response.data);
      
      setMgApplications(Array.isArray(response.data) ? response.data : []);
      
      // Create document mapping for MG applications
      const mapping = {};
      response.data.forEach(app => {
        if (app.Application_Number) {
          mapping[app.Application_Number] = {
            wsp: app.id, // Using application ID as document ID for WSP
            moa: app.id, // Using application ID as document ID for MOA
            awards: app.id // Using application ID as document ID for Awards
          };
        }
      });
      setDocumentMapping(prev => ({ ...prev, ...mapping }));
    } catch (error) {
      console.error('❌ Error fetching MG applications:', error);
      setMgApplications([]);
      Alert.alert('Error', 'Failed to fetch MG applications');
    }
  };

  // Fetch DG application details
  const fetchDGApplications = async (sdlNo) => {
    try {
      const url = `${BASE_URL}/dg-applications-details/${sdlNo}`;
      console.log('📡 Fetching DG applications for SDL:', sdlNo);
      
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log('✅ DG applications received:', response.data);
      
      setDgApplications(Array.isArray(response.data) ? response.data : []);
      
      // Create document mapping for DG applications
      const mapping = {};
      response.data.forEach(app => {
        if (app.Application_Number) {
          mapping[app.Application_Number] = {
            appForm: app.id, // Using application ID as document ID
            proposal: app.id, // Using application ID as document ID
            moa: app.id, // Using application ID as document ID
            awards: app.id // Using application ID as document ID
          };
        }
      });
      setDocumentMapping(prev => ({ ...prev, ...mapping }));
    } catch (error) {
      console.error('❌ Error fetching DG applications:', error);
      setDgApplications([]);
      Alert.alert('Error', 'Failed to fetch DG applications');
    }
  };

  // UPDATED: Download function using /download/:id endpoint
  const handleDownload = async (documentId, documentType, fileName) => {
    if (!documentId || downloadingDoc) return;
    
    setDownloadingDoc(true);
    
    try {
      const finalFileName = fileName || `${documentType}_${documentId}.pdf`;
      
      console.log('📥 Downloading:', {
        documentId,
        documentType,
        fileName: finalFileName
      });
      
      // Create file path for saving
      const fileUri = `${FileSystem.documentDirectory}${finalFileName}`;
      
      // Download using FileSystem
      const downloadResult = await FileSystem.downloadAsync(
        `${BASE_URL}/download/${documentId}`,
        fileUri
      );
      
      console.log('✅ Download complete:', downloadResult);
      
      // Ask user what to do with the file
      Alert.alert(
        "Download Complete",
        `${finalFileName} has been downloaded successfully!`,
        [
          {
            text: "Open File",
            onPress: () => openFile(fileUri, finalFileName)
          },
          {
            text: "Share File",
            onPress: () => shareFile(fileUri, finalFileName)
          },
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Download error:', error);
      Alert.alert(
        "Download Failed", 
        `Failed to download ${documentType} document.\n\nError: ${error.message}`,
        [{ text: "OK" }]
      );
    } finally {
      setDownloadingDoc(false);
    }
  };

  // Open downloaded file
  const openFile = async (fileUri, fileName) => {
    try {
      console.log("📂 Opening file:", fileUri);
      
      if (Platform.OS === 'ios') {
        // For iOS, use Sharing API
        await Sharing.shareAsync(fileUri);
      } else {
        // For Android, use Intent Launcher
        const contentUri = await FileSystem.getContentUriAsync(fileUri);
        await Linking.openURL(contentUri);
      }
    } catch (error) {
      console.error("❌ Error opening file:", error);
      Alert.alert(
        "Cannot Open File",
        "Try opening with another app",
        [{ text: "OK" }]
      );
    }
  };

  // Share downloaded file
  const shareFile = async (fileUri, fileName) => {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Sharing not available", "Sharing is not available on this device.");
        return;
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: getMimeType(fileName),
        dialogTitle: `Share ${fileName}`,
      });
    } catch (error) {
      console.error("❌ Error sharing file:", error);
      Alert.alert("Sharing Failed", "Could not share the file.");
    }
  };

  // Get MIME type from filename
  const getMimeType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'txt': 'text/plain'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: onNavigateBack }
      ]
    );
  };

  const handleOrgSelection = (org) => {
    setSelectedOrg(org);
    if (org.SDL_No) {
      fetchMGApplications(org.SDL_No);
      fetchDGApplications(org.SDL_No);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': 
      case 'open': 
        return { backgroundColor: CHIETA_COLORS.success, color: CHIETA_COLORS.lightText };
      case 'rejected': 
      case 'closed': 
        return { backgroundColor: CHIETA_COLORS.danger, color: CHIETA_COLORS.lightText };
      case 'pending': 
      case 'upcoming': 
        return { backgroundColor: CHIETA_COLORS.warning, color: CHIETA_COLORS.lightText };
      default: 
        return { backgroundColor: CHIETA_COLORS.gray, color: CHIETA_COLORS.lightText };
    }
  };

  const getWindowStatus = (window, type) => {
    const now = new Date();
    
    if (type === 'mg') {
      const start = new Date(window.startdate);
      const end = new Date(window.endDate);
      const extension = window.extensionDate ? new Date(window.extensionDate) : null;
      
      if (now < start) return 'UPCOMING';
      if (extension && now <= extension) return 'OPEN';
      if (now <= end) return 'OPEN';
      return 'CLOSED';
    } else {
      const launch = new Date(window.launchDte);
      const deadline = new Date(window.deadlineTime);
      
      if (now < launch) return 'UPCOMING';
      if (now <= deadline) return 'OPEN';
      return 'CLOSED';
    }
  };

  const renderApiStatus = () => {
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
        <View style={[styles.apiStatusContainer, styles.apiStatusOffline]}>
          <MaterialIcons name="error-outline" size={16} color={CHIETA_COLORS.danger} />
          <Text style={[styles.apiStatusText, { color: CHIETA_COLORS.danger }]}>
            Backend offline
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.apiStatusContainer, styles.apiStatusOnline]}>
        <MaterialIcons name="check-circle-outline" size={16} color={CHIETA_COLORS.success} />
        <Text style={[styles.apiStatusText, { color: CHIETA_COLORS.success }]}>
          Backend online
        </Text>
      </View>
    );
  };

  const handleRetryConnection = async () => {
    setLoading(true);
    setError(null);
    await loadData();
  };

  const renderConnectionError = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="cloud-off" size={64} color={CHIETA_COLORS.gray} />
      <Text style={styles.errorTitle}>Connection Issue</Text>
      <Text style={styles.errorMessage}>
        Unable to connect to the backend server.
      </Text>
      <TouchableOpacity 
        style={[styles.retryButton, { backgroundColor: CHIETA_COLORS.accent }]}
        onPress={handleRetryConnection}
      >
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );

  // Header Component
  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: CHIETA_COLORS.primary }]}>
      <View style={styles.headerTop}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../assets/images/chieta_logo.png")} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.headerUserInfo}>
            <View style={[styles.profileAvatar, { backgroundColor: CHIETA_COLORS.secondary }]}>
              <Text style={[styles.profileInitials, { color: CHIETA_COLORS.primary }]}>
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'IM'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={CHIETA_COLORS.lightText} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerBottom}>
        <Text style={[styles.headerTitle, { color: CHIETA_COLORS.lightText }]}>Information Management System</Text>
        <Text style={[styles.headerSubtitle, { color: 'rgba(255,255,255,0.8)' }]}>
          Manage mandatory and discretionary grants
        </Text>
      </View>
    </View>
  );

  // Navigation Tabs
  const renderNavigationTabs = () => (
    <View style={styles.navTabs}>
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'dashboard' && styles.navTabActive]}
        onPress={() => setActiveTab('dashboard')}
      >
        <Ionicons 
          name="grid-outline" 
          size={20} 
          color={activeTab === 'dashboard' ? CHIETA_COLORS.primary : CHIETA_COLORS.gray} 
        />
        <Text style={[styles.navTabText, activeTab === 'dashboard' && styles.navTabTextActive]}>
          Dashboard
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'mandatory' && styles.navTabActive]}
        onPress={() => setActiveTab('mandatory')}
      >
        <Ionicons 
          name="clipboard-outline" 
          size={20} 
          color={activeTab === 'mandatory' ? CHIETA_COLORS.primary : CHIETA_COLORS.gray} 
        />
        <Text style={[styles.navTabText, activeTab === 'mandatory' && styles.navTabTextActive]}>
          Mandatory
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'discretionary' && styles.navTabActive]}
        onPress={() => setActiveTab('discretionary')}
      >
        <Ionicons 
          name="calendar-outline" 
          size={20} 
          color={activeTab === 'discretionary' ? CHIETA_COLORS.primary : CHIETA_COLORS.gray} 
        />
        <Text style={[styles.navTabText, activeTab === 'discretionary' && styles.navTabTextActive]}>
          Discretionary
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.navTab, activeTab === 'organizations' && styles.navTabActive]}
        onPress={() => setActiveTab('organizations')}
      >
        <Ionicons 
          name="business-outline" 
          size={20} 
          color={activeTab === 'organizations' ? CHIETA_COLORS.primary : CHIETA_COLORS.gray} 
        />
        <Text style={[styles.navTabText, activeTab === 'organizations' && styles.navTabTextActive]}>
          Organizations
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Dashboard View
  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer}>
      {/* API Status */}
      {renderApiStatus()}

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="clipboard-outline" size={24} color={CHIETA_COLORS.info} />
          </View>
          <Text style={styles.statNumber}>{mgWindows.length}</Text>
          <Text style={styles.statLabel}>Mandatory Grants</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="calendar-outline" size={24} color={CHIETA_COLORS.success} />
          </View>
          <Text style={styles.statNumber}>{dgWindows.length}</Text>
          <Text style={styles.statLabel}>Discretionary Grants</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="business-outline" size={24} color={CHIETA_COLORS.warning} />
          </View>
          <Text style={styles.statNumber}>{linkedOrgs.length}</Text>
          <Text style={styles.statLabel}>Organizations</Text>
        </View>
      </View>

      {/* Active Grants */}
      <Text style={styles.sectionTitle}>Active Grant Windows</Text>
      
      {activeMgWindow && (
        <TouchableOpacity 
          style={[styles.grantCard, styles.activeCard]}
          onPress={() => setActiveTab('mandatory')}
        >
          <View style={styles.grantCardHeader}>
            <View style={styles.grantInfo}>
              <Ionicons name="clipboard" size={24} color={CHIETA_COLORS.success} />
              <Text style={styles.grantTitle}>Mandatory Grant</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: CHIETA_COLORS.success }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.grantDescription}>{activeMgWindow.title}</Text>
          <Text style={styles.grantDates}>
            {formatDate(activeMgWindow.startdate)} - {formatDate(activeMgWindow.endDate)}
            {activeMgWindow.extensionDate && ` (Extended: ${formatDate(activeMgWindow.extensionDate)})`}
          </Text>
        </TouchableOpacity>
      )}

      {activeDgWindow && (
        <TouchableOpacity 
          style={[styles.grantCard, styles.activeCard]}
          onPress={() => setActiveTab('discretionary')}
        >
          <View style={styles.grantCardHeader}>
            <View style={styles.grantInfo}>
              <Ionicons name="calendar" size={24} color={CHIETA_COLORS.success} />
              <Text style={styles.grantTitle}>Discretionary Grant</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: CHIETA_COLORS.success }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={styles.grantDescription}>{activeDgWindow.title}</Text>
          <Text style={styles.grantDates}>
            {formatDate(activeDgWindow.launchDte)} - {formatDate(activeDgWindow.deadlineTime)}
          </Text>
        </TouchableOpacity>
      )}

      {!activeMgWindow && !activeDgWindow && (
        <View style={styles.noDataContainer}>
          <Ionicons name="calendar-outline" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.noDataText}>No active grant windows</Text>
          <Text style={styles.noDataSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'Check back later for new grant cycles'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  // Organizations View
  const renderOrganizations = () => (
    <ScrollView style={styles.organizationsContainer}>
      <Text style={styles.sectionTitle}>Linked Organizations</Text>
      
      {linkedOrgs.length > 0 ? (
        linkedOrgs.map((org, index) => (
          <TouchableOpacity 
            key={org.SDL_No || index} 
            style={styles.orgCard}
            onPress={() => handleOrgSelection(org)}
          >
            <View style={styles.orgHeader}>
              <View style={[styles.orgAvatar, { backgroundColor: CHIETA_COLORS.primary }]}>
                <Text style={styles.orgInitials}>
                  {org.Organisation_Name?.charAt(0) || 'O'}
                </Text>
              </View>
              <View style={styles.orgInfo}>
                <Text style={styles.orgName}>{org.Organisation_Name}</Text>
                <Text style={styles.orgSdl}>SDL: {org.SDL_No}</Text>
                <Text style={styles.orgType}>{org.Organisation_Type}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusBadgeStyle(org.Approval_Status)]}>
                <Text style={styles.statusText}>{org.Approval_Status || 'Pending'}</Text>
              </View>
            </View>
            
            {/* Application Stats */}
            <View style={styles.orgStats}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>MG Applications: </Text>
                <Text style={styles.statValue}>{org.mg_applications_count || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>DG Applications: </Text>
                <Text style={styles.statValue}>{org.dg_applications_count || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Learners: </Text>
                <Text style={styles.statValue}>{org.dg_total_learners || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total Funding: </Text>
                <Text style={styles.statValue}>R {org.dg_total_funding?.toLocaleString() || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="business-outline" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.noDataText}>No organizations linked</Text>
          <Text style={styles.noDataSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No organizations found for your account'}
          </Text>
        </View>
      )}
    </ScrollView>
  );

  // Mandatory Grants View
  const renderMandatoryGrants = () => (
    <ScrollView style={styles.grantsContainer}>
      <Text style={styles.sectionTitle}>Mandatory Grants</Text>
      
      {mgWindows.length > 0 ? (
        mgWindows.map((window) => {
          const status = getWindowStatus(window, 'mg');
          return (
            <View key={window.id} style={styles.grantDetailCard}>
              <View style={styles.grantDetailHeader}>
                <Text style={styles.grantDetailTitle}>
                  {window.title}
                </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </View>
              
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Start Date: {formatDate(window.startdate)}</Text>
                <Text style={styles.dateLabel}>End Date: {formatDate(window.endDate)}</Text>
                {window.extensionDate && (
                  <Text style={styles.dateLabel}>Extension: {formatDate(window.extensionDate)}</Text>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="clipboard-outline" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.noDataText}>No mandatory grant data</Text>
          <Text style={styles.noDataSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No mandatory grant windows available'}
          </Text>
        </View>
      )}

      {/* MG Applications for Selected Organization */}
      {selectedOrg && mgApplications.length > 0 && (
        <View style={styles.applicationsSection}>
          <Text style={styles.sectionTitle}>MG Applications for {selectedOrg.Organisation_Name}</Text>
          {mgApplications.map((app) => {
            const appId = app.id; // Use application ID for downloads
            return (
              <View key={app.id} style={styles.applicationCard}>
                <Text style={styles.appNumber}>{app.Application_Number}</Text>
                <Text style={styles.appTitle}>{app.Application_Title}</Text>
                
                <View style={styles.documentStatus}>
                  <Text style={styles.docStatusLabel}>WSP: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.WSP_Approval_Status)]}>
                    <Text style={styles.statusText}>{app.WSP_Approval_Status || 'Pending'}</Text>
                  </View>
                  
                  <Text style={styles.docStatusLabel}>MOA: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.MOA_Status)]}>
                    <Text style={styles.statusText}>{app.MOA_Status || 'Pending'}</Text>
                  </View>
                  
                  <Text style={styles.docStatusLabel}>Awards: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.Awards_Letter_Status)]}>
                    <Text style={styles.statusText}>{app.Awards_Letter_Status || 'Pending'}</Text>
                  </View>
                </View>

                <View style={styles.documentActions}>
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "WSP", `${app.Application_Number}_WSP.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>WSP</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "MOA", `${app.Application_Number}_MOA.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>MOA</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "Awards", `${app.Application_Number}_Awards.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>Awards</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  // Discretionary Grants View
  const renderDiscretionaryGrants = () => (
    <ScrollView style={styles.grantsContainer}>
      <Text style={styles.sectionTitle}>Discretionary Grants</Text>
      
      {dgWindows.length > 0 ? (
        dgWindows.map((window) => {
          const status = getWindowStatus(window, 'dg');
          return (
            <View key={window.id} style={styles.grantDetailCard}>
              <View style={styles.grantDetailHeader}>
                <Text style={styles.grantDetailTitle}>
                  {window.title}
                </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </View>
              
              <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Launch: {formatDate(window.launchDte)}</Text>
                <Text style={styles.dateLabel}>Deadline: {formatDate(window.deadlineTime)}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="calendar-outline" size={48} color={CHIETA_COLORS.gray} />
          <Text style={styles.noDataText}>No discretionary grant data</Text>
          <Text style={styles.noDataSubtext}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No discretionary grant windows available'}
          </Text>
        </View>
      )}

      {/* DG Applications for Selected Organization */}
      {selectedOrg && dgApplications.length > 0 && (
        <View style={styles.applicationsSection}>
          <Text style={styles.sectionTitle}>DG Applications for {selectedOrg.Organisation_Name}</Text>
          {dgApplications.map((app) => {
            const appId = app.id; // Use application ID for downloads
            return (
              <View key={app.id} style={styles.applicationCard}>
                <Text style={styles.appNumber}>{app.Application_Number}</Text>
                <Text style={styles.appTitle}>{app.Application_Title}</Text>
                <Text style={styles.projectInfo}>
                  {app.Number_Of_Learners} learners • R {app.Total_Funding_Amount?.toLocaleString()}
                </Text>
                
                <View style={styles.documentStatus}>
                  <Text style={styles.docStatusLabel}>Application: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.Application_Form_Status)]}>
                    <Text style={styles.statusText}>{app.Application_Form_Status || 'Pending'}</Text>
                  </View>
                  
                  <Text style={styles.docStatusLabel}>Proposal: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.Proposal_Status)]}>
                    <Text style={styles.statusText}>{app.Proposal_Status || 'Pending'}</Text>
                  </View>
                  
                  <Text style={styles.docStatusLabel}>MOA: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.MOA_Status)]}>
                    <Text style={styles.statusText}>{app.MOA_Status || 'Pending'}</Text>
                  </View>
                  
                  <Text style={styles.docStatusLabel}>Awards: </Text>
                  <View style={[styles.statusBadge, getStatusBadgeStyle(app.Awards_Letter_Status)]}>
                    <Text style={styles.statusText}>{app.Awards_Letter_Status || 'Pending'}</Text>
                  </View>
                </View>

                <View style={styles.documentActions}>
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "Application", `${app.Application_Number}_Application.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>Application</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "Proposal", `${app.Application_Number}_Proposal.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>Proposal</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "MOA", `${app.Application_Number}_MOA.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>MOA</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.downloadButton, downloadingDoc && styles.disabledButton]}
                    onPress={() => handleDownload(appId, "Awards", `${app.Application_Number}_Awards.pdf`)}
                    disabled={downloadingDoc}
                  >
                    {downloadingDoc ? (
                      <ActivityIndicator size="small" color={CHIETA_COLORS.primary} />
                    ) : (
                      <>
                        <Ionicons name="download-outline" size={16} color={CHIETA_COLORS.primary} />
                        <Text style={styles.downloadButtonText}>Awards</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );

  // Main Content Renderer
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={CHIETA_COLORS.accent} />
          <Text style={styles.loadingText}>Loading IM data...</Text>
        </View>
      );
    }

    // Show connection error if API is offline and no data
    if (apiStatus === 'offline' && mgWindows.length === 0 && dgWindows.length === 0 && linkedOrgs.length === 0) {
      return renderConnectionError();
    }

    // Show general error
    if (error && mgWindows.length === 0 && dgWindows.length === 0 && linkedOrgs.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={CHIETA_COLORS.danger} />
          <Text style={styles.errorTitle}>Data Loading Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: CHIETA_COLORS.accent }]}
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'mandatory':
        return renderMandatoryGrants();
      case 'discretionary':
        return renderDiscretionaryGrants();
      case 'organizations':
        return renderOrganizations();
      default:
        return renderDashboard();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={CHIETA_COLORS.primary} />
      {renderHeader()}
      {renderNavigationTabs()}
      {renderContent()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CHIETA_COLORS.lightBg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    padding: 6,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  headerUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileInitials: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navTabActive: {
    backgroundColor: '#F3F4F6',
  },
  navTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: CHIETA_COLORS.gray,
    marginTop: 4,
  },
  navTabTextActive: {
    color: CHIETA_COLORS.primary,
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  apiStatusOnline: {
    borderLeftWidth: 4,
    borderLeftColor: CHIETA_COLORS.success,
  },
  apiStatusOffline: {
    borderLeftWidth: 4,
    borderLeftColor: CHIETA_COLORS.danger,
  },
  apiStatusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginBottom: 16,
  },
  grantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: CHIETA_COLORS.success,
  },
  grantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  grantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  grantTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginLeft: 8,
  },
  grantDescription: {
    fontSize: 14,
    color: CHIETA_COLORS.gray,
    marginBottom: 8,
    lineHeight: 20,
  },
  grantDates: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  organizationsContainer: {
    flex: 1,
    padding: 20,
  },
  orgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  orgInitials: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    marginBottom: 2,
  },
  orgSdl: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
  },
  orgType: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
    fontStyle: 'italic',
  },
  orgStats: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: CHIETA_COLORS.darkText,
  },
  grantsContainer: {
    flex: 1,
    padding: 20,
  },
  grantDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  grantDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  grantDetailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CHIETA_COLORS.darkText,
    flex: 1,
  },
  dateInfo: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
    marginBottom: 2,
  },
  applicationsSection: {
    marginTop: 24,
  },
  applicationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: CHIETA_COLORS.primary,
  },
  appNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: CHIETA_COLORS.primary,
    marginBottom: 4,
  },
  appTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CHIETA_COLORS.darkText,
    marginBottom: 4,
  },
  projectInfo: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
    marginBottom: 8,
  },
  documentStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  docStatusLabel: {
    fontSize: 12,
    color: CHIETA_COLORS.gray,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
  },
  disabledButton: {
    opacity: 0.5,
  },
  downloadButtonText: {
    color: CHIETA_COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: CHIETA_COLORS.gray,
    fontWeight: '500',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 16,
    color: CHIETA_COLORS.gray,
    fontSize: 16,
    fontWeight: '500',
  },
  noDataSubtext: {
    fontSize: 14,
    color: CHIETA_COLORS.gray,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default IMsScreen;