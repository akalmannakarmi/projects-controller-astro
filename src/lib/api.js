
const API_URL = "http://localhost:8000/api/v1"; // change to your backend URL

export async function login(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();

  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("refresh_token", data.refresh_token);
  return data;
}

export async function refreshToken() {
  const refresh_token = localStorage.getItem("refresh_token");
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) throw new Error("Refresh failed");
  const data = await res.json();
  localStorage.setItem("access_token", data.access_token);
  return data.access_token;
}


async function fetchWithAuth(url, options = {}) {
  let access_token = localStorage.getItem("access_token");

  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    },
  });

  // If access token expired
  if (res.status === 401) {
    try {
      // Try to refresh
      const newToken = await refreshToken();
      const retry = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "application/json",
        },
      });
      return retry;
    } catch (err) {
      // Refresh failed, redirect to login
      console.warn("Refresh failed, redirecting to login...", err);
      localStorage.clear(); // clear any stale tokens
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      // stop execution
      throw new Error("Session expired, redirecting to login");
    }
  }

  return res;
}

// PROJECT ENDPOINTS

export async function createProject({ name, instanceId }) {
  const res = await fetchWithAuth(`${API_URL}/project`, {
    method: "POST",
    body: JSON.stringify({ name, instanceId }),
  });
  if (!res.ok) throw new Error("Failed to create project");
  return res.json();
}

export async function updateProject(id, { name, instanceId }) {
  const res = await fetchWithAuth(`${API_URL}/project/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name, instanceId }),
  });
  if (!res.ok) throw new Error("Failed to update project");
  return res.json();
}

export async function getProjects() {
  const res = await fetchWithAuth(`${API_URL}/project?skip=0&limit=20`);
  return await res.json();
}

export async function getProjectById(id) {
  const res = await fetchWithAuth(`${API_URL}/project/${id}`);
  return await res.json();
}

export async function startProject(id) {
  return await fetchWithAuth(`${API_URL}/project/${id}/start`, { method: "POST" });
}

export async function stopProject(id) {
  return await fetchWithAuth(`${API_URL}/project/${id}/stop`, { method: "POST" });
}

export async function deleteProject(id) {
  return await fetchWithAuth(`${API_URL}/project/${id}`, { method: "DELETE" });
}

export async function getProjectStatus(id) {
  const res = await fetchWithAuth(`${API_URL}/project/${id}/status`);
  if (!res.ok) throw new Error("Failed to fetch project status");
  return res.json();
}

export async function logout() {
  const refresh_token = localStorage.getItem("refresh_token");
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  localStorage.clear();
}
