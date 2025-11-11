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

export type Product = {
  id: string;
  name: string;
  image?: string | null;
  price?: number | string;
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

  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error("Не удалось загрузить товары");
    }
    return response.json();
  },

  async updateProductImage(
    token: string,
    productId: string,
    image: string
  ): Promise<Product> {
    const response = await fetch(`${API_URL}/products/${productId}/image`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ image }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Не удалось обновить картинку товара");
    }

    return response.json();
  },
};
