const API_URL = "http://localhost:3000";

export interface LoginResponse {
  access_token: string;
}

export type User = {
  id: number;
  email: string;
  role: string;
  avatar: string | null;
};

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ошибка входа");
    }

    return response.json();
  },

  async register(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Ошибка регистрации");
    }

    return response.json();
  },

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Ошибка получения профиля");
    }

    return response.json();
  },

  async updateAvatar(token: string, avatar: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/me/avatar`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar }),
    });

    if (!response.ok) {
      throw new Error("Ошибка обновления аватара");
    }

    return response.json();
  },
};
