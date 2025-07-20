export const useAuth = () => {
  const authToken = useCookie("auth-token");

  const user = ref(null);

  const isAuthenticated = computed(() => {
    return !!authToken.value;
  });

  const getUserId = () => {
    if (!authToken.value) {
      return null;
    }
    try {
      const payload = authToken.value.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      const hasuraClaims = decodedPayload["https://hasura.io/jwt/claims"];
      const userId = hasuraClaims?.["x-hasura-user-id"] || null;
      return userId;
    } catch (error) {
      return null;
    }
  };

  // Optionally, decode user info from JWT
  const updateUserFromToken = () => {
    if (!authToken.value) {
      user.value = null;
      return;
    }
    try {
      const payload = authToken.value.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));
      user.value = decodedPayload;
    } catch (error) {
      user.value = null;
    }
  };

  // Watch for changes to authToken and update user
  if (process.client) {
    updateUserFromToken();
    // If you use Vue's watch, you can add:
    // watch(authToken, updateUserFromToken);
  }

  const login = (token: string, userData?: any) => {
    authToken.value = token;
    updateUserFromToken();
  };

  const logout = () => {
    authToken.value = null;
    user.value = null;
  };

  return {
    isAuthenticated,
    user,
    getUserId,
    login,
    logout,
  };
};
