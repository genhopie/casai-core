export const authApiUrl =
  process.env.NEXT_PUBLIC_AUTH_API_URL ?? 'http://localhost:3101';
export const marketplaceApiUrl =
  process.env.NEXT_PUBLIC_MARKETPLACE_API_URL ?? 'http://localhost:3102';

export async function apiRequest<T>(
  url: string,
  init: RequestInit,
  token?: string
): Promise<T> {
  const headers = new Headers(init.headers ?? {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...init, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed ${response.status}`);
  }
  return (await response.json()) as T;
}
