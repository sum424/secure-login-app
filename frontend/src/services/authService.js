import axios from 'axios';
const API = axios.create({ baseURL: 'http://localhost:5000/api/auth' });

async function login(payload) {
  const resp = await API.post('/login', payload);
  return resp.data;
}

async function register(payload) {
  const resp = await API.post('/register', payload);
  return resp.data;
}

export default { login, register };
