import { api } from "./api"; // Sua instância do axios configurada com VITE_URLBASE

export interface NewsItem {
  id: number;
  title: string;
  description: string;
  type: 'feature' | 'update' | 'maintenance' | 'alert';
  created_at: string;
}

export async function getLatestNews() {
  const response = await api.get<NewsItem[]>('/api/news/latest');
  return response.data;
}