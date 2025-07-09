export const useAuth = () => {
  const authToken = useCookie("auth-token");

  const isAuthenticated = computed(() => {
    console.log("Checking authentication, token exists:", !!authToken.value);
    return !!authToken.value;
  });

  const getUserId = () => {
    if (!authToken.value) {
      console.log("No auth token found");
      return null;
    }

    try {
      // Decode JWT payload (base64)
      const payload = authToken.value.split(".")[1];
      const decodedPayload = JSON.parse(atob(payload));

      console.log("Decoded JWT payload:", decodedPayload);

      // Extract user ID from Hasura claims
      const hasuraClaims = decodedPayload["https://hasura.io/jwt/claims"];
      console.log("Hasura claims:", hasuraClaims);

      const userId = hasuraClaims?.["x-hasura-user-id"] || null;
      console.log("Extracted user ID:", userId);

      return userId;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  const login = (token: string, user?: any) => {
    console.log("Login function called with token:", token);
    console.log("User data:", user);
    
    // Store the JWT token
    authToken.value = token;
    
    console.log("Token stored, isAuthenticated should now be:", !!token);
  };

  const logout = () => {
    authToken.value = null;
  };

  return {
    isAuthenticated,
    getUserId,
    login,
    logout,
  };
};
