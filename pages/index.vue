<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold underline mb-6">
      Welcome to the Food Recipes Website!
    </h1>
    
    <!-- Search and Filter Section -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search Recipes</label>
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by title..."
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Filter by Category</label>
          <select
            v-model="selectedCategory"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
          <select
            v-model="sortBy"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="prep_time">Prep Time (Shortest)</option>
            <option value="prep_time_desc">Prep Time (Longest)</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>

    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else-if="!filteredRecipes.length" class="text-center py-8">
      <p class="text-gray-500">No recipes found matching your criteria.</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <NuxtLink
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        :to="`/recipe/${recipe.id}`"
        class="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer block"
      >
        <img
          :src="recipe.recipe_images[0]?.url || 'https://via.placeholder.com/400x300?text=Recipe+Image'"
          alt="Recipe image"
          class="mb-2 w-full h-48 object-cover rounded"
        />
        <h2 class="text-xl font-bold mb-2">{{ recipe.title }}</h2>
        <p class="text-gray-600 mb-2 line-clamp-2">{{ recipe.description }}</p>
        <div class="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>By: {{ recipe.user?.username || "Anonymous" }}</span>
          <div class="flex gap-2">
            <span v-if="recipe.prep_time_minutes" class="bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {{ recipe.prep_time_minutes }}min
            </span>
            <span v-if="recipe.category" class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ recipe.category.name }}
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import GetAllRecipes from "~/queries/recipes.gql";
import GetCategoriesQuery from "~/queries/categories.gql";

const { data, pending, error } = await useAsyncQuery(GetAllRecipes);
const { data: categoriesData } = await useAsyncQuery(GetCategoriesQuery);

const categories = computed(() => categoriesData.value?.categories || []);

// Reactive search and filter
const searchTerm = ref('');
const selectedCategory = ref('');
const sortBy = ref('newest');

const filteredRecipes = computed(() => {
  if (!data.value?.recipes) return [];
  
  let recipes = data.value.recipes;
  
  // Filter by search term
  if (searchTerm.value) {
    recipes = recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  
  // Filter by category
  if (selectedCategory.value) {
    recipes = recipes.filter(recipe => recipe.category?.id === selectedCategory.value);
  }
  
  // Sort recipes
  recipes = [...recipes].sort((a, b) => {
    switch (sortBy.value) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'title_desc':
        return b.title.localeCompare(a.title);
      case 'prep_time':
        const aTime = a.prep_time_minutes || 999999;
        const bTime = b.prep_time_minutes || 999999;
        return aTime - bTime;
      case 'prep_time_desc':
        const aTimeDesc = a.prep_time_minutes || 0;
        const bTimeDesc = b.prep_time_minutes || 0;
        return bTimeDesc - aTimeDesc;
      default:
        return 0;
    }
  });
  
  return recipes;
});

function clearFilters() {
  searchTerm.value = '';
  selectedCategory.value = '';
  sortBy.value = 'newest';
}
</script>
