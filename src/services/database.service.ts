import { api } from "./api";

// Definindo a tipagem da resposta paginada
export interface DatabaseItem {
    name: string;
    size: string;
}

export interface PaginatedResponse {
    data: DatabaseItem[];
    meta: {
        page: number;
        limit: number;
        totalItems: number;
        totalPages: number;
    }
}

export async function getDatabases(page = 1, limit = 9, search = '') {
    // Enviamos como params na URL
    const response = await api.get<PaginatedResponse>('api/databases', {
        params: {
            page,
            limit,
            search
        }/* , headers:{
            'x-api-key': import.meta.env.VITE_ADMIN_API_KEY,
        } */
    });
    return response.data;
}

export async function createDatabase(name: string) {

    const username = localStorage.getItem("authUsername")
    const response = await api.post(
        'api/databases/createDatabase', // URL completa conforme sua rota
        { name,  username}, // Body do POST
        {
            /* headers: {
                'x-api-key': import.meta.env.VITE_ADMIN_API_KEY,
            } */
        }
    );
    return response.data;
}