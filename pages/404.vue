<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-100"
  >
    <div class="text-center">
      <h1 class="text-6xl font-extrabold text-orange-600 mb-4">404</h1>
      <h2 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
        Page Not Found
      </h2>
      <p class="text-gray-500 mb-8">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <NuxtLink
        to="/"
        class="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all duration-200"
      >
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// No script needed
</script>

<style scoped></style>
