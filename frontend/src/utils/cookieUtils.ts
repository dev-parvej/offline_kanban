// Cookie utility functions for JWT token management

export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure=${window.location.protocol === 'https:'}`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  // Access token expires in 15 minutes (short-lived)
  setCookie('access_token', accessToken, 1/96); // 1/96 day = 15 minutes
  
  // Refresh token expires in 7 days (longer-lived)
  setCookie('refresh_token', refreshToken, 7);
};

export const getAccessToken = (): string | null => {
  return getCookie('access_token');
};

export const getRefreshToken = (): string | null => {
  return getCookie('refresh_token');
};

export const clearAuthTokens = (): void => {
  deleteCookie('access_token');
  deleteCookie('refresh_token');
};