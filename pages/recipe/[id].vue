<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="text-center py-8">
      <p>Loading recipe...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error loading recipe: {{ error.message }}</p>
      <NuxtLink to="/" class="text-blue-500 hover:underline">← Back to Home</NuxtLink>
    </div>

    <div v-else-if="!recipe" class="text-center py-8">
      <p class="text-gray-500">Recipe not found.</p>
      <NuxtLink to="/" class="text-blue-500 hover:underline">← Back to Home</NuxtLink>
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink to="/" class="text-blue-500 hover:underline mb-4 inline-block">
          ← Back to Recipes
        </NuxtLink>
        <h1 class="text-4xl font-bold mb-2">{{ recipe.title }}</h1>
        <p class="text-gray-600 text-lg mb-4">{{ recipe.description }}</p>
        
        <div class="flex flex-wrap gap-4 text-sm text-gray-500">
          <span v-if="recipe.category">
            <strong>Category:</strong> 
            <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ recipe.category.name }}
            </span>
          </span>
          <span v-if="recipe.prep_time_minutes">
            <strong>Prep Time:</strong> {{ recipe.prep_time_minutes }} minutes
          </span>
          <span>
            <strong>By:</strong> {{ recipe.user?.username || 'Anonymous' }}
          </span>
          <span>
            <strong>Created:</strong> {{ formatDate(recipe.created_at) }}
          </span>
        </div>
      </div>

      <!-- Featured Image -->
      <div v-if="featuredImage" class="mb-8">
        <img 
          :src="featuredImage.url" 
          :alt="recipe.title"
          class="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
        />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Ingredients -->
        <div class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Ingredients</h2>
          <ul class="space-y-2">
            <li 
              v-for="ingredient in recipe.recipe_ingredients" 
              :key="ingredient.id"
              class="flex justify-between items-center"
            >
              <span class="font-medium">{{ ingredient.name }}</span>
              <span v-if="ingredient.quantity" class="text-gray-600 text-sm">
                {{ ingredient.quantity }}
              </span>
            </li>
          </ul>
        </div>

        <!-- Instructions -->
        <div class="bg-gray-50 p-6 rounded-lg">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Instructions</h2>
          <ol class="space-y-4">
            <li 
              v-for="step in recipe.recipe_steps" 
              :key="step.id"
              class="flex gap-3"
            >
              <span class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {{ step.step_number }}
              </span>
              <p class="text-gray-700 leading-relaxed">{{ step.description }}</p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Additional Images -->
      <div v-if="additionalImages.length > 0" class="mt-8">
        <h2 class="text-2xl font-bold mb-4 text-gray-800">More Photos</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <img 
            v-for="image in additionalImages" 
            :key="image.id"
            :src="image.url" 
            :alt="`${recipe.title} - Additional photo`"
            class="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import GetRecipeByIdQuery from "~/queries/recipe-detail.gql";

const route = useRoute();
const recipeId = route.params.id;

const {
  result: data,
  loading: pending,
  error,
} = useQuery(GetRecipeByIdQuery, {
  id: recipeId,
});

const recipe = computed(() => data.value?.recipes_by_pk);

const featuredImage = computed(() => {
  return recipe.value?.recipe_images?.find(img => img.is_featured) || 
         recipe.value?.recipe_images?.[0];
});

const additionalImages = computed(() => {
  if (!recipe.value?.recipe_images) return [];
  return recipe.value.recipe_images.filter(img => !img.is_featured && img.id !== featuredImage.value?.id);
});

function formatDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// SEO
useHead({
  title: computed(() => recipe.value ? `${recipe.value.title} - Food Recipes` : 'Recipe - Food Recipes'),
  meta: [
    {
      name: 'description',
      content: computed(() => recipe.value?.description || 'Delicious recipe from our food website')
    }
  ]
});
</script>
