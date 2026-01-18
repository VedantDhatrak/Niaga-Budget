import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 for localhost. 
// iOS Simulator uses localhost.
// Physical device needs your machine's LAN IP (e.g., http://192.168.1.5:5000)
const DEV_URL = Platform.OS === 'android' ? 'http://192.168.29.73:5000/api' : 'http://localhost:5000/api';

const client = axios.create({
    baseURL: DEV_URL,
});

console.log('API Client Initialized with URL:', DEV_URL);

client.interceptors.request.use(request => {
    console.log('Starting Request', request.method.toUpperCase(), request.url);
    return request;
});

client.interceptors.response.use(response => {
    console.log('Response:', response.status);
    return response;
}, error => {
    console.log('API Error:', error.message);
    if (error.response) {
        console.log('Error Data:', error.response.data);
        console.log('Error Status:', error.response.status);
    } else if (error.request) {
        console.log('Error Request (No Response):', error.request);
    }
    return Promise.reject(error);
});

export default client;
