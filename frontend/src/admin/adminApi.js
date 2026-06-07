async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function adminFetch(url, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    const error = new Error(data?.error || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return data;
}
