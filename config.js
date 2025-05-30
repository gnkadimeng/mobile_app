// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Image,
//   ImageBackground,
//   ActivityIndicator,
//   TouchableOpacity,
//   Linking,
//   Alert,
//   Platform,
//   Modal,
//   Dimensions
// } from 'react-native';
// import { DataTable, Card } from 'react-native-paper';
// import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
// import * as FileSystem from 'expo-file-system';
// import * as Sharing from 'expo-sharing';
// import { LinearGradient } from 'expo-linear-gradient';
// import axios from 'axios';

// const DocumentsScreen = ({ email, onNavigateBack }) => {
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [downloading, setDownloading] = useState(false);
//   const [selectedDocument, setSelectedDocument] = useState(null);

//   useEffect(() => {
//     if (email) {
//       fetchDocuments(email);
//     }
//   }, [email]);

//   const fetchDocuments = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`http://172.20.10.14:5000/documents`);
//       console.log("Documents API Response:", response.data);
//       setDocuments(response.data);
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//       Alert.alert("Error", "Failed to fetch documents");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = async (document) => {
//     if (!document.file_url) {
//       Alert.alert('Error', 'Document URL not available');
//       return;
//     }

//     try {
//       setDownloading(true);
      
//       // Extract filename from URL
//       const filename = document.file_name || document.file_url.split('/').pop();
//       const fileExtension = filename.split('.').pop().toLowerCase();
      
//       // Define local file path
//       const localUri = `${FileSystem.documentDirectory}${filename}`;
      
//       // Download the file
//       const downloadResumable = FileSystem.createDownloadResumable(
//         document.file_url,
//         localUri,
//         {},
//       );

//       const { uri } = await downloadResumable.downloadAsync();
      
//       // Check if we can share/open the file
//       if (await Sharing.isAvailableAsync()) {
//         // For PDFs, Word docs, etc. - open with system viewer
//         if (['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(fileExtension)) {
//           await Sharing.shareAsync(uri);
//         } else {
//           // For other file types, try to open with default app
//           await Linking.openURL(uri);
//         }
        
//         Alert.alert('Success', 'Document downloaded and opened');
//       } else {
//         Alert.alert('Success', `Document downloaded to: ${uri}`);
//       }
//     } catch (error) {
//       console.error('Download error:', error);
//       Alert.alert('Error', 'Failed to download document');
//     } finally {
//       setDownloading(false);
//     }
//   };

//   const handleViewDocument = async (document) => {
//     if (!document.file_url) {
//       Alert.alert('Error', 'Document URL not available');
//       return;
//     }

//     try {
//       // Check if the URL can be opened
//       const supported = await Linking.canOpenURL(document.file_url);
      
//       if (supported) {
//         await Linking.openURL(document.file_url);
//       } else {
//         Alert.alert('Error', "Don't know how to open this URL");
//       }
//     } catch (error) {
//       console.error('Error opening URL:', error);
//       Alert.alert('Error', 'Failed to open document');
//     }
//   };

//   return (
//     <ImageBackground
//       source={require("../assets/images/home2.png")}
//       style={styles.background}
//       imageStyle={styles.backgroundImage}
//     >
//       <LinearGradient colors={["#3A0DAD", "#6A0DAD"]} style={styles.navbar}>
//         <View style={styles.navbarContent}>
//           <Text style={styles.title}>All Documents</Text>
//           <TouchableOpacity style={styles.logoutButton} onPress={onNavigateBack}>
//             <MaterialIcons name="logout" size={24} color="white" />
//             <Text style={styles.logoutText}>Back</Text>
//           </TouchableOpacity>
//         </View>
//       </LinearGradient>

//       <View style={styles.logoContainer}>
//         <Image source={require("../assets/images/chieta_logo.png")} style={styles.logo} />
//       </View>

//       <ScrollView style={styles.container}>
//         {loading ? (
//           <ActivityIndicator size="large" color="#6A0DAD" />
//         ) : (
//           <LinearGradient colors={["#6A0DAD", "#3A0DAD"]} style={styles.section}>
//             <Text style={styles.sectionTitle}>All Documents</Text>
//             <Card style={styles.dataTableCard}>
//               <DataTable>
//                 <DataTable.Header>
//                   <DataTable.Title style={styles.cellWrapper}>
//                     <Text style={styles.headerTitle}>Document Name</Text>
//                   </DataTable.Title>
//                   <DataTable.Title style={styles.cellWrapper}>
//                     <Text style={styles.headerTitle}>Type</Text>
//                   </DataTable.Title>
//                   <DataTable.Title style={styles.cellWrapper}>
//                     <Text style={styles.headerTitle}>Date</Text>
//                   </DataTable.Title>
//                   <DataTable.Title style={styles.cellWrapper}>
//                     <Text style={styles.headerTitle}>Actions</Text>
//                   </DataTable.Title>
//                 </DataTable.Header>

//                 {documents.map((doc, index) => (
//                   <DataTable.Row
//                     key={index}
//                     onPress={() => setSelectedDocument(doc)}
//                   >
//                     <DataTable.Cell style={styles.cellWrapper}>
//                       <Text style={styles.wrappedText} numberOfLines={2}>{doc.file_name}</Text>
//                     </DataTable.Cell>
//                     <DataTable.Cell style={styles.cellWrapper}>
//                       <Text style={styles.wrappedText}>{doc.document_type}</Text>
//                     </DataTable.Cell>
//                     <DataTable.Cell style={styles.cellWrapper}>
//                       <Text style={styles.wrappedText}>{new Date(doc.uploaded_at).toLocaleDateString()}</Text>
//                     </DataTable.Cell>
//                     <DataTable.Cell style={styles.cellWrapper}>
//                       <View style={styles.actionsContainer}>
//                         <TouchableOpacity 
//                           onPress={() => handleViewDocument(doc)}
//                           style={styles.actionButton}
//                         >
//                           <FontAwesome name="eye" size={20} color="#3A0DAD" />
//                         </TouchableOpacity>
//                         <TouchableOpacity 
//                           onPress={() => handleDownload(doc)}
//                           style={styles.actionButton}
//                           disabled={downloading}
//                         >
//                           <FontAwesome 
//                             name="download" 
//                             size={20} 
//                             color={downloading ? "#999" : "#6A0DAD"} 
//                           />
//                         </TouchableOpacity>
//                       </View>
//                     </DataTable.Cell>
//                   </DataTable.Row>
//                 ))}
//               </DataTable>
//             </Card>
//           </LinearGradient>
//         )}
//       </ScrollView>

//       <LinearGradient colors={["#3A0DAD", "#6A0DAD"]} style={styles.footer}>
//         <Text style={styles.footerText}>Copyright © 2025, CHIETA. All rights reserved.</Text>
//       </LinearGradient>

//       {/* Document Details Modal */}
//       <Modal
//         visible={!!selectedDocument}
//         transparent={true}
//         animationType="fade"
//         onRequestClose={() => setSelectedDocument(null)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setSelectedDocument(null)}
//         >
//           <View style={styles.modalContent}>
//             {selectedDocument && (
//               <>
//                 <Text style={styles.modalTitle}>Document Details</Text>
//                 <Text style={styles.modalText}>
//                   <Text style={styles.boldText}>Name: </Text>
//                   {selectedDocument.file_name}
//                 </Text>
//                 <Text style={styles.modalText}>
//                   <Text style={styles.boldText}>Type: </Text>
//                   {selectedDocument.document_type}
//                 </Text>
//                 <Text style={styles.modalText}>
//                   <Text style={styles.boldText}>Uploaded: </Text>
//                   {new Date(selectedDocument.uploaded_at).toLocaleDateString()}
//                 </Text>
//                 <View style={styles.modalButtons}>
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.viewButton]}
//                     onPress={() => {
//                       setSelectedDocument(null);
//                       handleViewDocument(selectedDocument);
//                     }}
//                   >
//                     <FontAwesome name="eye" size={16} color="white" />
//                     <Text style={styles.modalButtonText}>View</Text>
//                   </TouchableOpacity>
//                   <TouchableOpacity 
//                     style={[styles.modalButton, styles.downloadButton]}
//                     onPress={() => {
//                       setSelectedDocument(null);
//                       handleDownload(selectedDocument);
//                     }}
//                     disabled={downloading}
//                   >
//                     <FontAwesome 
//                       name="download" 
//                       size={16} 
//                       color="white" 
//                     />
//                     <Text style={styles.modalButtonText}>
//                       {downloading ? 'Downloading...' : 'Download'}
//                     </Text>
//                   </TouchableOpacity>
//                 </View>
//               </>
//             )}
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </ImageBackground>
//   );
// };

// const styles = StyleSheet.create({
//   background: { flex: 1, justifyContent: "space-between" },
//   backgroundImage: { resizeMode: "contain", position: "absolute", bottom: 0, left: 0, width: "30%", height: "30%" },
//   navbar: {
//     height: 80,
//     paddingHorizontal: 16,
//     paddingTop: 20,
//   },
//   navbarContent: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   title: {
//     color: "white",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   logoutButton: { 
//     flexDirection: "row", 
//     alignItems: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     borderRadius: 20,
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//   },
//   logoutText: { 
//     color: "white", 
//     fontSize: 16, 
//     marginLeft: 5,
//     fontWeight: "bold",
//   },
//   logoContainer: { 
//     justifyContent: "center", 
//     alignItems: "center", 
//     marginTop: 20,
//     marginBottom: 10,
//   },
//   logo: { 
//     width: 200, 
//     height: 80, 
//     resizeMode: "contain" 
//   },
//   container: { 
//     flex: 1, 
//     backgroundColor: "#F8F8F8", 
//     padding: 16 
//   },
//   section: { 
//     marginBottom: 20, 
//     borderRadius: 12, 
//     padding: 16, 
//     elevation: 4,
//     minHeight: Dimensions.get('window').height * 0.5,
//   },
//   dataTableCard: {
//     marginBottom: 16,
//     borderRadius: 12,
//     elevation: 4,
//     backgroundColor: "white",
//     padding: 8,
//     overflow: "hidden",
//   },
//   sectionTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "white",
//     marginBottom: 16,
//     textAlign: "center",
//   },
//   footer: { 
//     padding: 20, 
//     alignItems: "center" 
//   },
//   footerText: { 
//     color: "white", 
//     fontSize: 14 
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 20,
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 20,
//     borderRadius: 8,
//     width: "90%",
//   },
//   modalTitle: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 16,
//     textAlign: "center",
//     color: "#6A0DAD",
//   },
//   modalText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
//   boldText: {
//     fontWeight: "bold",
//   },
//   modalButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: 20,
//   },
//   modalButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 20,
//   },
//   viewButton: {
//     backgroundColor: '#3A0DAD',
//   },
//   downloadButton: {
//     backgroundColor: '#6A0DAD',
//   },
//   modalButtonText: {
//     color: 'white',
//     marginLeft: 8,
//     fontWeight: 'bold',
//   },
//   cellWrapper: {
//     flex: 1,
//     paddingVertical: 8,
//   },
//   wrappedText: {
//     flexWrap: 'wrap',
//     flexShrink: 1,
//   },
//   headerTitle: {
//     fontWeight: 'bold',
//     flexWrap: 'wrap',
//     flexShrink: 1,
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   actionButton: {
//     padding: 8,
//   },
// });

// export default DocumentsScreen;