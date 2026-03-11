import { API_BASE_URL } from "../config";

export async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    Authorization: `Bearer ${token}`
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Токен истек или недействителен
    localStorage.removeItem("token");
    // Сообщаем всему приложению, что нужно выйти
    window.dispatchEvent(new CustomEvent("unauthorized"));
    throw new Error("Session expired");
  }

  return response;
}