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
} from "react-native";
import { Card, DataTable, Menu, Divider } from "react-native-paper";
import { MaterialIcons, FontAwesome5, Ionicons, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const GMsScreen = ({ onNavigateBack, userEmail }) => {
  const [loading, setLoading] = useState(true);
  const [visibleMenu, setVisibleMenu] = useState(false);
  const [activeView, setActiveView] = useState("summary");
  const [stats, setStats] = useState({
    totalFunding: 0,
    totalLearners: 0,
    avgPerLearner: 0
  });
  const [contractData, setContractData] = useState([]);
  const [programData, setProgramData] = useState({});

  useEffect(() => {
    // Simulate API loading with timeout
    const timer = setTimeout(() => {
      loadDummyData();
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const loadDummyData = () => {
    // Generate dummy contract data
    const dummyContracts = [
      {
        organisation_name: "UNILEVER SOUTH AFRICA PTY LTD",
        programmes_afs: "Apprenticeships Grant-18.1",
        amount_per_moa_gb_approvals: 289800,
        number_of_learners_funded_per_moa: 13
      },
      {
        organisation_name: "UNILEVER SOUTH AFRICA PTY LTD",
        programmes_afs: "WIL - Workbased Learning",
        amount_per_moa_gb_approvals: 8500000,
        number_of_learners_funded_per_moa: 30
      },
      {
        organisation_name: "UNILEVER SOUTH AFRICA PTY LTD",
        programmes_afs: "Apprenticeships Grant-18.2",
        amount_per_moa_gb_approvals: 920000,
        number_of_learners_funded_per_moa: 18
      },
    ];

    // Calculate statistics
    const totalFunding = dummyContracts.reduce((sum, contract) => sum + contract.amount_per_moa_gb_approvals, 0);
    const totalLearners = dummyContracts.reduce((sum, contract) => sum + contract.number_of_learners_funded_per_moa, 0);
    const avgPerLearner = totalLearners > 0 ? totalFunding / totalLearners : 0;

    // Group by program type
    const grouped = {};
    dummyContracts.forEach(contract => {
      const program = contract.programmes_afs;
      if (!grouped[program]) {
        grouped[program] = {
          count: 0,
          totalAmount: 0,
          learners: 0
        };
      }
      grouped[program].count++;
      grouped[program].totalAmount += contract.amount_per_moa_gb_approvals;
      grouped[program].learners += contract.number_of_learners_funded_per_moa;
    });

    setContractData(dummyContracts);
    setProgramData(grouped);
    setStats({
      totalFunding,
      totalLearners,
      avgPerLearner
    });
  };

  const handleLogout = () => {
    onNavigateBack();
  };

  const openMenu = () => setVisibleMenu(true);
  const closeMenu = () => setVisibleMenu(false);

  const renderActiveView = () => {
    switch (activeView) {
      case "summary":
        return (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryContainer}>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={styles.summaryTitle}>Total Funding</Text>
                  <Text style={styles.summaryValue}>R {stats.totalFunding.toLocaleString()}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={styles.summaryTitle}>Total Learners</Text>
                  <Text style={styles.summaryValue}>{stats.totalLearners}</Text>
                </Card.Content>
              </Card>
              <Card style={styles.summaryCard}>
                <Card.Content>
                  <Text style={styles.summaryTitle}>Avg/Learner</Text>
                  <Text style={styles.summaryValue}>R {stats.avgPerLearner.toFixed(2).toLocaleString()}</Text>
                </Card.Content>
              </Card>
            </View>

            {/* Program Type Breakdown */}
            <Card style={styles.dataTableCard}>
              <Text style={styles.sectionTitle}>Program Types</Text>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Program</DataTable.Title>
                  <DataTable.Title numeric>Contracts</DataTable.Title>
                  <DataTable.Title numeric>Amount</DataTable.Title>
                  <DataTable.Title numeric>Learners</DataTable.Title>
                </DataTable.Header>

                {Object.entries(programData).map(([program, data], index) => (
                  <DataTable.Row key={index}>
                    <DataTable.Cell>{program}</DataTable.Cell>
                    <DataTable.Cell numeric>{data.count}</DataTable.Cell>
                    <DataTable.Cell numeric>R {data.totalAmount.toLocaleString()}</DataTable.Cell>
                    <DataTable.Cell numeric>{data.learners}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card>
          </>
        );
      case "contracts":
        return (
          <Card style={styles.dataTableCard}>
            <Text style={styles.sectionTitle}>Recent Contracts</Text>
            <DataTable>
              <DataTable.Header>
                <DataTable.Title>Organization</DataTable.Title>
                <DataTable.Title>Program</DataTable.Title>
                <DataTable.Title numeric>Amount</DataTable.Title>
                <DataTable.Title numeric>Learners</DataTable.Title>
              </DataTable.Header>

              {contractData.map((contract, index) => (
                <DataTable.Row key={index}>
                  <DataTable.Cell>{contract.organisation_name}</DataTable.Cell>
                  <DataTable.Cell>{contract.programmes_afs}</DataTable.Cell>
                  <DataTable.Cell numeric>R {contract.amount_per_moa_gb_approvals.toLocaleString()}</DataTable.Cell>
                  <DataTable.Cell numeric>{contract.number_of_learners_funded_per_moa}</DataTable.Cell>
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
      case "summary": return "Summary Dashboard";
      case "contracts": return "Contract Details";
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
                setActiveView("summary");
                closeMenu();
              }} 
              title="Summary Dashboard" 
              leadingIcon={() => <Ionicons name="stats-chart" size={20} color="#6A0DAD" />}
              style={activeView === "summary" ? styles.activeMenuItem : null}
              titleStyle={activeView === "summary" ? styles.activeMenuText : styles.menuText}
            />
            <Divider />
            <Menu.Item 
              onPress={() => {
                setActiveView("contracts");
                closeMenu();
              }} 
              title="Contract Details" 
              leadingIcon={() => <FontAwesome5 name="file-contract" size={20} color="#6A0DAD" />}
              style={activeView === "contracts" ? styles.activeMenuItem : null}
              titleStyle={activeView === "contracts" ? styles.activeMenuText : styles.menuText}
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
          <ActivityIndicator size="large" color="#6A0DAD" style={styles.loader} />
        ) : (
          <LinearGradient colors={["#6A0DAD", "#3A0A53"]} style={styles.section}>
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
  loader: {
    marginTop: Dimensions.get('window').height * 0.3
  },
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
    color: "#3A0A53",
    marginBottom: 16,
    textAlign: "center",
  },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    elevation: 4,
    backgroundColor: "white",
  },
  summaryTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3A0A53",
    textAlign: "center",
    marginTop: 4,
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

export default GMsScreen;