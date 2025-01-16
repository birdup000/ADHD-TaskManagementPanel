// utils/agixtApi.js
export const agixtApi = async (
  endpoint,
  method = "GET",
  body = null,
  token = undefined
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  const apiKey = localStorage.getItem('apiKey');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const apiBaseUrl = localStorage.getItem('apiBaseUrl') || process.env.NEXT_PUBLIC_AGIXT_API_BASE_URL || 'http://localhost:7437';
  const res = await fetch(`${apiBaseUrl}/${endpoint}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  });
  return res.json();
};