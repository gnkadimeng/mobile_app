import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Picker } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const IMsScreen = () => {
  const [showLinkedOnly, setShowLinkedOnly] = useState(false);
  const [selectedGrant, setSelectedGrant] = useState('');
  const [showMandatoryOverview, setShowMandatoryOverview] = useState(false);

  const toggleLinkedView = () => {
    setShowLinkedOnly(!showLinkedOnly);
  };

  if (showLinkedOnly) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Linked Organizations</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.profileName}>Lebo{"\n"}Mazibuko</Text>
            <TouchableOpacity style={styles.linkedButton} onPress={toggleLinkedView}>
              <Text style={styles.linkedButtonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.linkedOrgContainer}>
            <View style={styles.linkedOrgTableHeader}>
              <Text style={styles.tableCellHeader}>SDL No.</Text>
              <Text style={styles.tableCellHeader}>Organisational Name</Text>
              <Text style={styles.tableCellHeader}>Action</Text>
            </View>
            <View style={styles.linkedOrgRow}>
              <Text style={styles.tableCell}>L5S0720795</Text>
              <Text style={styles.tableCell}>THE PETROLEUM OIL AND GAS CORPORATION OF SOUTH AFRICA SOC LTD</Text>
              <Picker
                selectedValue={selectedGrant}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedGrant(itemValue)}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Discretionery Grant" value="discretionery" />
                <Picker.Item label="Mandatory Grant" value="mandatory" />
              </Picker>
            </View>
            <Text style={styles.note}>Discreation &gt; Application (Click to apply/the table)</Text>
            <Text style={styles.note}>Mandatory &gt; Show previous Applications (Click to apply/the table)</Text>
          </View>
        </ScrollView>

        <View style={styles.footerNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#CE8946" />
            <Text style={styles.navTextActive}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="calendar" size={24} color="white" />
            <Text style={styles.navText}>Discretionery Grant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="clipboard" size={24} color="white" />
            <Text style={styles.navText}>Mandatory Grant</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="school" size={24} color="white" />
            <Text style={styles.navText}>Lesedi Student Fund</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (showMandatoryOverview) {
    return (
      <View style={styles.container}>
        <ScrollView>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowMandatoryOverview(false)}>
              <Text style={{ color: 'white', marginBottom: 10 }}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Mandatory Grants Overview</Text>
          </View>

          <View style={{ margin: 20, backgroundColor: 'white', borderRadius: 10, padding: 15 }}>
            {/* Row 1 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontWeight: 'bold' }}>Actions</Text>
              <Text style={{ fontWeight: 'bold' }}>Title</Text>
              <Text style={{ fontWeight: 'bold' }}>Description</Text>
              <Text style={{ fontWeight: 'bold' }}>Status</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text>Options ▼</Text>
              <Text>MG 2023</Text>
              <Text>Mandatory Grants 2023</Text>
              <Text>RSA Review completed</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text>Options ▼</Text>
              <Text>MG 2024</Text>
              <Text>Mandatory Grants 2024</Text>
              <Text>Approved</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text>Options ▼</Text>
              <Text>MG 2025</Text>
              <Text>Mandatory Grants 2025</Text>
              <Text>Extension Granted</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SDF/Grant Applicant Profile</Text>
          <Text style={styles.headerSubtitle}>
            You must be linked to the organisation to begin the grant application.
          </Text>
        </View>

        <View style={styles.profileSection}>
          <Text style={styles.profileName}>Lebo{"\n"}Mazibuko</Text>
          <TouchableOpacity style={styles.linkedButton} onPress={toggleLinkedView}>
            <Text style={styles.linkedButtonText}>View Linked Organizations</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.grantCard}>
          <Text style={styles.grantTitle}>Mandatory Grant</Text>
          <Text style={styles.closingLabel}>Application Closes in:</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerBox}>0{"\n"}Days</Text>
            <Text style={styles.timerBox}>05{"\n"}hh</Text>
            <Text style={styles.timerBox}>04{"\n"}mm</Text>
            <Text style={styles.timerBox}>59{"\n"}ss</Text>
          </View>
          <View style={styles.grantDates}>
            <Text style={styles.grantSubText}>Mandatory Grants Applications 2024/25</Text>
            <Text style={styles.grantSubText}>15/02/2025 - 30/04/2025</Text>
          </View>
        </View>

        <View style={styles.grantCard}>
          <Text style={styles.grantTitle}>Discretionary Grant</Text>
          <Text style={styles.closingLabel}>Application Closes in:</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerBox}>0{"\n"}Days</Text>
            <Text style={styles.timerBox}>05{"\n"}hh</Text>
            <Text style={styles.timerBox}>04{"\n"}mm</Text>
            <Text style={styles.timerBox}>59{"\n"}ss</Text>
          </View>
          <View style={styles.grantDates}>
            <Text style={styles.grantSubText}>Discretionary Grants FuturePrenuer 2024/25</Text>
            <Text style={styles.grantSubText}>15/02/2025 - 30/04/2025</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#CE8946" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="calendar" size={24} color="white" />
          <Text style={styles.navText}>Discretionery Grant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="clipboard" size={24} color="white" />
          <Text style={styles.navText}>Mandatory Grant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="school" size={24} color="white" />
          <Text style={styles.navText}>Lesedi Student Fund</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#3A0A53',
    padding: 20,
    borderBottomRightRadius: 60,
  },
  headerTitle: {
    color: '#F7B844',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'white',
    marginTop: 5,
  },
  profileSection: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3A0A53',
  },
  linkedButton: {
    backgroundColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  linkedButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  linkedOrgContainer: {
    margin: 15,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  linkedOrgTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  linkedOrgRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    width: '30%',
  },
  tableCell: {
    width: '30%',
  },
  picker: {
    height: 40,
    width: 150,
  },
  note: {
    fontSize: 12,
    marginTop: 5,
    color: '#3A0A53',
  },
  grantCard: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  grantTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#3A0A53',
  },
  closingLabel: {
    color: '#CE8946',
    fontWeight: '600',
    marginBottom: 10,
  },
  timerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timerBox: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
    textAlign: 'center',
    width: 50,
    color: '#3A0A53',
  },
  grantDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grantSubText: {
    color: '#333',
    fontSize: 12,
  },
  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#3A0A53',
    paddingVertical: 10,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
  },
  navTextActive: {
    color: '#CE8946',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  },
});

export default IMsScreen;