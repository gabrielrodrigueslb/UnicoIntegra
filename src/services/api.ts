import axios from 'axios';

const API_BASE = (import.meta.env.VITE_URLBASE || 'https://unicocontato.tech').replace(
  /\/+$/,
  '',
);

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});
