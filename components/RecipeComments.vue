<template>
  <div
    class="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 text-blue-500 mr-1.5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
        clip-rule="evenodd"
      />
      <path
        d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"
      />
    </svg>
    <span class="font-medium">{{ commentCount }}</span>
  </div>
</template>

<script setup>
defineProps({
  commentCount: {
    type: Number,
    default: 0,
  },
});
</script>
