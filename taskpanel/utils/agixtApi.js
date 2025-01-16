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

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:7437/${endpoint}`, {
    method: method,
    headers: headers,
    body: body ? JSON.stringify(body) : null,
  });
  return res.json();
};