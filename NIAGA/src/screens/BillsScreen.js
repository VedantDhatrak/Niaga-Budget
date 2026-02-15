import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, Image, ActivityIndicator, ScrollView, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const BillsScreen = () => {
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? 'dark' : 'light';
    const colors = Colors[theme];
    const { userInfo, userToken } = useContext(AuthContext);

    const [bills, setBills] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // View Modal State
    const [viewModalVisible, setViewModalVisible] = useState(false);
    const [viewingItem, setViewingItem] = useState(null);

    useEffect(() => {
        if (userInfo) {
            fetchBills();
        }
    }, [userInfo]);

    const fetchBills = async (isRefresh = false) => {
        if (!isRefresh) setLoading(true);
        try {
            const res = await client.get(`/bills/${userInfo._id}`);
            setBills(res.data);
        } catch (error) {
            console.log('Error fetching bills:', error);
            const errorMessage = error.response ? `Status: ${error.response.status} - ${error.response.data.message || error.message}` : error.message;
            Alert.alert('Fetch Error', `Failed to fetch bills: ${errorMessage}`);
        } finally {
            if (!isRefresh) setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (loading || refreshing) return;
        setRefreshing(true);
        await fetchBills(true);
        setRefreshing(false);
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setSelectedFile({
                uri: asset.uri,
                type: 'image',
                name: asset.fileName || 'image.jpg',
                base64: asset.base64,
                mimeType: 'image/jpeg'
            });
        }
    };

    const pickDocument = async () => {
        let result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
            copyToCacheDirectory: true,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            try {
                const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: 'base64',
                });
                setSelectedFile({
                    uri: asset.uri,
                    type: 'pdf',
                    name: asset.name,
                    base64: base64,
                    mimeType: 'application/pdf'
                });
            } catch (error) {
                console.log('Error reading file:', error);
                Alert.alert('Error', 'Failed to process file');
            }
        }
    };

    const handleUpload = async () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title');
            return;
        }

        setUploading(true);
        try {
            const payload = {
                userId: userInfo._id,
                title,
                description,
                fileType: selectedFile ? selectedFile.type : null,
                fileData: selectedFile ? selectedFile.base64 : null,
                fileName: selectedFile ? selectedFile.name : null,
                mimeType: selectedFile ? selectedFile.mimeType : null
            };

            await client.post('/bills/upload', payload);
            Alert.alert('Success', 'Bill uploaded successfully');
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setModalVisible(false);
            fetchBills();
        } catch (error) {
            console.log('Upload error:', error);
            const errorMessage = error.response ? `Status: ${error.response.status} - ${error.response.data.message || error.message}` : error.message;
            Alert.alert('Upload Error', `Failed to upload bill: ${errorMessage}`);
        } finally {
            setUploading(false);
        }
    };

    const handleOpenView = (item) => {
        setViewingItem(item);
        setViewModalVisible(true);
    };

    const handleShare = async () => {
        if (!viewingItem || !viewingItem.fileData) return;

        try {
            const fileName = viewingItem.fileName || (viewingItem.fileType === 'pdf' ? `bill_${viewingItem._id}.pdf` : `bill_${viewingItem._id}.jpg`);
            const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

            // Write to cache if not exists (or overwrite to be safe)
            await FileSystem.writeAsStringAsync(fileUri, viewingItem.fileData, {
                encoding: 'base64',
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: viewingItem.mimeType || (viewingItem.fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'),
                    dialogTitle: viewingItem.title,
                    UTI: viewingItem.mimeType // iOS
                });
            } else {
                Alert.alert('Error', 'Sharing is not available');
            }
        } catch (error) {
            console.log('Error sharing file:', error);
            Alert.alert('Error', 'Failed to share file');
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleOpenView(item)}
            activeOpacity={0.7}
        >
            {/* Left Side: Info */}
            <View style={styles.cardInfo}>
                <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[styles.cardDate, { color: colors.textDim }]}>{new Date(item.date).toLocaleDateString()}</Text>
                {item.description ? <Text style={[styles.cardDesc, { color: colors.textDim }]} numberOfLines={2}>{item.description}</Text> : null}
            </View>

            {/* Right Side: Thumbnail */}
            <View style={styles.cardThumbnailContainer}>
                {item.fileType === 'image' && item.fileData ? (
                    <Image
                        source={{ uri: `data:${item.mimeType || 'image/jpeg'};base64,${item.fileData}` }}
                        style={styles.cardThumbnail}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={[styles.cardIconPlaceholder, { backgroundColor: colors.background }]}>
                        <Ionicons
                            name={item.fileType === 'pdf' ? 'document-text' : 'document-outline'}
                            size={30}
                            color={colors.primary}
                        />
                        <Text style={{ fontSize: 8, color: colors.textDim, marginTop: 2 }}>
                            {item.fileType === 'pdf' ? 'PDF' : 'FILE'}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.headerRow}>
                <Text style={[styles.title, { color: colors.text, marginBottom: 0 }]}>Bills Manager</Text>
                <TouchableOpacity onPress={handleRefresh} disabled={refreshing || loading} style={styles.refreshButton}>
                    {(refreshing) ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                        <Ionicons name="refresh" size={24} color={colors.primary} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Upload Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New Bill</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Bill Title"
                            placeholderTextColor={colors.textDim}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                            placeholder="Description (Optional)"
                            placeholderTextColor={colors.textDim}
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={[styles.fileButton, { backgroundColor: colors.primary + '20' }]} onPress={pickImage}>
                                <Ionicons name="image" size={20} color={colors.primary} />
                                <Text style={[styles.fileButtonText, { color: colors.primary }]}>Pick Image</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.fileButton, { backgroundColor: colors.primary + '20' }]} onPress={pickDocument}>
                                <Ionicons name="document" size={20} color={colors.primary} />
                                <Text style={[styles.fileButtonText, { color: colors.primary }]}>Pick PDF</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedFile && (
                            <View style={styles.previewContainer}>
                                <Text style={[styles.previewText, { color: colors.text }]}>Selected: {selectedFile.name}</Text>
                                {selectedFile.type === 'image' && (
                                    <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} />
                                )}
                                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                    <Text style={{ color: 'red', marginTop: 5 }}>Remove</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[styles.uploadButton, { backgroundColor: colors.primary, opacity: uploading ? 0.7 : 1 }]}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.uploadButtonText}>Upload Bill</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* View Modal (Maximized Image/PDF) */}
            <Modal
                animationType="fade"
                transparent={false}
                visible={viewModalVisible}
                onRequestClose={() => setViewModalVisible(false)}
            >
                <SafeAreaView style={[styles.viewModalContainer, { backgroundColor: 'black' }]}>
                    <View style={styles.viewModalHeader}>
                        <Text style={[styles.viewModalTitle, { color: 'white' }]} numberOfLines={1}>
                            {viewingItem?.title}
                        </Text>
                        <TouchableOpacity onPress={() => setViewModalVisible(false)} style={styles.closeButton}>
                            <Ionicons name="close-circle" size={30} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.viewModalContent}>
                        {viewingItem?.fileType === 'image' && viewingItem?.fileData ? (
                            <Image
                                source={{ uri: `data:${viewingItem.mimeType || 'image/jpeg'};base64,${viewingItem.fileData}` }}
                                style={styles.fullImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <View style={styles.pdfPlaceholder}>
                                <Ionicons name="document-text" size={100} color="white" />
                                <Text style={{ color: 'white', marginTop: 20, fontSize: 18 }}>
                                    {viewingItem?.fileName || 'PDF Document'}
                                </Text>
                                <Text style={{ color: '#aaa', marginTop: 10 }}>
                                    Tap Share to view/open the PDF
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.viewModalFooter}>
                        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                            <Ionicons name="share-social" size={24} color="white" />
                            <Text style={styles.shareButtonText}>Share</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </Modal>

            {/* Debug Info for APK */}
            {/* <View style={{ padding: 10, backgroundColor: '#333', margin: 10, borderRadius: 8 }}>
                <Text style={{ color: 'yellow', fontSize: 10 }}>Debug API: {client.defaults.baseURL}</Text>
                {bills.length === 0 && !loading && (
                    <Text style={{ color: 'red', fontSize: 10, marginTop: 4 }}>
                        No bills found. If this is unexpected, check API connection.
                    </Text>
                )}
            </View> */}

            {/* List */}
            {loading ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={bills}
                    keyExtractor={item => item._id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={<Text style={{ color: colors.textDim, textAlign: 'center', marginTop: 20 }}>No bills uploaded yet.</Text>}
                />
            )}

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    refreshButton: {
        padding: 8,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 9,
    },

    // Upload Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    fileButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 8, marginHorizontal: 4 },
    fileButtonText: { marginLeft: 8, fontWeight: '600' },
    previewContainer: { alignItems: 'center', marginBottom: 12 },
    previewText: { marginBottom: 8 },
    previewImage: { width: 100, height: 100, borderRadius: 8 },
    uploadButton: { padding: 16, borderRadius: 8, alignItems: 'center' },
    uploadButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

    // List & Cards
    sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
    listContent: { paddingBottom: 80 },
    card: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        alignItems: 'center'
    },
    cardInfo: {
        flex: 1,
        paddingRight: 10
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold' },
    cardDate: { fontSize: 13, marginTop: 2 },
    cardDesc: { fontSize: 14, marginTop: 4, opacity: 0.8 },

    cardThumbnailContainer: {
        width: 60,
        height: 60,
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee'
    },
    cardThumbnail: {
        width: '100%',
        height: '100%',
    },
    cardIconPlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },

    // View Modal
    viewModalContainer: {
        flex: 1,
    },
    viewModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    viewModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10
    },
    closeButton: {
        padding: 4
    },
    viewModalContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10
    },
    fullImage: {
        width: '100%',
        height: '100%',
    },
    pdfPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    viewModalFooter: {
        padding: 16,
        paddingBottom: 30, // Extra padding for bottom (safe area usually handled, but this is explicit)
        borderTopWidth: 1,
        borderTopColor: '#333'
    },
    shareButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Left aligned
    },
    shareButtonText: {
        color: 'white',
        fontSize: 18,
        marginLeft: 10,
        fontWeight: '600'
    }
});

export default BillsScreen;
