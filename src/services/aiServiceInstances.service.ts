import axios from 'axios';

const AI_SERVICES_BASE_URL = (
  import.meta.env.VITE_AI_SERVICES_BASE_URL || '/ai-services'
).replace(/\/+$/, '');

const aiServicesApi = axios.create({
  baseURL: AI_SERVICES_BASE_URL,
  timeout: 30000,
});

function buildNoCacheParams(params?: Record<string, string | number>) {
  return {
    ...params,
    _ts: Date.now(),
  };
}

export interface AiServiceInstance {
  nome: string;
  status: string;
  porta: string;
}

export interface CreateAiServiceInstancePayload {
  nome: string;
  openai_api_key: string;
  db_host: string;
  db_port: string | number;
  db_name: string;
  db_user: string;
  db_password: string;
  unidade_negocio_id: string | number;
}

export interface AiServiceInstanceStatus {
  nome: string;
  pm2_id: number | null;
  status: string;
  uptime: number | null;
  reinicializacoes: number;
  memoria_mb: number;
  cpu_percent: number;
  porta: string;
}

export interface AiServiceInstanceLogs {
  nome: string;
  linhas: string[];
}

export async function createAiServiceInstance(
  payload: CreateAiServiceInstancePayload,
) {
  const response = await aiServicesApi.post('/api/ia/criar', payload);
  return response.data;
}

export async function listAiServiceInstances(): Promise<AiServiceInstance[]> {
  const response = await aiServicesApi.get('/api/ia/listar', {
    params: buildNoCacheParams(),
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  });
  return response.data?.instancias ?? [];
}

export async function fetchAiServiceInstanceStatus(
  nome: string,
): Promise<AiServiceInstanceStatus> {
  const response = await aiServicesApi.get(
    `/api/ia/${encodeURIComponent(nome)}/status`,
    {
      params: buildNoCacheParams(),
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    },
  );

  return response.data;
}

export async function fetchAiServiceInstanceLogs(
  nome: string,
  linhas = 50,
): Promise<AiServiceInstanceLogs> {
  const response = await aiServicesApi.get(
    `/api/ia/${encodeURIComponent(nome)}/logs`,
    {
      params: buildNoCacheParams({ linhas }),
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    },
  );

  return response.data;
}

export async function restartAiServiceInstance(nome: string) {
  const response = await aiServicesApi.post(
    `/api/ia/${encodeURIComponent(nome)}/reiniciar`,
  );

  return response.data;
}

export async function stopAiServiceInstance(nome: string) {
  const response = await aiServicesApi.post(
    `/api/ia/${encodeURIComponent(nome)}/parar`,
  );

  return response.data;
}
