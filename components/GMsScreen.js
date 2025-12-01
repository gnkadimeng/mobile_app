import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Modal,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Card, DataTable } from "react-native-paper";
import { MaterialIcons, Feather, AntDesign } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, BarChart } from "react-native-chart-kit";
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

const GMsScreen = ({ onNavigateBack, userEmail }) => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [contractData, setContractData] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [stats, setStats] = useState({
    totalFunding: 0,
    totalLearners: 0,
    totalContracts: 0,
    avgPerLearner: 0,
  });
  const [programBreakdown, setProgramBreakdown] = useState([]);
  const [apiStatus, setApiStatus] = useState('checking');
  const [error, setError] = useState(null);

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
      await fetchGMDashboardData();
    } catch (error) {
      console.error("Error loading GM data:", error);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Check if backend API is available
  const checkApiHealth = async () => {
    try {
      const config = API_CONFIG();
      const response = await fetch(`${config.BASE_URL}${ENDPOINTS.HEALTH}`, {
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

  // Fetch GM Dashboard data using the config buildURL method
  const fetchGMDashboardData = async () => {
    try {
      const config = API_CONFIG();
      const url = config.buildGMDashboardURL ? config.buildGMDashboardURL(userEmail) : `${config.BASE_URL}${ENDPOINTS.GM_DASHBOARD}/${userEmail}`;
      
      console.log('📡 Fetching GM dashboard from:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ GM dashboard data received:', data);
      
      if (data) {
        // Set summary stats with proper fallbacks
        setStats({
          totalFunding: data.summary?.totalFunding || data.summary?.totalfunding || 0,
          totalLearners: data.summary?.totalLearners || data.summary?.totallearners || 0,
          totalContracts: data.summary?.totalContracts || data.summary?.totalcontracts || 0,
          avgPerLearner: data.summary?.avgPerLearner || data.summary?.avgperlearner || 0,
        });
        
        // Set program breakdown - ensure it's always an array
        setProgramBreakdown(Array.isArray(data.programBreakdown) ? data.programBreakdown : []);
        
        // Transform contract data for the table
        const contracts = data.recentContracts || [];
        if (contracts.length > 0) {
          const transformedData = contracts.map(item => ({
            contract_number: item.contract_number || '',
            short_contract_number: item.short_contract_number || '',
            funding_window: item.funding_window_name || '',
            amount_awarded: item.amount_per_moa_gb_approvals || 0,
            moa_date: item.contract_start_date || '',
            organisation_name: item.organisation_name || '',
            status: getStatusFromDates(item.contract_start_date, item.contract_end_date),
            learners: item.number_of_learners_funded_per_moa || 0,
            region: item.region || '',
            cost_code: item.cost_code || '',
            dg_year: item.dg_year || '',
            cycle: item.cycle || '',
            programmes_afs: item.programmes_afs || '',
          }));
          setContractData(transformedData);
        } else {
          setContractData([]);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching GM dashboard data:", error);
      // Set empty data for offline mode
      setContractData([]);
      setStats({
        totalFunding: 0,
        totalLearners: 0,
        totalContracts: 0,
        avgPerLearner: 0,
      });
      setProgramBreakdown([]);
      throw error;
    }
  };

  const getStatusFromDates = (startDate, endDate) => {
    if (!startDate || !endDate) return "Unknown";
    
    try {
      const today = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (end < today) return "Closed";
      if (start > today) return "Pending";
      return "Active";
    } catch (error) {
      console.error("Error parsing dates:", error);
      return "Unknown";
    }
  };

  const handleLogout = () => {
    onNavigateBack();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return CHIETA_COLORS.success;
      case "Closed": return CHIETA_COLORS.accent;
      case "Pending": return CHIETA_COLORS.warning;
      default: return CHIETA_COLORS.gray;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active": return "check-circle";
      case "Closed": return "x-circle";
      case "Pending": return "clock";
      default: return "help-circle";
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "R0";
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount)) return "R0";
    
    if (numAmount >= 1000000) {
      return `R${(numAmount / 1000000).toFixed(1)}M`;
    } else if (numAmount >= 1000) {
      return `R${(numAmount / 1000).toFixed(0)}`;
    }
    return `R${numAmount.toLocaleString()}`;
  };

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
            Backend offline - using: {config.BASE_URL}
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.apiStatusContainer}>
        <MaterialIcons name="check-circle" size={16} color={CHIETA_COLORS.success} />
        <Text style={[styles.apiStatusText, { color: CHIETA_COLORS.success }]}>
          Backend online - {config.BASE_URL.replace('https://', '').replace('http://', '')}
        </Text>
      </View>
    );
  };

  const renderDataCount = () => {
    const counts = {
      contracts: contractData.length,
      programs: programBreakdown.length
    };
    
    return (
      <View style={styles.dataCountContainer}>
        <Text style={styles.dataCountText}>
          Data: {counts.contracts} contracts, {counts.programs} programs
        </Text>
      </View>
    );
  };

  // Helper function to generate consistent colors for charts
  const getRandomColor = (index) => {
    const colors = [
      CHIETA_COLORS.accent,
      CHIETA_COLORS.success,
      CHIETA_COLORS.warning,
      CHIETA_COLORS.info,
      CHIETA_COLORS.danger,
      '#8B5CF6',
      '#10B981',
      '#F59E0B',
      '#EF4444',
      '#3B82F6'
    ];
    return colors[index % colors.length];
  };

  const renderDashboard = () => {
    // Show connection error if API is offline and no data
    if (apiStatus === 'offline' && contractData.length === 0 && programBreakdown.length === 0) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="cloud-off" size={64} color={CHIETA_COLORS.gray} />
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
            onPress={loadData}
          >
            <Text style={styles.retryButtonText}>Retry Connection</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Show general error
    if (error && contractData.length === 0 && programBreakdown.length === 0) {
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

    // Prepare chart data from program breakdown with safety checks
    const programData = programBreakdown.map((program, index) => {
      const programName = program.program || program.programmes_afs || `Program ${index + 1}`;
      const population = program.count || program.learners || program.number_of_learners_funded_per_moa || 0;
      
      return {
        name: programName.substring(0, 10),
        population: Number(population) || 0,
        color: getRandomColor(index),
        legendFontColor: CHIETA_COLORS.darkText,
        legendFontSize: 10
      };
    }).filter(item => item.population > 0); // Filter out zero values

    // Prepare funding data for bar chart
    const validPrograms = programBreakdown
      .filter(program => {
        const amount = program.totalAmount || program.totalamount || program.amount_per_moa_gb_approvals || 0;
        return Number(amount) > 0;
      })
      .slice(0, 5); // Limit to 5 programs

    const fundingData = {
      labels: validPrograms.map(p => {
        const programName = p.program || p.programmes_afs || 'Unknown';
        return programName.substring(0, 8) + (programName.length > 8 ? '...' : '');
      }),
      datasets: [{
        data: validPrograms.map(p => {
          const amount = p.totalAmount || p.totalamount || p.amount_per_moa_gb_approvals || 0;
          return (Number(amount) || 0) / 1000000; // Convert to millions
        }),
      }]
    };

    return (
      <View style={styles.dashboardContainer}>
        {/* API Status Indicator */}
        <View style={styles.apiStatusCard}>
          {renderApiStatusIndicator()}
        </View>

        {/* Data Count Indicator */}
        {renderDataCount()}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.summaryCard1]}>
            <View style={[styles.summaryCardIcon, styles.summaryCardIcon1]}>
              <AntDesign name="filetext1" size={24} color={CHIETA_COLORS.accent} />
            </View>
            <Text style={styles.summaryCardValue}>{stats.totalContracts}</Text>
            <Text style={styles.summaryCardTitle}>Total Contracts</Text>
          </View>
          
          <View style={[styles.summaryCard, styles.summaryCard2]}>
            <View style={[styles.summaryCardIcon, styles.summaryCardIcon2]}>
              <AntDesign name="moneycollect" size={24} color={CHIETA_COLORS.success} />
            </View>
            <Text style={styles.summaryCardValue}>{formatCurrency(stats.totalFunding)}</Text>
            <Text style={styles.summaryCardTitle}>Total Funding</Text>
          </View>
          
          <View style={[styles.summaryCard, styles.summaryCard3]}>
            <View style={[styles.summaryCardIcon, styles.summaryCardIcon3]}>
              <AntDesign name="team" size={24} color={CHIETA_COLORS.warning} />
            </View>
            <Text style={styles.summaryCardValue}>
              {stats.totalLearners ? stats.totalLearners.toLocaleString() : '0'}
            </Text>
            <Text style={styles.summaryCardTitle}>Total Learners</Text>
          </View>
        </View>

        {/* Average per learner card */}
        <View style={styles.avgCard}>
          <View style={styles.avgCardContent}>
            <View style={styles.avgIcon}>
              <AntDesign name="user" size={24} color={CHIETA_COLORS.info} />
            </View>
            <View style={styles.avgTextContainer}>
              <Text style={styles.avgLabel}>Average Funding per Learner</Text>
              <Text style={styles.avgValue}>{formatCurrency(stats.avgPerLearner)}</Text>
            </View>
          </View>
        </View>
        
        {/* Charts Row - Only show if we have data */}
        {programBreakdown.length > 0 && (
          <View style={styles.chartsContainer}>
            {/* Pie Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Program Distribution</Text>
                <Feather name="pie-chart" size={20} color={CHIETA_COLORS.gray} />
              </View>
              {programData.length > 0 ? (
                <PieChart
                  data={programData}
                  width={Math.min(screenWidth - 80, 300)}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    backgroundColor: "transparent",
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="10"
                  absolute
                  style={styles.chart}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Feather name="pie-chart" size={48} color={CHIETA_COLORS.gray} />
                  <Text style={styles.noDataText}>No program data available</Text>
                </View>
              )}
            </View>
            
            {/* Bar Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Funding by Program (Millions)</Text>
                <Feather name="bar-chart-2" size={20} color={CHIETA_COLORS.gray} />
              </View>
              {fundingData.labels.length > 0 ? (
                <BarChart
                  data={fundingData}
                  width={Math.min(screenWidth - 80, 300)}
                  height={200}
                  yAxisLabel="R"
                  yAxisSuffix="M"
                  chartConfig={{
                    backgroundColor: CHIETA_COLORS.lightBg,
                    backgroundGradientFrom: CHIETA_COLORS.lightBg,
                    backgroundGradientTo: CHIETA_COLORS.lightBg,
                    decimalPlaces: 1,
                    color: (opacity = 1) => `rgba(108, 13, 173, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(44, 10, 64, ${opacity})`,
                    style: {
                      borderRadius: 12,
                    },
                    propsForLabels: {
                      fontSize: 10,
                    },
                  }}
                  style={styles.chart}
                  verticalLabelRotation={30}
                  showBarTops={false}
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <Feather name="bar-chart-2" size={48} color={CHIETA_COLORS.gray} />
                  <Text style={styles.noDataText}>No funding data available</Text>
                </View>
              )}
            </View>
          </View>
        )}
        
        {/* Recent Contracts */}
        <View style={styles.recentContractsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Contracts</Text>
            {contractData.length > 0 && (
              <TouchableOpacity onPress={() => setActiveView('contracts')}>
                <Text style={styles.viewAllButton}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          {contractData.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.recentContractsContainer}>
                {contractData.slice(0, 6).map((contract, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.contractCard}
                    onPress={() => setSelectedContract(contract)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.contractCardHeader}>
                      <Text style={styles.contractNumber} numberOfLines={1}>
                        {contract.short_contract_number || contract.contract_number || 'N/A'}
                      </Text>
                      <View style={[styles.statusBadge, {backgroundColor: getStatusColor(contract.status)}]}>
                        <Feather name={getStatusIcon(contract.status)} size={12} color="white" />
                      </View>
                    </View>
                    <Text style={styles.contractOrg} numberOfLines={2}>
                      {contract.organisation_name || 'Unknown Organization'}
                    </Text>
                    <View style={styles.contractStats}>
                      <Text style={styles.contractAmount}>
                        {formatCurrency(contract.amount_awarded)}
                      </Text>
                      <Text style={styles.contractLearners}>
                        {contract.learners || 0} learners
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <View style={styles.noDataContainer}>
              <Feather name="file-text" size={48} color={CHIETA_COLORS.gray} />
              <Text style={styles.noDataText}>No contracts available</Text>
              <Text style={styles.noDataSubtext}>
                {apiStatus === 'offline' ? 'Backend connection required' : 'No contract data available for your account'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderContractsTable = () => {
    return (
      <View style={styles.tableContainer}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>Discretionary Grant Contracts</Text>
          <Text style={styles.tableSubtitle}>{contractData.length} contracts found for {userEmail}</Text>
          {renderApiStatusIndicator()}
        </View>
        
        {contractData.length > 0 ? (
          <View style={styles.dataTableCard}>
            <DataTable>
              <DataTable.Header style={styles.tableHeaderRow}>
                <DataTable.Title style={styles.cellWrapper}>
                  <Text style={styles.headerText}>Contract #</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cellWrapper}>
                  <Text style={styles.headerText}>Organization</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cellWrapper} numeric>
                  <Text style={styles.headerText}>Amount</Text>
                </DataTable.Title>
                <DataTable.Title style={styles.cellWrapper} numeric>
                  <Text style={styles.headerText}>Status</Text>
                </DataTable.Title>
              </DataTable.Header>

              {contractData.map((contract, index) => (
                <DataTable.Row
                  key={index}
                  onPress={() => setSelectedContract(contract)}
                  style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}
                >
                  <DataTable.Cell style={styles.cellWrapper}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {contract.short_contract_number || contract.contract_number || 'N/A'}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper}>
                    <Text style={styles.cellText} numberOfLines={2}>
                      {contract.organisation_name || 'Unknown Organization'}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper} numeric>
                    <Text style={styles.cellTextBold}>
                      {formatCurrency(contract.amount_awarded)}
                    </Text>
                  </DataTable.Cell>
                  <DataTable.Cell style={styles.cellWrapper} numeric>
                    <View style={[styles.tableStatusBadge, {backgroundColor: getStatusColor(contract.status)}]}>
                      <Feather name={getStatusIcon(contract.status)} size={10} color="white" />
                      <Text style={styles.statusText}>{contract.status}</Text>
                    </View>
                  </DataTable.Cell>
                </DataTable.Row>
              ))}
            </DataTable>
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Feather name="file-text" size={64} color={CHIETA_COLORS.gray} />
            <Text style={styles.errorTitle}>No Contracts Available</Text>
            <Text style={styles.errorMessage}>
              {apiStatus === 'offline' 
                ? 'Unable to load contracts due to connection issues.' 
                : `No contract data found for ${userEmail}.`
              }
            </Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadData}
            >
              <Text style={styles.retryButtonText}>
                {apiStatus === 'offline' ? 'Retry Connection' : 'Refresh Data'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard": return renderDashboard();
      case "contracts": return renderContractsTable();
      default: return null;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard": return "GM Dashboard Overview";
      case "contracts": return "Contract Management";
      default: return "";
    }
  };

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
          <Text style={styles.headerTitle}>GM Dashboard</Text>
          <Text style={styles.headerSubtitle}>{getViewTitle()}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeView === 'dashboard' && styles.activeTab]}
            onPress={() => setActiveView('dashboard')}
          >
            <Feather 
              name="home" 
              size={16} 
              color={activeView === 'dashboard' ? CHIETA_COLORS.primary : CHIETA_COLORS.lightText} 
            />
            <Text style={[styles.tabText, activeView === 'dashboard' && styles.activeTabText]}>
              Dashboard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeView === 'contracts' && styles.activeTab]}
            onPress={() => setActiveView('contracts')}
          >
            <Feather 
              name="file-text" 
              size={16} 
              color={activeView === 'contracts' ? CHIETA_COLORS.primary : CHIETA_COLORS.lightText} 
            />
            <Text style={[styles.tabText, activeView === 'contracts' && styles.activeTabText]}>
              Contracts
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={CHIETA_COLORS.accent} />
            <Text style={styles.loadingText}>Loading GM data...</Text>
            {apiStatus === 'offline' && (
              <Text style={styles.offlineText}>Backend connection issue detected</Text>
            )}
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

      {/* Contract Details Modal */}
      <Modal
        visible={!!selectedContract}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedContract(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, {color: CHIETA_COLORS.primary}]}>Contract Details</Text>
              <TouchableOpacity 
                onPress={() => setSelectedContract(null)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color={CHIETA_COLORS.gray} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedContract && (
                <>
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, {color: CHIETA_COLORS.primary}]}>Contract Information</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Contract Number</Text>
                      <Text style={styles.detailValue}>{selectedContract.contract_number || 'N/A'}</Text>
                    </View>
                    
                    {selectedContract.short_contract_number && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Short Contract #</Text>
                        <Text style={styles.detailValue}>{selectedContract.short_contract_number}</Text>
                      </View>
                    )}
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <View style={[styles.modalStatusBadge, {backgroundColor: getStatusColor(selectedContract.status)}]}>
                        <Feather name={getStatusIcon(selectedContract.status)} size={12} color="white" />
                        <Text style={styles.statusText}>{selectedContract.status}</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, {color: CHIETA_COLORS.primary}]}>Financial Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Amount Awarded</Text>
                      <Text style={[styles.detailValueHighlight, {color: CHIETA_COLORS.accent}]}>
                        {formatCurrency(selectedContract.amount_awarded)}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Funding Window</Text>
                      <Text style={styles.detailValue}>{selectedContract.funding_window || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, {color: CHIETA_COLORS.primary}]}>Organization Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Organization</Text>
                      <Text style={styles.detailValue}>{selectedContract.organisation_name || 'N/A'}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Region</Text>
                      <Text style={styles.detailValue}>{selectedContract.region || 'N/A'}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.modalSection}>
                    <Text style={[styles.modalSectionTitle, {color: CHIETA_COLORS.primary}]}>Program Details</Text>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Number of Learners</Text>
                      <Text style={[styles.detailValueHighlight, {color: CHIETA_COLORS.accent}]}>
                        {selectedContract.learners || 'N/A'}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Program</Text>
                      <Text style={styles.detailValue}>{selectedContract.programmes_afs || 'N/A'}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Start Date</Text>
                      <Text style={styles.detailValue}>
                        {selectedContract.moa_date ? new Date(selectedContract.moa_date).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>DG Year</Text>
                      <Text style={styles.detailValue}>{selectedContract.dg_year || 'N/A'}</Text>
                    </View>
                    
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cycle</Text>
                      <Text style={styles.detailValue}>{selectedContract.cycle || 'N/A'}</Text>
                    </View>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Keep your existing styles exactly as they are...
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
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
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
  offlineText: {
    marginTop: 8,
    fontSize: 14,
    color: CHIETA_COLORS.danger,
  },
  
  // API Status Styles
  apiStatusCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  apiStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  apiStatusText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  // Error State Styles
    errorContainer: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 32,
      alignItems: 'center',
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
    tipsContainer: {
      alignSelf: 'stretch',
      marginBottom: 24,
    },
    tip: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
      marginBottom: 8,
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
    
    // Dashboard Styles
    dashboardContainer: {
      flex: 1,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginHorizontal: 4,
      alignItems: 'center',
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    summaryCard1: {
      borderTopWidth: 4,
      borderTopColor: CHIETA_COLORS.accent,
    },
    summaryCard2: {
      borderTopWidth: 4,
      borderTopColor: CHIETA_COLORS.success,
    },
    summaryCard3: {
      borderTopWidth: 4,
      borderTopColor: CHIETA_COLORS.warning,
    },
    summaryCardIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    summaryCardIcon1: {
      backgroundColor: 'rgba(108, 13, 173, 0.1)',
    },
    summaryCardIcon2: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    summaryCardIcon3: {
      backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    summaryCardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
      marginBottom: 4,
    },
    summaryCardTitle: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
      textAlign: 'center',
    },
    
    // Average Card
    avgCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 24,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    avgCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avgIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(33, 150, 243, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    avgTextContainer: {
      flex: 1,
    },
    avgLabel: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
      marginBottom: 4,
    },
    avgValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
    },
    
    // Charts Styles
    chartsContainer: {
      marginBottom: 24,
    },
    chartCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
    },
    chart: {
      borderRadius: 12,
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
    },
    
    // Recent Contracts Styles
    recentContractsCard: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 20,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
    },
    viewAllButton: {
      fontSize: 14,
      color: CHIETA_COLORS.accent,
      fontWeight: '600',
    },
    recentContractsContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
    },
    contractCard: {
      width: 240,
      backgroundColor: '#F9FAFB',
      borderRadius: 12,
      padding: 16,
      marginRight: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
    },
    contractCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    contractNumber: {
      fontSize: 14,
      fontWeight: 'bold',
      color: CHIETA_COLORS.accent,
      flex: 1,
      marginRight: 8,
    },
    contractOrg: {
      fontSize: 14,
      color: CHIETA_COLORS.darkText,
      marginBottom: 12,
      lineHeight: 20,
    },
    contractStats: {
      borderTopWidth: 1,
      borderTopColor: '#E5E7EB',
      paddingTop: 12,
    },
    contractAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
      marginBottom: 4,
    },
    contractLearners: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
    },
    statusBadge: {
      width: 24,
      height: 24,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      paddingHorizontal: 6,
    },
    statusText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
      marginLeft: 4,
    },
    
    // Table Styles
    tableContainer: {
      flex: 1,
    },
    tableHeader: {
      marginBottom: 16,
    },
    tableTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: CHIETA_COLORS.darkText,
      marginBottom: 4,
    },
    tableSubtitle: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
    },
    dataTableCard: {
      marginBottom: 16,
      borderRadius: 12,
      elevation: 4,
      backgroundColor: "white",
      padding: 16,
      overflow: "hidden",
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
    cellTextBold: {
      color: CHIETA_COLORS.darkText,
      fontSize: 12,
      fontWeight: 'bold',
    },
    tableRow: {
      backgroundColor: 'white',
    },
    evenRow: {
      backgroundColor: CHIETA_COLORS.lightBg,
    },
    tableStatusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
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
    
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      backgroundColor: "white",
      borderRadius: 12,
      width: "90%",
      maxHeight: Dimensions.get("window").height * 0.8,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      flex: 1,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalBody: {
      padding: 20,
    },
    modalSection: {
      marginBottom: 24,
    },
    modalSectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#E5E7EB",
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: CHIETA_COLORS.gray,
      flex: 1,
    },
    detailValue: {
      fontSize: 14,
      color: CHIETA_COLORS.darkText,
      flex: 1,
      textAlign: "right",
    },
    detailValueHighlight: {
      fontSize: 14,
      fontWeight: 'bold',
      flex: 1,
      textAlign: "right",
    },
    modalStatusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Data Count Styles
    dataCountContainer: {
      paddingHorizontal: 0,
      paddingBottom: 10,
    },
    dataCountText: {
      fontSize: 12,
      color: CHIETA_COLORS.gray,
      fontStyle: 'italic',
      textAlign: 'center',
    },
  
    noDataSubtext: {
      fontSize: 14,
      color: CHIETA_COLORS.gray,
      textAlign: 'center',
      marginTop: 8,
    },
  });
  
  export default GMsScreen;