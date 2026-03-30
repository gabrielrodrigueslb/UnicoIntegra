import axios from 'axios';

export type ChatHistoryRole = 'user' | 'assistant';

export interface ChatHistoryItem {
  role: ChatHistoryRole;
  content: string;
}

export interface ChatAction {
  type: 'download' | string;
  url: string;
  label?: string;
}

export interface ChatSessionContext {
  authUsername?: string;
  authPassword?: string;
  operatorName?: string;
}

export interface ChatTraceStep {
  id: string;
  message: string;
  status: 'info' | 'success' | 'error';
}

export interface ChatResponse {
  reply: string;
  action: ChatAction | null;
  trace: ChatTraceStep[];
}

const LINK_AI_API_BASE = (
  import.meta.env.VITE_URLBASE || 'http://localhost:4000'
).replace(/\/+$/, '');
const LINK_AI_REQUEST_TIMEOUT_MS = 10 * 60 * 1000;

const linkAiApi = axios.create({
  baseURL: LINK_AI_API_BASE,
  timeout: LINK_AI_REQUEST_TIMEOUT_MS,
});

function resolveApiUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return new URL(url.startsWith('/') ? url : `/${url}`, `${LINK_AI_API_BASE}/`).toString();
}

export async function sendChatMessage(payload: {
  message: string;
  history: ChatHistoryItem[];
  sessionContext?: ChatSessionContext;
}) {
  const response = await linkAiApi.post<ChatResponse>('/chat', payload);

  if (response.data.action?.url) {
    response.data.action.url = resolveApiUrl(response.data.action.url);
  }

  return response.data;
}
