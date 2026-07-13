import { api } from './api';
import { requireAuthSession } from '../utils/authSession';

export type ClientProvider = 'api' | 'file' | 'alpha7';

export interface Client {
  id: number;
  name: string;
  businessUnit: string | null;
  cnpj: string | null;
  clientInstance: string | null;
  provider: ClientProvider;
  instance: string;
  providerConfig: string;
  hasCredential: boolean;
  credentialHint: string | null;
  alpha7Port: number | null;
  alpha7Database: string | null;
  alpha7User: string | null;
  alpha7Schema: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CreateClientPayload {
  name: string;
  businessUnit?: string;
  cnpj?: string;
  clientInstance: string;
  provider: ClientProvider;
  instance: string;
  credential?: string;
  alpha7Port?: number;
  alpha7Database?: string;
  alpha7User?: string;
  alpha7Schema?: string;
  username?: string;
}

export async function listClients(params: { page?: number; limit?: number; search?: string } = {}) {
  const response = await api.get<PaginatedResponse<Client>>('api/clients', { params });
  return response.data;
}

export async function getClient(id: number) {
  const response = await api.get<Client>(`api/clients/${id}`);
  return response.data;
}

export async function createClient(payload: CreateClientPayload) {
  const username = requireAuthSession().authUsername;
  const response = await api.post<Client>('api/clients', {
    ...payload,
    username,
  });
  return response.data;
}

export interface UpdateClientPayload {
  name?: string;
  businessUnit?: string;
  cnpj?: string;
  clientInstance?: string;
  provider?: ClientProvider;
  instance?: string;
  credential?: string;
  alpha7Port?: number;
  alpha7Database?: string;
  alpha7User?: string;
  alpha7Schema?: string;
  username?: string;
}

export async function updateClient(id: number, payload: UpdateClientPayload) {
  const username = requireAuthSession().authUsername;
  const response = await api.put<Client>(`api/clients/${id}`, {
    ...payload,
    username,
  });
  return response.data;
}

export async function deleteClient(id: number) {
  const username = requireAuthSession().authUsername;
  await api.delete(`api/clients/${id}`, {
    data: { username },
  });
}
