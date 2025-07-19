<template>
  <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <nav class="flex items-center space-x-4">
      <NuxtLink to="/" class="text-xl font-bold">Food Recipes</NuxtLink>
      <NuxtLink
        v-if="isAuthenticated"
        to="/my-recipes"
        class="hover:text-gray-300"
        >My Recipes</NuxtLink
      >
      <NuxtLink
        v-if="isAuthenticated"
        to="/my-bookmarks"
        class="hover:text-gray-300"
        >My Bookmarks</NuxtLink
      >
    </nav>
    <nav class="space-x-4">
      <template v-if="!isAuthenticated">
        <NuxtLink to="/login" class="hover:text-gray-300">Login</NuxtLink>
        <NuxtLink to="/register" class="hover:text-gray-300">Register</NuxtLink>
      </template>
      <template v-else>
        <button @click="handleLogout" class="hover:text-gray-300">
          Logout
        </button>
      </template>
    </nav>
  </header>
</template>

<script setup>
const { isAuthenticated, logout } = useAuth();
const router = useRouter();

console.log("Header: isAuthenticated =", isAuthenticated.value);

const handleLogout = () => {
  logout();
  router.push("/");
};
</script>
