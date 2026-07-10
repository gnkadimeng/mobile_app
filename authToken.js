// Central place for the JWT the backend now issues at /login.
// Sets it as the default Authorization header for all axios calls and persists
// it so the session survives app restarts.
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const KEY = 'auth_token';

export async function setAuthToken(token) {
  if (!token) return;
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  try { await AsyncStorage.setItem(KEY, token); } catch (e) { /* non-fatal */ }
}

// Call once on app start so returning users are authenticated.
export async function loadAuthToken() {
  try {
    const t = await AsyncStorage.getItem(KEY);
    if (t) axios.defaults.headers.common.Authorization = `Bearer ${t}`;
    return t;
  } catch (e) {
    return null;
  }
}

export async function clearAuthToken() {
  delete axios.defaults.headers.common.Authorization;
  try { await AsyncStorage.removeItem(KEY); } catch (e) { /* non-fatal */ }
}
