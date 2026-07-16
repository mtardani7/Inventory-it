import api from "@/lib/axios";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

class AuthService {
  clearToken() {
    localStorage.removeItem("token");
  }

  saveToken(token: string) {
    localStorage.setItem("token", token);
  }

  async login(payload: LoginRequest) {
    const { data } = await api.post<LoginResponse>("/login", payload);

    this.saveToken(data.token);

    return data;
  }

  async me() {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    const { data } = await api.get<User>("/user");

    return data;
  }

  async logout() {
    await api.post("/logout");

    this.clearToken();
  }

  isAuthenticated() {
    if (typeof window === "undefined") {
      return false;
    }

    return !!localStorage.getItem("token");
  }

  getToken() {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem("token");
  }
}

export default new AuthService();