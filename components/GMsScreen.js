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
  Dimensions,
  Modal,
} from "react-native";
import { Card, DataTable } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { PieChart, BarChart } from "react-native-chart-kit";

const GMsScreen = ({ onNavigateBack, userEmail }) => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");
  const [contractData, setContractData] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalLearners: 0,
    totalContracts: 0,
  });

  useEffect(() => {
    fetchDGData();
  }, []);

  const fetchDGData = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://10.114.30.114:5000/dg-dashboard");
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Transform the backend data to match frontend structure
        const transformedData = data.map(item => ({
          contract_number: item.contract_number,
          short_contract_number: item.short_contract_number,
          funding_window: item.funding_window_name,
          amount_awarded: item.amount_per_moa_gb_approvals,
          moa_date: item.contract_start_date,
          organisation_name: item.organisation_name,
          status: getStatusFromDates(item.contract_start_date, item.contract_end_date),
          learners: item.number_of_learners_funded_per_moa,
          region: item.region,
          rsa: item.rsa,
          cost_code: item.cost_code,
          dg_year: item.dg_year,
          cycle: item.cycle,
          programmes_afs: item.programmes_afs,
          tradingName: item.tradingName,
          province: item.province,
          companySize: item.companySize,
          numberOfEmployees: item.numberOfEmployees,
          sdfEmail: item.sdfEmail
        }));
        
        setContractData(transformedData);
        
        // Calculate stats
        const totalAmount = transformedData.reduce((sum, contract) => sum + (contract.amount_awarded || 0), 0);
        const totalLearners = transformedData.reduce((sum, contract) => sum + (contract.learners || 0), 0);
        
        setStats({
          totalAmount,
          totalLearners,
          totalContracts: transformedData.length
        });
      }
    } catch (error) {
      console.error("Error fetching DG data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusFromDates = (startDate, endDate) => {
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < today) return "Closed";
    if (start > today) return "Pending";
    return "Active";
  };

  const handleLogout = () => {
    onNavigateBack();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#4CAF50";
      case "Closed": return "#2196F3";
      case "Pending": return "#FFC107";
      default: return "#9E9E9E";
    }
  };

  const renderDashboard = () => {
    // Prepare data for charts
    const statusData = contractData.reduce((acc, contract) => {
      acc[contract.status] = (acc[contract.status] || 0) + 1;
      return acc;
    }, {});
    
    const fundingData = contractData.reduce((acc, contract) => {
      const window = contract.funding_window?.split(' ')[0] || 'Other';
      acc[window] = (acc[window] || 0) + (contract.amount_awarded || 0);
      return acc;
    }, {});
    
    const pieData = Object.keys(statusData).map(status => ({
      name: status,
      population: statusData[status],
      color: getStatusColor(status),
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }));
    
    const barData = {
      labels: Object.keys(fundingData),
      datasets: [{
        data: Object.values(fundingData).map(val => val / 1000), // Display in thousands
      }]
    };

    return (
      <View style={styles.dashboardContainer}>
        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Contracts</Text>
            <Text style={styles.summaryCardValue}>{stats.totalContracts}</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Amount</Text>
            <Text style={styles.summaryCardValue}>R{stats.totalAmount.toLocaleString()}</Text>
          </Card>
          
          <Card style={styles.summaryCard}>
            <Text style={styles.summaryCardTitle}>Total Learners</Text>
            <Text style={styles.summaryCardValue}>{stats.totalLearners}</Text>
          </Card>
        </View>
        
        {/* Charts Row */}
        <View style={styles.chartsRow}>
          <Card style={styles.chartCard}>
            <Text style={styles.chartTitle}>Contract Status</Text>
            {pieData.length > 0 ? (
              <PieChart
                data={pieData}
                width={Dimensions.get("window").width - 60}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                style={styles.chart}
              />
            ) : (
              <Text style={styles.noDataText}>No status data available</Text>
            )}
          </Card>
          
          <Card style={styles.chartCard}>
            {barData.labels.length > 0 ? (
              <BarChart
                data={barData}
                width={Dimensions.get("window").width - 60}
                height={220}
                yAxisLabel="R"
                chartConfig={{
                  backgroundColor: "#6A0DAD",
                  backgroundGradientFrom: "#6A0DAD",
                  backgroundGradientTo: "#3A0A53",
                  decimalPlaces: 0,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                style={styles.chart}
                verticalLabelRotation={30}
              />
            ) : (
              <Text style={styles.noDataText}>No funding data available</Text>
            )}
          </Card>
        </View>
        
        {/* Recent Contracts */}
        <Card style={styles.recentContractsCard}>
          <Text style={styles.sectionTitle}>Recent Contracts</Text>
          <ScrollView horizontal>
            <View style={styles.recentContractsContainer}>
              {contractData.slice(0, 4).map((contract, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.contractCard}
                  onPress={() => setSelectedContract(contract)}
                >
                  <View style={styles.contractCardHeader}>
                    <Text style={styles.contractNumber} numberOfLines={1}>
                      {contract.short_contract_number || contract.contract_number}
                    </Text>
                    <View style={[styles.statusBadge, {backgroundColor: getStatusColor(contract.status)}]}>
                      <Text style={styles.statusText}>{contract.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.contractOrg}>{contract.organisation_name}</Text>
                  <Text style={styles.contractAmount}>R{(contract.amount_awarded || 0).toLocaleString()}</Text>
                  <Text style={styles.contractLearners}>{contract.learners || 0} learners</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Card>
      </View>
    );
  };

  const renderContractsTable = () => {
    return (
      <Card style={styles.dataTableCard}>
        <Text style={styles.sectionTitle}>Discretionary Grant Contracts</Text>
        <DataTable>
          <DataTable.Header>
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
            >
              <DataTable.Cell style={styles.cellWrapper}>
                <Text style={styles.wrappedText}>{contract.short_contract_number || contract.contract_number}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cellWrapper}>
                <Text style={styles.wrappedText}>{contract.organisation_name}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cellWrapper} numeric>
                <Text style={styles.wrappedText}>R{(contract.amount_awarded || 0).toLocaleString()}</Text>
              </DataTable.Cell>
              <DataTable.Cell style={styles.cellWrapper} numeric>
                <View style={[styles.tableStatusBadge, {backgroundColor: getStatusColor(contract.status)}]}>
                  <Text style={styles.statusText}>{contract.status}</Text>
                </View>
              </DataTable.Cell>
            </DataTable.Row>
          ))}
        </DataTable>
      </Card>
    );
  };

  const renderActiveView = () => {
    switch (activeView) {
      case "dashboard":
        return renderDashboard();
      case "contracts":
        return renderContractsTable();
      default:
        return null;
    }
  };

  const getViewTitle = () => {
    switch (activeView) {
      case "dashboard": return "DG Dashboard Overview";
      case "contracts": return "DG Contract Details";
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
          <View style={styles.viewSwitcher}>
            <TouchableOpacity 
              style={[styles.viewButton, activeView === 'dashboard' && styles.activeViewButton]}
              onPress={() => setActiveView('dashboard')}
            >
              <Text style={[styles.viewButtonText, activeView === 'dashboard' && styles.activeViewButtonText]}>
                Dashboard
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, activeView === 'contracts' && styles.activeViewButton]}
              onPress={() => setActiveView('contracts')}
            >
              <Text style={[styles.viewButtonText, activeView === 'contracts' && styles.activeViewButtonText]}>
                Contracts
              </Text>
            </TouchableOpacity>
          </View>
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
          <ActivityIndicator size="large" color="#6A0DAD" style={styles.loader} />
        ) : (
          <LinearGradient colors={["#6A0DAD", "#3A0A53"]} style={styles.section}>
            <Text style={styles.viewTitle}>{getViewTitle()}</Text>
            {renderActiveView()}
          </LinearGradient>
        )}
      </ScrollView>

      <LinearGradient colors={["#3A0A53", "#6A0DAD"]} style={styles.footer}>
        <Text style={styles.footerText}>
          Copyright © {new Date().getFullYear()}, CHIETA. All rights reserved.
        </Text>
      </LinearGradient>

      {/* Contract Details Modal */}
      <Modal
        visible={!!selectedContract}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedContract(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedContract(null)}
        >
          <View style={styles.modalContent}>
            {selectedContract && (
              <>
                <Text style={styles.modalTitle}>DG Contract Details</Text>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Contract Number:</Text>
                  <Text style={styles.detailValue}>{selectedContract.contract_number}</Text>
                </View>
                
                {selectedContract.short_contract_number && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Short Contract #:</Text>
                    <Text style={styles.detailValue}>{selectedContract.short_contract_number}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Funding Window:</Text>
                  <Text style={styles.detailValue}>{selectedContract.funding_window}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Amount Awarded:</Text>
                  <Text style={styles.detailValue}>R{(selectedContract.amount_awarded || 0).toLocaleString()}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Start Date:</Text>
                  <Text style={styles.detailValue}>
                    {new Date(selectedContract.moa_date).toLocaleDateString()}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Organization:</Text>
                  <Text style={styles.detailValue}>{selectedContract.organisation_name}</Text>
                </View>
                
                {selectedContract.tradingName && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Trading Name:</Text>
                    <Text style={styles.detailValue}>{selectedContract.tradingName}</Text>
                  </View>
                )}
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <View style={[styles.modalStatusBadge, {backgroundColor: getStatusColor(selectedContract.status)}]}>
                    <Text style={styles.statusText}>{selectedContract.status}</Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Number of Learners:</Text>
                  <Text style={styles.detailValue}>{selectedContract.learners || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Region:</Text>
                  <Text style={styles.detailValue}>{selectedContract.region || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Province:</Text>
                  <Text style={styles.detailValue}>{selectedContract.province || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>DG Year:</Text>
                  <Text style={styles.detailValue}>{selectedContract.dg_year || 'N/A'}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cycle:</Text>
                  <Text style={styles.detailValue}>{selectedContract.cycle || 'N/A'}</Text>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewSwitcher: {
    flexDirection: "row",
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 2,
  },
  viewButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  activeViewButton: {
    backgroundColor: 'white',
  },
  viewButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  activeViewButtonText: {
    color: '#6A0DAD',
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
    marginTop: 10,
    marginBottom: 10,
  },
  logo: {
    width: 200,
    height: 80,
    resizeMode: "contain",
  },
  welcomeText: {
    color: '#6A0DAD',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 16,
  },
  section: {
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 4,
    minHeight: Dimensions.get("window").height * 0.5,
  },
  viewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  loader: {
    marginTop: Dimensions.get("window").height * 0.3,
  },
  noDataText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#666',
  },
  
  // Dashboard styles
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
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    alignItems: 'center',
    elevation: 2,
  },
  summaryCardTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  summaryCardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#3A0A53',
  },
  chartsRow: {
    marginBottom: 16,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A0A53',
    marginBottom: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  recentContractsCard: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
  },
  recentContractsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  contractCard: {
    width: 200,
    padding: 16,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    elevation: 1,
  },
  contractCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  contractNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3A0DAD',
    flex: 1,
    marginRight: 8,
  },
  contractOrg: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  contractAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3A0A53',
    marginBottom: 4,
  },
  contractLearners: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Table styles
  dataTableCard: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "white",
    padding: 16,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A0DAD",
    marginBottom: 16,
    textAlign: "center",
  },
  cellWrapper: {
    flex: 1,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  wrappedText: {
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  headerText: {
    fontWeight: 'bold',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  tableStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  
  // Footer
  footer: {
    padding: 20,
    alignItems: "center",
  },
  footerText: {
    color: "white",
    fontSize: 14,
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
    padding: 20,
    borderRadius: 8,
    width: "90%",
    maxHeight: Dimensions.get("window").height * 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#3A0A53",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
});

export default GMsScreen;