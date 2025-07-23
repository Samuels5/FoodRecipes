<template>
  <div
    class="flex items-center text-sm text-gray-600 hover:text-orange-600 transition-colors"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 text-red-500 mr-1.5"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fill-rule="evenodd"
        d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
        clip-rule="evenodd"
      />
    </svg>
    <span class="font-medium">{{ likeCount }}</span>
  </div>
</template>

<script setup>
// NOTE: This component requires a recipe_likes table in the database
// Before using this component, make sure to create the table in Hasura
defineProps({
  likeCount: {
    type: Number,
    default: 0,
  },
});
</script>
