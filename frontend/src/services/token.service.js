const ACCESS_TOKEN_KEY = 'accessToken';
const RESET_TOKEN_KEY = 'resetToken';

const TokenService = {
  // Save access token
  setAccessToken(token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  // Get current access token
  getAccessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  // Update access token after refresh
  updateAccessToken(newToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
  },

  // Remove on logout
  removeAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  // Save reset token
  setResetToken(token) {
    localStorage.setItem(RESET_TOKEN_KEY, token);
  },

  getResetToken() {
    return localStorage.getItem(RESET_TOKEN_KEY);
  },

  removeResetToken() {
    localStorage.removeItem(RESET_TOKEN_KEY);
  },
};

export default TokenService;
