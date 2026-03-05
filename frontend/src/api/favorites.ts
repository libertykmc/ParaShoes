import { getToken, setToken } from './auth';

const API_BASE_URL = 'http://localhost:3001';

interface FavoriteResponseItem {
  id: string;
  userId: string;
  productId: string;
}

function getAuthHeaders(): HeadersInit {
  const token = getToken();
  if (!token) {
    throw new Error('Нет токена авторизации');
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

async function readError(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  return text || fallback;
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
    }
    throw new Error(await readError(response, `Ошибка загрузки избранного: ${response.status}`));
  }

  const data = (await response.json()) as FavoriteResponseItem[];
  return data.map((item) => item.productId);
}

export async function addToFavorites(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 409) {
    if (response.status === 401) {
      setToken(null);
    }
    throw new Error(await readError(response, `Ошибка добавления в избранное: ${response.status}`));
  }
}

export async function removeFromFavorites(productId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/favorites/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok && response.status !== 404) {
    if (response.status === 401) {
      setToken(null);
    }
    throw new Error(await readError(response, `Ошибка удаления из избранного: ${response.status}`));
  }
}
