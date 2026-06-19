const ACCESS_TOKEN_KEY = 'ecotrack_access_token';
const REFRESH_TOKEN_KEY = 'ecotrack_refresh_token';
const THEME_KEY = 'ecotrack_theme';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getTheme = () => localStorage.getItem(THEME_KEY) || 'dark';
export const setTheme = (theme) => localStorage.setItem(THEME_KEY, theme);
