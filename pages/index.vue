<template>
  <div>
    <h1 class="text-3xl font-bold underline mb-4">
      Welcome to the Food Recipes Website!
    </h1>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="recipe in data.recipes"
        :key="recipe.id"
        class="border p-4 rounded"
      >
        <img
          :src="recipe.recipe_images[0]?.url || 'https://via.placeholder.com/400x300?text=Recipe+Image'"
          alt="Recipe image"
          class="mb-2 w-full h-48 object-cover rounded"
        />
        <h2 class="text-xl font-bold">{{ recipe.title }}</h2>
        <p>{{ recipe.description }}</p>
        <p class="text-sm text-gray-500">
          By: {{ recipe.user?.username || "Anonymous" }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import GetAllRecipes from "~/queries/recipes.gql";

const { data, pending, error } = await useAsyncQuery(GetAllRecipes);
</script>
