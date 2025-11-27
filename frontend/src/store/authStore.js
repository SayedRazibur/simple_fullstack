import { api } from '@/services/auth.service';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import TokenService from '@/services/token.service';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // ===== STATE =====
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,

      // ===== AUTH ACTIONS =====

      /**
       * Login user with email and password
       */
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.login(email, password);

          // Save access token to localStorage
          if (response.data?.accessToken) {
            TokenService.setAccessToken(response.data.accessToken);
          }

          set({
            isAuthenticated: true,
            isAdmin: false, // Default to normal user mode
            isLoading: false,
          });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error; // Re-throw for component handling
        }
      },

      /**
       * Logout user - clears token and resets state
       */
      logout: async () => {
        set({ isLoading: true });
        try {
          // Call logout API if available
          await api.logout();
        } catch (error) {
          // Even if API call fails, proceed with local logout
          console.error('Logout API error:', error);
        } finally {
          // Clear local token and state
          TokenService.removeAccessToken();
          set({
            isAuthenticated: false,
            isAdmin: false,
            isLoading: false,
          });
        }
      },

      // ===== ADMIN MODE ACTIONS =====

      /**
       * Switch to admin mode with admin code verification
       */
      switchToAdminMode: async (adminCode) => {
        set({ isLoading: true });
        try {
          await api.switchToAdmin(adminCode);
          set({
            isAuthenticated: true,
            isAdmin: true,
            isLoading: false,
          });
          return true;
        } catch (error) {
          set({ isLoading: false });
          return false;
        }
      },

      /**
       * Switch back to normal user mode
       */
      switchToNormalMode: async () => {
        set({ isLoading: true });
        try {
          await api.switchToUser();
          set({
            isAuthenticated: true,
            isAdmin: false,
            isLoading: false,
          });
        } catch (error) {
          // Fallback - ensure admin mode is turned off even if API fails
          set({
            isAdmin: false,
            isLoading: false,
          });
          throw error;
        }
      },

      // ===== PASSWORD RESET FLOW =====

      /**
       * Initiate forgot password process
       */
      forgotPassword: async (email) => {
        set({ isLoading: true });
        try {
          const result = await api.forgotPassword(email);
          set({ isLoading: false });
          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Verify OTP for password reset
       */
      verifyOtp: async (email, otp) => {
        set({ isLoading: true });
        try {
          const response = await api.verifyOtp(email, otp);

          // Save reset token to localStorage
          if (response.data?.resetToken) {
            TokenService.setResetToken(response.data.resetToken);
          }

          set({ isLoading: false });
          return response;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Reset password with new password
       */
      resetPassword: async (newPassword) => {
        set({ isLoading: true });
        try {
          const resetToken = TokenService.getResetToken();
          if (!resetToken) {
            throw new Error('Reset token not found. Please verify OTP again.');
          }

          await api.resetPassword(newPassword, resetToken);

          // Clear reset token after successful password reset
          TokenService.removeResetToken();
          set({ isLoading: false });
          return true; // Success
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // ===== UTILITY ACTIONS =====

      /**
       * Validate current authentication state
       * Useful for app startup to check token validity
       */
      validateAuth: async () => {
        const token = TokenService.getAccessToken();

        // If no token exists, skip validation
        if (!token) {
          set({ isAuthenticated: false, isAdmin: false, isLoading: false });
          return false;
        }

        set({ isLoading: true });
        try {
          // Verify token validity with backend
          const response = await api.validateToken();

          // Token is valid, update authentication state
          set({
            isAuthenticated: true,
            isAdmin: response.data?.isAdmin || false,
            isLoading: false,
          });
          return true;
        } catch (error) {
          // Token is invalid, clear everything
          TokenService.removeAccessToken();
          set({ isAuthenticated: false, isAdmin: false, isLoading: false });
          return false;
        }
      },

      /**
       * Change password for authenticated user
       */
      changePassword: async (currentPassword, newPassword) => {
        set({ isLoading: true });
        try {
          await api.changePassword(currentPassword, newPassword);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Change Admin code for authenticated user
       */
      changeAdminCode: async (currentAdminCode, newAdminCode) => {
        set({ isLoading: true });
        try {
          await api.changeAdminCode(currentAdminCode, newAdminCode);
          set({ isLoading: false });
          return true;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      /**
       * Manually clear loading state in case of edge cases
       */
      clearLoading: () => set({ isLoading: false }),
    }),
    {
      // ===== PERSISTENCE CONFIGURATION =====
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
