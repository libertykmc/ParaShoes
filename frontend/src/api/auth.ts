const API_BASE_URL = 'http://localhost:3000';

export interface AuthResponse {
  access_token: string;
}

export interface BackendUser {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  role: string;
  bonusPoints: number;
  avatar?: string;
  createdAt: string;
}

export interface FrontendUser {
  id: string;
  name: string; // отображаемое ФИО или логин
  email: string;
  phone: string;
  address: string;
  bonusPoints: number;
  avatar?: string;
  role: string;
}

function transformUser(user: BackendUser): FrontendUser {
  const hasFullName = (user.firstName && user.firstName.trim()) || (user.lastName && user.lastName.trim());
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();

  return {
    id: user.id,
    name: hasFullName ? fullName : user.username,
    email: user.email,
    phone: user.phone || '',
    address: user.address || '',
    bonusPoints: user.bonusPoints,
    avatar: user.avatar,
    role: user.role,
  };
}

export function getToken(): string | null {
  return localStorage.getItem('access_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
}

export async function register(data: {
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ошибка регистрации: ${response.status}`);
  }

  const json = (await response.json()) as AuthResponse;
  return json.access_token;
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Ошибка входа: ${response.status}`);
  }

  const json = (await response.json()) as AuthResponse;
  return json.access_token;
}

export async function fetchCurrentUser(): Promise<FrontendUser> {
  const token = getToken();
  if (!token) {
    throw new Error('Нет токена авторизации');
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
    }
    const text = await response.text();
    throw new Error(text || `Ошибка получения профиля: ${response.status}`);
  }

  const data = (await response.json()) as BackendUser;
  return transformUser(data);
}


