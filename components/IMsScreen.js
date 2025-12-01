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
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import API_CONFIG, { ENDPOINTS } from "../config";

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isLargeScreen = width > 768;

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
      const config = API_CONFIG();
      const url = config.buildHealthURL ? config.buildHealthURL() : `${config.BASE_URL}${ENDPOINTS.HEALTH}`;
      
      console.log('📡 Checking API health:', url);
      const response = await fetch(url, { timeout: 10000 });
      setApiStatus('online');
      console.log('✅ Backend is online:', config.BASE_URL);
      return true;
    } catch (error) {
      setApiStatus('offline');
      console.error('❌ Backend is offline:', error.message);
      throw new Error('Backend connection failed');
    }
  };

  // Fetch MG Status using config buildURL method
  const fetchMGStatus = async () => {
    try {
      const config = API_CONFIG();
      const url = config.buildMGStatusURL ? config.buildMGStatusURL() : `${config.BASE_URL}${ENDPOINTS.MG_STATUS}`;
      
      console.log('📡 Fetching MG status from:', url);
      const response = await fetch(url, { timeout: 15000 });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const mgData = await response.json();
      console.log('✅ MG status received:', mgData);
      
      setMgWindows(Array.isArray(mgData) ? mgData : []);
      
      // Find active MG window
      const now = new Date();
      const activeMg = mgData.find(window => {
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

  // Fetch DG Status using config buildURL method
  const fetchDGStatus = async () => {
    try {
      const config = API_CONFIG();
      const url = config.buildDGStatusURL ? config.buildDGStatusURL() : `${config.BASE_URL}${ENDPOINTS.DG_STATUS}`;
      
      console.log('📡 Fetching DG status from:', url);
      const response = await fetch(url, { timeout: 15000 });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const dgData = await response.json();
      console.log('✅ DG status received:', dgData);
      
      setDgWindows(Array.isArray(dgData) ? dgData : []);
      
      // Find active DG window
      const now = new Date();
      const activeDg = dgData.find(window => {
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

  // Fetch Organisation Applications using config buildURL method
  const fetchOrganisationApplications = async () => {
    try {
      const config = API_CONFIG();
      const url = config.buildOrganisationApplicationsURL ? 
        config.buildOrganisationApplicationsURL(userEmail) : 
        `${config.BASE_URL}${ENDPOINTS.ORGANISATION_APPLICATIONS}/${userEmail}`;
      
      console.log('📡 Fetching organisation applications from:', url);
      const response = await fetch(url, { timeout: 15000 });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const orgData = await response.json();
      console.log('✅ Organisation applications received:', orgData);
      
      setLinkedOrgs(Array.isArray(orgData) ? orgData : []);
    } catch (error) {
      console.error("❌ Error fetching organisation applications:", error);
      setLinkedOrgs([]);
      throw error;
    }
  };

  // Fetch MG application details using config buildURL method
  const fetchMGApplications = async (sdlNo) => {
    try {
      const config = API_CONFIG();
      const url = config.buildMGApplicationsDetailsURL ? 
        config.buildMGApplicationsDetailsURL(sdlNo) : 
        `${config.BASE_URL}${ENDPOINTS.MG_APPLICATIONS_DETAILS}/${sdlNo}`;
      
      console.log('📡 Fetching MG applications for SDL:', sdlNo);
      const response = await fetch(url, { timeout: 15000 });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ MG applications received:', data);
      
      setMgApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching MG applications:', error);
      setMgApplications([]);
      Alert.alert('Error', 'Failed to fetch MG applications');
    }
  };

  // Fetch DG application details using config buildURL method
  const fetchDGApplications = async (sdlNo) => {
    try {
      const config = API_CONFIG();
      const url = config.buildDGApplicationsDetailsURL ? 
        config.buildDGApplicationsDetailsURL(sdlNo) : 
        `${config.BASE_URL}${ENDPOINTS.DG_APPLICATIONS_DETAILS}/${sdlNo}`;
      
      console.log('📡 Fetching DG applications for SDL:', sdlNo);
      const response = await fetch(url, { timeout: 15000 });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ DG applications received:', data);
      
      setDgApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('❌ Error fetching DG applications:', error);
      setDgApplications([]);
      Alert.alert('Error', 'Failed to fetch DG applications');
    }
  };

  // Handle document download using config buildURL method
  const handleDownloadDocument = async (applicationNumber, documentType) => {
    try {
      const config = API_CONFIG();
      const url = config.buildDownloadDocumentURL ? 
        config.buildDownloadDocumentURL(applicationNumber, documentType) : 
        `${config.BASE_URL}${ENDPOINTS.DOWNLOAD_DOCUMENT}/${applicationNumber}/${documentType}`;
      
      console.log('📡 Downloading document:', url);
      const response = await fetch(url, { timeout: 15000 });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success) {
          Alert.alert(
            "Download Ready",
            `${result.documentType} for ${result.applicationNumber} is ready for download.`,
            [{ text: "OK" }]
          );
          
          console.log('✅ File path:', result.filePath);
        } else {
          Alert.alert('Error', result.error || 'Failed to prepare download');
        }
      } else {
        Alert.alert('Error', 'Failed to prepare document download');
      }
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      Alert.alert('Error', 'Failed to download document');
    }
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
        return { backgroundColor: '#10B981', color: '#FFFFFF' };
      case 'rejected': 
      case 'closed': 
        return { backgroundColor: '#EF4444', color: '#FFFFFF' };
      case 'pending': 
      case 'upcoming': 
        return { backgroundColor: '#F59E0B', color: '#FFFFFF' };
      default: 
        return { backgroundColor: '#6B7280', color: '#FFFFFF' };
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
    const config = API_CONFIG();
    
    if (apiStatus === 'checking') {
      return (
        <View style={styles.apiStatusContainer}>
          <ActivityIndicator size="small" color="#FF8F00" />
          <Text style={styles.apiStatusText}>Checking backend connection...</Text>
        </View>
      );
    }
    
    if (apiStatus === 'offline') {
      return (
        <View style={[styles.apiStatusContainer, styles.apiStatusOffline]}>
          <MaterialIcons name="error-outline" size={16} color="#F44336" />
          <Text style={[styles.apiStatusText, styles.apiStatusTextOffline]}>
            Backend offline - using: {config.BASE_URL}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={[styles.apiStatusContainer, styles.apiStatusOnline]}>
        <MaterialIcons name="check-circle-outline" size={16} color="#4CAF50" />
        <Text style={[styles.apiStatusText, styles.apiStatusTextOnline]}>
          Backend online - {config.BASE_URL.replace('https://', '').replace('http://', '')}
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
      <MaterialIcons name="cloud-off" size={64} color="#6B7280" />
      <Text style={styles.errorTitle}>Connection Issue</Text>
      <Text style={styles.errorMessage}>
        Unable to connect to the backend server. Please check:
      </Text>
      <View style={styles.tipsContainer}>
        <Text style={styles.tip}>• Ensure backend is running</Text>
        <Text style={styles.tip}>• Check your internet connection</Text>
        <Text style={styles.tip}>• Verify the API URL in config</Text>
      </View>
      <TouchableOpacity 
        style={styles.retryButton}
        onPress={handleRetryConnection}
      >
        <Text style={styles.retryButtonText}>Retry Connection</Text>
      </TouchableOpacity>
    </View>
  );

  const renderDataCount = () => {
    const counts = {
      mgWindows: mgWindows.length,
      dgWindows: dgWindows.length,
      organizations: linkedOrgs.length
    };
    
    return (
      <View style={styles.dataCountContainer}>
        <Text style={styles.dataCountText}>
          Data: {counts.mgWindows} MG windows, {counts.dgWindows} DG windows, {counts.organizations} organizations
        </Text>
      </View>
    );
  };

  // Header Component with Chieta Logo
  const renderHeader = () => (
    <View style={styles.header}>
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
            <View style={styles.profileAvatar}>
              <Text style={styles.profileInitials}>
                {userEmail ? userEmail.charAt(0).toUpperCase() : 'IM'}
              </Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {userData?.name || 'Implementation Manager'}
              </Text>
              <Text style={styles.userEmail}>{userEmail}</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.logoutButton,
            isSmallScreen && styles.smallLogoutButton,
            isLargeScreen && styles.largeLogoutButton
          ]} 
          onPress={handleLogout}
        >
          <Ionicons 
            name="log-out-outline" 
            size={isSmallScreen ? 16 : 20} 
            color="#FFFFFF" 
          />
          {!isSmallScreen && (
            <Text style={styles.logoutText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.headerBottom}>
        <Text style={styles.headerTitle}>Implementation Manager System</Text>
        <Text style={styles.headerSubtitle}>
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
          size={isSmallScreen ? 18 : 20} 
          color={activeTab === 'dashboard' ? '#3A0A53' : '#6B7280'} 
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
          size={isSmallScreen ? 18 : 20} 
          color={activeTab === 'mandatory' ? '#3A0A53' : '#6B7280'} 
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
          size={isSmallScreen ? 18 : 20} 
          color={activeTab === 'discretionary' ? '#3A0A53' : '#6B7280'} 
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
          size={isSmallScreen ? 18 : 20} 
          color={activeTab === 'organizations' ? '#3A0A53' : '#6B7280'} 
        />
        <Text style={[styles.navTabText, activeTab === 'organizations' && styles.navTabTextActive]}>
          Organizations
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Dashboard View
  const renderDashboard = () => (
    <View style={styles.dashboardContainer}>
      {/* API Status and Data Count */}
      <View style={styles.apiStatusCard}>
        {renderApiStatus()}
        {renderDataCount()}
      </View>

      {/* Quick Stats */}
      <View style={[
        styles.statsContainer,
        isSmallScreen && styles.smallStatsContainer
      ]}>
        <View style={[
          styles.statCard,
          isSmallScreen && styles.smallStatCard
        ]}>
          <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="clipboard-outline" size={isSmallScreen ? 20 : 24} color="#3B82F6" />
          </View>
          <Text style={[
            styles.statNumber,
            isSmallScreen && styles.smallStatNumber
          ]}>{mgWindows.length}</Text>
          <Text style={[
            styles.statLabel,
            isSmallScreen && styles.smallStatLabel
          ]}>Mandatory Grants</Text>
        </View>
        
        <View style={[
          styles.statCard,
          isSmallScreen && styles.smallStatCard
        ]}>
          <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="calendar-outline" size={isSmallScreen ? 20 : 24} color="#10B981" />
          </View>
          <Text style={[
            styles.statNumber,
            isSmallScreen && styles.smallStatNumber
          ]}>{dgWindows.length}</Text>
          <Text style={[
            styles.statLabel,
            isSmallScreen && styles.smallStatLabel
          ]}>Discretionary Grants</Text>
        </View>
        
        <View style={[
          styles.statCard,
          isSmallScreen && styles.smallStatCard
        ]}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="business-outline" size={isSmallScreen ? 20 : 24} color="#F59E0B" />
          </View>
          <Text style={[
            styles.statNumber,
            isSmallScreen && styles.smallStatNumber
          ]}>{linkedOrgs.length}</Text>
          <Text style={[
            styles.statLabel,
            isSmallScreen && styles.smallStatLabel
          ]}>Organizations</Text>
        </View>
      </View>

      {/* Active Grants */}
      <Text style={[
        styles.sectionTitle,
        isSmallScreen && styles.smallSectionTitle
      ]}>Active Grant Windows</Text>
      
      {activeMgWindow && (
        <TouchableOpacity 
          style={[styles.grantCard, styles.activeCard]}
          onPress={() => setActiveTab('mandatory')}
        >
          <View style={styles.grantCardHeader}>
            <View style={styles.grantInfo}>
              <Ionicons name="clipboard" size={isSmallScreen ? 20 : 24} color="#10B981" />
              <Text style={[
                styles.grantTitle,
                isSmallScreen && styles.smallGrantTitle
              ]}>Mandatory Grant</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={[
            styles.grantDescription,
            isSmallScreen && styles.smallGrantDescription
          ]}>{activeMgWindow.title}</Text>
          <Text style={[
            styles.grantDates,
            isSmallScreen && styles.smallGrantDates
          ]}>
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
              <Ionicons name="calendar" size={isSmallScreen ? 20 : 24} color="#10B981" />
              <Text style={[
                styles.grantTitle,
                isSmallScreen && styles.smallGrantTitle
              ]}>Discretionary Grant</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.statusText}>ACTIVE</Text>
            </View>
          </View>
          <Text style={[
            styles.grantDescription,
            isSmallScreen && styles.smallGrantDescription
          ]}>{activeDgWindow.title}</Text>
          <Text style={[
            styles.grantDates,
            isSmallScreen && styles.smallGrantDates
          ]}>
            {formatDate(activeDgWindow.launchDte)} - {formatDate(activeDgWindow.deadlineTime)}
          </Text>
        </TouchableOpacity>
      )}

      {!activeMgWindow && !activeDgWindow && (
        <View style={styles.noDataContainer}>
          <Ionicons name="calendar-outline" size={isSmallScreen ? 36 : 48} color="#6B7280" />
          <Text style={[
            styles.noDataText,
            isSmallScreen && styles.smallNoDataText
          ]}>No active grant windows</Text>
          <Text style={[
            styles.noDataSubtext,
            isSmallScreen && styles.smallNoDataSubtext
          ]}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'Check back later for new grant cycles'}
          </Text>
        </View>
      )}
    </View>
  );

  // Organizations View
  const renderOrganizations = () => (
    <View style={styles.organizationsContainer}>
      <Text style={[
        styles.sectionTitle,
        isSmallScreen && styles.smallSectionTitle
      ]}>Linked Organizations</Text>
      
      {linkedOrgs.length > 0 ? (
        linkedOrgs.map((org, index) => (
          <TouchableOpacity 
            key={org.SDL_No || index} 
            style={styles.orgCard}
            onPress={() => handleOrgSelection(org)}
          >
            <View style={styles.orgHeader}>
              <View style={styles.orgAvatar}>
                <Text style={styles.orgInitials}>
                  {org.Organisation_Name?.charAt(0) || 'O'}
                </Text>
              </View>
              <View style={styles.orgInfo}>
                <Text style={[
                  styles.orgName,
                  isSmallScreen && styles.smallOrgName
                ]}>{org.Organisation_Name}</Text>
                <Text style={[
                  styles.orgSdl,
                  isSmallScreen && styles.smallOrgSdl
                ]}>SDL: {org.SDL_No}</Text>
                <Text style={[
                  styles.orgType,
                  isSmallScreen && styles.smallOrgType
                ]}>{org.Organisation_Type}</Text>
              </View>
              <View style={[styles.statusBadge, getStatusBadgeStyle(org.Approval_Status)]}>
                <Text style={styles.statusText}>{org.Approval_Status || 'Pending'}</Text>
              </View>
            </View>
            
            {/* Application Stats */}
            <View style={styles.orgStats}>
              <View style={styles.statRow}>
                <Text style={[
                  styles.statLabel,
                  isSmallScreen && styles.smallStatLabel
                ]}>MG Applications: </Text>
                <Text style={[
                  styles.statValue,
                  isSmallScreen && styles.smallStatValue
                ]}>{org.mg_applications_count || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[
                  styles.statLabel,
                  isSmallScreen && styles.smallStatLabel
                ]}>DG Applications: </Text>
                <Text style={[
                  styles.statValue,
                  isSmallScreen && styles.smallStatValue
                ]}>{org.dg_applications_count || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[
                  styles.statLabel,
                  isSmallScreen && styles.smallStatLabel
                ]}>Total Learners: </Text>
                <Text style={[
                  styles.statValue,
                  isSmallScreen && styles.smallStatValue
                ]}>{org.dg_total_learners || 0}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[
                  styles.statLabel,
                  isSmallScreen && styles.smallStatLabel
                ]}>Total Funding: </Text>
                <Text style={[
                  styles.statValue,
                  isSmallScreen && styles.smallStatValue
                ]}>R {org.dg_total_funding?.toLocaleString() || 0}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="business-outline" size={isSmallScreen ? 36 : 48} color="#6B7280" />
          <Text style={[
            styles.noDataText,
            isSmallScreen && styles.smallNoDataText
          ]}>No organizations linked</Text>
          <Text style={[
            styles.noDataSubtext,
            isSmallScreen && styles.smallNoDataSubtext
          ]}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No organizations found for your account'}
          </Text>
        </View>
      )}
    </View>
  );

  // Mandatory Grants View
  const renderMandatoryGrants = () => (
    <View style={styles.grantsContainer}>
      <Text style={[
        styles.sectionTitle,
        isSmallScreen && styles.smallSectionTitle
      ]}>Mandatory Grants</Text>
      
      {mgWindows.length > 0 ? (
        mgWindows.map((window) => {
          const status = getWindowStatus(window, 'mg');
          return (
            <View key={window.id} style={styles.grantDetailCard}>
              <View style={styles.grantDetailHeader}>
                <Text style={[
                  styles.grantDetailTitle,
                  isSmallScreen && styles.smallGrantDetailTitle
                ]}>
                  {window.title}
                </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </View>
              
              <View style={styles.dateInfo}>
                <Text style={[
                  styles.dateLabel,
                  isSmallScreen && styles.smallDateLabel
                ]}>Start Date: {formatDate(window.startdate)}</Text>
                <Text style={[
                  styles.dateLabel,
                  isSmallScreen && styles.smallDateLabel
                ]}>End Date: {formatDate(window.endDate)}</Text>
                {window.extensionDate && (
                  <Text style={[
                    styles.dateLabel,
                    isSmallScreen && styles.smallDateLabel
                  ]}>Extension: {formatDate(window.extensionDate)}</Text>
                )}
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="clipboard-outline" size={isSmallScreen ? 36 : 48} color="#6B7280" />
          <Text style={[
            styles.noDataText,
            isSmallScreen && styles.smallNoDataText
          ]}>No mandatory grant data</Text>
          <Text style={[
            styles.noDataSubtext,
            isSmallScreen && styles.smallNoDataSubtext
          ]}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No mandatory grant windows available'}
          </Text>
        </View>
      )}

      {/* MG Applications for Selected Organization */}
      {selectedOrg && mgApplications.length > 0 && (
        <View style={styles.applicationsSection}>
          <Text style={[
            styles.sectionTitle,
            isSmallScreen && styles.smallSectionTitle
          ]}>MG Applications for {selectedOrg.Organisation_Name}</Text>
          {mgApplications.map((app) => (
            <View key={app.id} style={styles.applicationCard}>
              <Text style={[
                styles.appNumber,
                isSmallScreen && styles.smallAppNumber
              ]}>{app.Application_Number}</Text>
              <Text style={[
                styles.appTitle,
                isSmallScreen && styles.smallAppTitle
              ]}>{app.Application_Title}</Text>
              
              <View style={styles.documentStatus}>
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>WSP: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.WSP_Approval_Status)]}>
                  <Text style={styles.statusText}>{app.WSP_Approval_Status || 'Pending'}</Text>
                </View>
                
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>MOA: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.MOA_Status)]}>
                  <Text style={styles.statusText}>{app.MOA_Status || 'Pending'}</Text>
                </View>
                
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>Awards: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.Awards_Letter_Status)]}>
                  <Text style={styles.statusText}>{app.Awards_Letter_Status || 'Pending'}</Text>
                </View>
              </View>

              <View style={styles.documentActions}>
                {app.WSP_File_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'wsp')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>WSP</Text>
                  </TouchableOpacity>
                )}
                
                {app.MOA_File_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'moa')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>MOA</Text>
                  </TouchableOpacity>
                )}
                
                {app.Awards_Letter_File_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'awards_letter')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>Awards</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Discretionary Grants View
  const renderDiscretionaryGrants = () => (
    <View style={styles.grantsContainer}>
      <Text style={[
        styles.sectionTitle,
        isSmallScreen && styles.smallSectionTitle
      ]}>Discretionary Grants</Text>
      
      {dgWindows.length > 0 ? (
        dgWindows.map((window) => {
          const status = getWindowStatus(window, 'dg');
          return (
            <View key={window.id} style={styles.grantDetailCard}>
              <View style={styles.grantDetailHeader}>
                <Text style={[
                  styles.grantDetailTitle,
                  isSmallScreen && styles.smallGrantDetailTitle
                ]}>
                  {window.title}
                </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(status)]}>
                  <Text style={styles.statusText}>{status}</Text>
                </View>
              </View>
              
              <View style={styles.dateInfo}>
                <Text style={[
                  styles.dateLabel,
                  isSmallScreen && styles.smallDateLabel
                ]}>Launch: {formatDate(window.launchDte)}</Text>
                <Text style={[
                  styles.dateLabel,
                  isSmallScreen && styles.smallDateLabel
                ]}>Deadline: {formatDate(window.deadlineTime)}</Text>
              </View>
            </View>
          );
        })
      ) : (
        <View style={styles.noDataContainer}>
          <Ionicons name="calendar-outline" size={isSmallScreen ? 36 : 48} color="#6B7280" />
          <Text style={[
            styles.noDataText,
            isSmallScreen && styles.smallNoDataText
          ]}>No discretionary grant data</Text>
          <Text style={[
            styles.noDataSubtext,
            isSmallScreen && styles.smallNoDataSubtext
          ]}>
            {apiStatus === 'offline' ? 'Backend connection required' : 'No discretionary grant windows available'}
          </Text>
        </View>
      )}

      {/* DG Applications for Selected Organization */}
      {selectedOrg && dgApplications.length > 0 && (
        <View style={styles.applicationsSection}>
          <Text style={[
            styles.sectionTitle,
            isSmallScreen && styles.smallSectionTitle
          ]}>DG Applications for {selectedOrg.Organisation_Name}</Text>
          {dgApplications.map((app) => (
            <View key={app.id} style={styles.applicationCard}>
              <Text style={[
                styles.appNumber,
                isSmallScreen && styles.smallAppNumber
              ]}>{app.Application_Number}</Text>
              <Text style={[
                styles.appTitle,
                isSmallScreen && styles.smallAppTitle
              ]}>{app.Application_Title}</Text>
              <Text style={[
                styles.projectInfo,
                isSmallScreen && styles.smallProjectInfo
              ]}>
                {app.Number_Of_Learners} learners • R {app.Total_Funding_Amount?.toLocaleString()}
              </Text>
              
              <View style={styles.documentStatus}>
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>Application: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.Application_Form_Status)]}>
                  <Text style={styles.statusText}>{app.Application_Form_Status || 'Pending'}</Text>
                </View>
                
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>Proposal: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.Proposal_Status)]}>
                  <Text style={styles.statusText}>{app.Proposal_Status || 'Pending'}</Text>
                </View>
                
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>MOA: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.MOA_Status)]}>
                  <Text style={styles.statusText}>{app.MOA_Status || 'Pending'}</Text>
                </View>
                
                <Text style={[
                  styles.docStatusLabel,
                  isSmallScreen && styles.smallDocStatusLabel
                ]}>Awards: </Text>
                <View style={[styles.statusBadge, getStatusBadgeStyle(app.Awards_Letter_Status)]}>
                  <Text style={styles.statusText}>{app.Awards_Letter_Status || 'Pending'}</Text>
                </View>
              </View>

              <View style={styles.documentActions}>
                {app.Application_Form_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'application_form')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>Application</Text>
                  </TouchableOpacity>
                )}
                
                {app.Proposal_Document_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'proposal')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>Proposal</Text>
                  </TouchableOpacity>
                )}
                
                {app.MOA_File_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'moa')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>MOA</Text>
                  </TouchableOpacity>
                )}
                
                {app.Awards_Letter_File_Path && (
                  <TouchableOpacity 
                    style={[
                      styles.downloadButton,
                      isSmallScreen && styles.smallDownloadButton
                    ]}
                    onPress={() => handleDownloadDocument(app.Application_Number, 'awards_letter')}
                  >
                    <Ionicons name="download-outline" size={isSmallScreen ? 14 : 16} color="#3A0A53" />
                    <Text style={[
                      styles.downloadButtonText,
                      isSmallScreen && styles.smallDownloadButtonText
                    ]}>Awards</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Main Content Renderer
  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3A0A53" />
          <Text style={styles.loadingText}>Loading IM data...</Text>
          {apiStatus === 'offline' && (
            <Text style={styles.offlineText}>Backend connection issue detected</Text>
          )}
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
          <MaterialIcons name="error-outline" size={64} color="#F44336" />
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
    <View style={styles.container}>
      {renderHeader()}
      {renderNavigationTabs()}
      
      <ScrollView 
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

// Updated Styles with Responsive Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#3A0A53',
    paddingHorizontal: isSmallScreen ? 16 : 20,
    paddingTop: isSmallScreen ? 45 : 50,
    paddingBottom: isSmallScreen ? 16 : 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: isSmallScreen ? 12 : 15,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoContainer: {
    width: isSmallScreen ? 40 : 50,
    height: isSmallScreen ? 40 : 50,
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallScreen ? 8 : 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 12 : 15,
    padding: isSmallScreen ? 4 : 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: '#F7B844',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 10 : 12,
  },
  profileInitials: {
    color: '#3A0A53',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
  },
  userEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: isSmallScreen ? 10 : 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: isSmallScreen ? 10 : 12,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 8,
    minWidth: isSmallScreen ? 40 : 'auto',
    justifyContent: 'center',
  },
  smallLogoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  largeLogoutButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 11 : 12,
    fontWeight: '600',
    marginLeft: isSmallScreen ? 2 : 4,
  },
  headerBottom: {
    marginTop: isSmallScreen ? 8 : 10,
  },
  headerTitle: {
    color: '#F7B844',
    fontSize: isSmallScreen ? 18 : 24,
    fontWeight: 'bold',
    marginBottom: isSmallScreen ? 2 : 4,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: isSmallScreen ? 12 : 14,
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: isSmallScreen ? 12 : 20,
    paddingVertical: isSmallScreen ? 6 : 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: isSmallScreen ? 6 : 8,
    borderRadius: 8,
    marginHorizontal: isSmallScreen ? 2 : 4,
  },
  navTabActive: {
    backgroundColor: '#F3F4F6',
  },
  navTabText: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: isSmallScreen ? 2 : 4,
  },
  navTabTextActive: {
    color: '#3A0A53',
  },
  contentScroll: {
    flex: 1,
  },
  dashboardContainer: {
    padding: isSmallScreen ? 16 : 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 20 : 24,
  },
  smallStatsContainer: {
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: isSmallScreen ? 2 : 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  smallStatCard: {
    padding: 10,
  },
  statIcon: {
    width: isSmallScreen ? 32 : 40,
    height: isSmallScreen ? 32 : 40,
    borderRadius: isSmallScreen ? 16 : 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  statNumber: {
    fontSize: isSmallScreen ? 16 : 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: isSmallScreen ? 2 : 4,
  },
  smallStatNumber: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  smallStatLabel: {
    fontSize: 9,
  },
  sectionTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: isSmallScreen ? 12 : 16,
  },
  smallSectionTitle: {
    fontSize: 16,
  },
  grantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  grantCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  grantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  grantTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: isSmallScreen ? 6 : 8,
  },
  smallGrantTitle: {
    fontSize: 13,
  },
  grantDescription: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6B7280',
    marginBottom: isSmallScreen ? 6 : 8,
    lineHeight: isSmallScreen ? 18 : 20,
  },
  smallGrantDescription: {
    fontSize: 11,
    lineHeight: 16,
  },
  grantDates: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  smallGrantDates: {
    fontSize: 9,
  },
  statusBadge: {
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 3 : 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: isSmallScreen ? 8 : 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  organizationsContainer: {
    padding: isSmallScreen ? 16 : 20,
  },
  orgCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 10 : 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
  },
  orgAvatar: {
    width: isSmallScreen ? 36 : 40,
    height: isSmallScreen ? 36 : 40,
    borderRadius: isSmallScreen ? 18 : 20,
    backgroundColor: '#3A0A53',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: isSmallScreen ? 10 : 12,
  },
  orgInitials: {
    color: '#FFFFFF',
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  smallOrgName: {
    fontSize: 13,
  },
  orgSdl: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
  },
  smallOrgSdl: {
    fontSize: 9,
  },
  orgType: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  smallOrgType: {
    fontSize: 9,
  },
  orgStats: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: isSmallScreen ? 10 : 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: isSmallScreen ? 3 : 4,
  },
  statValue: {
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  smallStatValue: {
    fontSize: 9,
  },
  grantsContainer: {
    padding: isSmallScreen ? 16 : 20,
  },
  grantDetailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
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
    marginBottom: isSmallScreen ? 10 : 12,
  },
  grantDetailTitle: {
    fontSize: isSmallScreen ? 16 : 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  smallGrantDetailTitle: {
    fontSize: 14,
  },
  dateInfo: {
    marginBottom: isSmallScreen ? 6 : 8,
  },
  dateLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
    marginBottom: isSmallScreen ? 1 : 2,
  },
  smallDateLabel: {
    fontSize: 9,
  },
  applicationsSection: {
    marginTop: isSmallScreen ? 20 : 24,
  },
  applicationCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: isSmallScreen ? 10 : 12,
    marginBottom: isSmallScreen ? 10 : 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3A0A53',
  },
  appNumber: {
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: 'bold',
    color: '#3A0A53',
    marginBottom: 4,
  },
  smallAppNumber: {
    fontSize: 11,
  },
  appTitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  smallAppTitle: {
    fontSize: 13,
  },
  projectInfo: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
    marginBottom: isSmallScreen ? 6 : 8,
  },
  smallProjectInfo: {
    fontSize: 9,
  },
  documentStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: isSmallScreen ? 10 : 12,
    gap: isSmallScreen ? 6 : 8,
  },
  docStatusLabel: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
  },
  smallDocStatusLabel: {
    fontSize: 9,
  },
  documentActions: {
    flexDirection: 'row',
    gap: isSmallScreen ? 6 : 8,
    flexWrap: 'wrap',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: isSmallScreen ? 6 : 8,
    paddingVertical: isSmallScreen ? 4 : 6,
    borderRadius: 6,
  },
  smallDownloadButton: {
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  downloadButtonText: {
    color: '#3A0A53',
    fontSize: isSmallScreen ? 9 : 11,
    fontWeight: '600',
    marginLeft: isSmallScreen ? 2 : 4,
  },
  smallDownloadButtonText: {
    fontSize: 8,
  },
  // API Status Styles
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: isSmallScreen ? 10 : 12,
    marginHorizontal: isSmallScreen ? 16 : 20,
    marginTop: isSmallScreen ? 8 : 10,
    borderRadius: 8,
  },
  apiStatusOnline: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  apiStatusOffline: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  apiStatusText: {
    marginLeft: 8,
    fontSize: isSmallScreen ? 12 : 14,
    fontWeight: '500',
  },
  apiStatusTextOnline: {
    color: '#4CAF50',
  },
  apiStatusTextOffline: {
    color: '#F44336',
  },
  // Error Container
  errorContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: isSmallScreen ? 24 : 32,
    alignItems: 'center',
    margin: isSmallScreen ? 16 : 20,
    elevation: 3,
  },
  errorTitle: {
    fontSize: isSmallScreen ? 18 : 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#3A0A53",
    paddingHorizontal: isSmallScreen ? 20 : 24,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 50 : 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: isSmallScreen ? 14 : 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  apiStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: isSmallScreen ? 12 : 16,
    marginBottom: isSmallScreen ? 12 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Data Count Styles
  dataCountContainer: {
    marginTop: 8,
  },
  dataCountText: {
    fontSize: isSmallScreen ? 10 : 12,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Tips Container
  tipsContainer: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  tip: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  // No Data Container
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallScreen ? 30 : 40,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 16,
    color: '#6B7280',
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: '500',
  },
  smallNoDataText: {
    fontSize: 13,
  },
  noDataSubtext: {
    fontSize: isSmallScreen ? 12 : 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  smallNoDataSubtext: {
    fontSize: 11,
  },
  // Offline Text
  offlineText: {
    marginTop: 8,
    fontSize: isSmallScreen ? 12 : 14,
    color: '#F44336',
    textAlign: 'center',
  },
});

export default IMsScreen;