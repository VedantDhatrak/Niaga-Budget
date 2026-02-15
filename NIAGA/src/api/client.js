import axios from 'axios';
import { Alert } from 'react-native';
import ENV from '../config/env';

const client = axios.create({
    baseURL: ENV.API_URL,
    timeout: 30000, // 30 seconds timeout
});

// DEBUG: Show API URL on device
// Alert.alert('Debug API URL', ENV.API_URL);
console.log('API Client Initialized with URL:', ENV.API_URL);

// Add a way to communicate with the UI (ServerStatusContext)
let onServerSlow = null;
let onServerResponded = null;

export const setServerCallbacks = (onSlow, onResponded) => {
    onServerSlow = onSlow;
    onServerResponded = onResponded;
};

client.interceptors.request.use(request => {
    console.log('Starting Request', request.method.toUpperCase(), request.url);

    // Trigger "waking up" state if request takes longer than 2s
    request.metadata = { startTime: new Date() };
    setTimeout(() => {
        if (onServerSlow && !request.completed) {
            onServerSlow();
        }
    }, 2000);

    return request;
});

client.interceptors.response.use(response => {
    console.log('Response:', response.status);
    response.config.completed = true;
    if (onServerResponded) onServerResponded();
    return response;
}, error => {
    console.log('API Error:', error.message);
    if (error.config) error.config.completed = true;
    if (onServerResponded) onServerResponded();

    if (error.response) {
        console.log('Error Data:', error.response.data);
        console.log('Error Status:', error.response.status);
        // Optional: Alert for specific Backend errors if needed
        //Alert.alert('Error', error.response.data.message || 'Something went wrong');
    } else if (error.request) {
        console.log('Error Request (No Response):', error.request);
        // This usually means Network Error or Timeout
        // Alert.alert('Network Error', 'Could not connect to server. Please check your internet or try again.');
    } else {
        // Alert.alert('Error', error.message);
    }
    return Promise.reject(error);
});

export default client;
