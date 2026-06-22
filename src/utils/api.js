const API_BASE = '';

function getToken() {
  return localStorage.getItem('ttt_token') || sessionStorage.getItem('ttt_token');
}

export async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function login(code, rememberMe) {
  const { getDeviceFingerprint } = await import('./device.js');
  const deviceFingerprint = await getDeviceFingerprint();

  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ code, rememberMe, deviceFingerprint }),
  });
}

export async function logout() {
  try {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  } catch (e) {}
  localStorage.removeItem('ttt_token');
  sessionStorage.removeItem('ttt_token');
}

export async function getSession() {
  return apiFetch('/api/auth/session');
}

export async function getContacts() {
  return apiFetch('/api/contacts');
}

export async function createContact(name, code) {
  return apiFetch('/api/contacts', {
    method: 'POST',
    body: JSON.stringify({ name, code }),
  });
}

export async function deleteContact(code) {
  return apiFetch(`/api/contacts/${code}`, { method: 'DELETE' });
}

export async function updateContact(code, data) {
  return apiFetch(`/api/contacts/${code}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getGroupMessages() {
  return apiFetch('/api/messages/group');
}

export async function getPrivateMessages(roomId) {
  return apiFetch(`/api/messages/private?roomId=${roomId}`);
}

export async function getChatRooms() {
  return apiFetch('/api/chat-rooms');
}

export async function uploadMedia(file) {
  const token = getToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/media/upload', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return response.json();
}