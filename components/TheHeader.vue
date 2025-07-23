<template>
  <header class="bg-white shadow-md border-b border-gray-100">
    <div class="container mx-auto px-4 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo Section -->
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
              />
            </svg>
          </div>
          <NuxtLink to="/" class="text-2xl font-bold text-gray-800">
            <span class="text-orange-500">Food</span>Recipes
          </NuxtLink>
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center space-x-8">
          <NuxtLink v-if="isAuthenticated" to="/my-recipes" class="nav-link"
            >My Recipes</NuxtLink
          >
          <NuxtLink v-if="isAuthenticated" to="/my-bookmarks" class="nav-link"
            >My Bookmarks</NuxtLink
          >
          <NuxtLink to="/create-recipe" class="nav-link">Add Recipe</NuxtLink>
        </nav>

        <!-- User Actions -->
        <div class="flex items-center space-x-4">
          <template v-if="!isAuthenticated">
            <NuxtLink
              to="/login"
              class="text-gray-600 hover:text-orange-500 font-medium"
            >
              Login
            </NuxtLink>
            <NuxtLink to="/register" class="btn-primary"> Sign Up </NuxtLink>
          </template>
          <template v-else>
            <button
              @click="handleLogout"
              class="text-gray-600 hover:text-orange-500 font-medium"
            >
              Logout
            </button>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <button class="md:hidden p-2" @click="toggleMobileMenu">
          <svg
            class="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div
        v-if="showMobileMenu"
        class="md:hidden mt-4 pb-4 border-t border-gray-100 pt-4"
      >
        <nav class="flex flex-col space-y-3">
          <NuxtLink
            v-if="isAuthenticated"
            to="/my-recipes"
            class="nav-link"
            @click="closeMobileMenu"
            >My Recipes</NuxtLink
          >
          <NuxtLink
            v-if="isAuthenticated"
            to="/my-bookmarks"
            class="nav-link"
            @click="closeMobileMenu"
            >My Bookmarks</NuxtLink
          >
          <NuxtLink
            to="/create-recipe"
            class="nav-link"
            @click="closeMobileMenu"
            >Add Recipe</NuxtLink
          >
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
const { isAuthenticated, logout } = useAuth();
const router = useRouter();

const showMobileMenu = ref(false);

console.log("Header: isAuthenticated =", isAuthenticated.value);

const handleLogout = () => {
  logout();
  router.push("/");
};

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};
</script>
