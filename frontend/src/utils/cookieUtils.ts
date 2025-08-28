export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  let cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;

  if (window.location.protocol === "https:") {
    cookie += ";Secure"; // just the flag, no value
  }

  document.cookie = cookie;
};


export const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(";").map(c => c.trim());
  const cookie = cookies.find(c => c.startsWith(name + "="));
  return cookie ? cookie.substring(name.length + 1) : null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const setAuthTokens = (accessToken: string, refreshToken: string): void => {
  // Access token expires in 15 minutes (short-lived)
  setCookie('access_token', accessToken, 1/96); // 1/96 day = 15 minutes
  
  // Refresh token expires in 1 days (longer-lived)
  setCookie('refresh_token', refreshToken, 1);
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