import axios from 'axios';

const API_BASE = import.meta.env.VITE_URLBASE || 'https://unicocontato.tech';

export interface AiInstallationItem {
  id: number;
  instance: string;
  provider: string;
  assistantId: string | null;
  assistantName: string | null;
  installedVersion: number | null;
  currentVersion: number | null;
  updateAvailable: boolean;
  canUpdate: boolean;
  source: string;
  configSnapshot: Record<string, unknown> | null;
  preProcessId: string | null;
  buscaProdutosId: string | null;
  downloadImagemId: string | null;
  uraIaId: string | null;
  uraAbId: string | null;
  lastSyncStatus: string;
  lastSyncError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateAiInstallationInput {
  id: number;
  username: string;
  password: string;
  code: string;
  force?: boolean;
}

export interface UpdateAiInstallationResult {
  updated: boolean;
  message: string;
  installation?: AiInstallationItem;
}

export interface UpdateAllAiInstallationsInput {
  username: string;
  password: string;
  code: string;
  instance?: string;
  provider?: string;
  force?: boolean;
}

export interface UpdateAllAiInstallationsResultItem {
  id: number;
  instance: string;
  provider: string;
  assistantName: string | null;
  updated: boolean;
  success: boolean;
  message: string;
}

export interface UpdateAllAiInstallationsResult {
  total: number;
  updated: number;
  failed: number;
  results: UpdateAllAiInstallationsResultItem[];
}

export async function fetchAiInstallations(params?: {
  limit?: number;
  instance?: string;
  provider?: string;
}): Promise<AiInstallationItem[]> {
  const response = await axios.get(`${API_BASE}/api/ia/installations`, {
    params,
  });

  return response.data?.data ?? [];
}

export async function updateAiInstallation(
  input: UpdateAiInstallationInput,
): Promise<UpdateAiInstallationResult> {
  const response = await axios.post(
    `${API_BASE}/api/ia/installations/${input.id}/update`,
    {
      username: input.username,
      password: input.password,
      code: input.code,
      force: input.force ?? false,
    },
  );

  return response.data;
}

export async function updateAllAiInstallations(
  input: UpdateAllAiInstallationsInput,
): Promise<UpdateAllAiInstallationsResult> {
  const response = await axios.post(
    `${API_BASE}/api/ia/installations/update-all`,
    {
      username: input.username,
      password: input.password,
      code: input.code,
      instance: input.instance,
      provider: input.provider,
      force: input.force ?? false,
    },
  );

  return response.data;
}
