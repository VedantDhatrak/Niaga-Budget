import { Platform } from 'react-native';

const LIVE_URL = 'https://niaga-budget.onrender.com/api';
const LOCAL_URL_IOS = 'http://localhost:5000/api';
// Use your machine's LAN IP for Android physical device or 10.0.2.2 for emulator if needed
// Currently set to the IP found in your previous client.js
const LOCAL_URL_ANDROID = 'http://192.168.29.73:5000/api';

const ENV = {
    dev: 'development',
    prod: 'production',
};

// CHANGE THIS VAR TO SWITCH ENVIRONMENTS
// Options: ENV.dev | ENV.prod
// const CURRENT_ENV = ENV.prod;
const CURRENT_ENV = ENV.dev;

const getBaseUrl = () => {
    if (CURRENT_ENV === ENV.prod) {
        return LIVE_URL;
    }

    if (Platform.OS === 'android') {
        return LOCAL_URL_ANDROID;
    }

    return LOCAL_URL_IOS;
};

export default {
    API_URL: getBaseUrl(),
    ENV: CURRENT_ENV,
};
