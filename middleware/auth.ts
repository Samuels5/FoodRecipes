export default defineNuxtRouteMiddleware((to, from) => {
  const authToken = useCookie("auth-token");

  if (!authToken.value) {
    // If the user is not authenticated, redirect them to the login page.
    return navigateTo("/login");
  }
});
