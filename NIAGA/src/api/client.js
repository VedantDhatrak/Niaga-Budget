import axios from 'axios';
import ENV from '../config/env';

const client = axios.create({
    baseURL: ENV.API_URL,
});

console.log('API Client Initialized with URL:', ENV.API_URL);

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
