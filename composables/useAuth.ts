export const useAuth = () => {
  const authToken = useCookie("auth-token");

  const isAuthenticated = computed(() => !!authToken.value);

  const getUserId = () => {
    if (!authToken.value) return null;

    try {
      // Decode JWT payload (base64)
      const payload = authToken.value.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      // Extract user ID from Hasura claims
      const hasuraClaims = decodedPayload["https://hasura.io/jwt/claims"];
      return hasuraClaims?.["x-hasura-user-id"] || null;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const logout = () => {
    authToken.value = null;
  };

  return {
    isAuthenticated,
    getUserId,
    logout,
  };
};
