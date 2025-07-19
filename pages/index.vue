<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold underline mb-6">
      Welcome to the Food Recipes Website!
    </h1>

    <!-- Search and Filter Section -->
    <div class="mb-6 bg-gray-50 p-4 rounded-lg">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Search Recipes</label
          >
          <input
            v-model="searchTerm"
            type="text"
            placeholder="Search by title..."
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Filter by Ingredients</label
          >
          <input
            v-model="ingredientFilter"
            type="text"
            placeholder="Search by ingredients..."
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sort by</label
          >
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
            <option value="creator">Creator A-Z</option>
            <option value="creator_desc">Creator Z-A</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Filter by Category</label
          >
          <select
            v-model="selectedCategory"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">All Categories</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Filter by Creator</label
          >
          <select
            v-model="selectedCreator"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">All Creators</option>
            <option
              v-for="creator in uniqueCreators"
              :key="creator.id"
              :value="creator.id"
            >
              {{ creator.username }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Filter by Prep Time</label
          >
          <select
            v-model="selectedPrepTime"
            class="w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">All Prep Times</option>
            <option value="quick">Quick (≤ 15 min)</option>
            <option value="moderate">Moderate (16-30 min)</option>
            <option value="medium">Medium (31-60 min)</option>
            <option value="long">Long (61-120 min)</option>
            <option value="extended">Extended (> 120 min)</option>
            <option value="no-time">No time specified</option>
          </select>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button
          @click="clearFilters"
          class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Clear All Filters
        </button>
        <div class="text-sm text-gray-600 flex items-center">
          Showing {{ filteredRecipes.length }} of
          {{ data?.recipes?.length || 0 }} recipes
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
          :src="
            recipe.recipe_images[0]?.url ||
            'https://via.placeholder.com/400x300?text=Recipe+Image'
          "
          alt="Recipe image"
          class="mb-2 w-full h-48 object-cover rounded"
        />
        <h2 class="text-xl font-bold mb-2">{{ recipe.title }}</h2>
        <p class="text-gray-600 mb-2 line-clamp-2">{{ recipe.description }}</p>
        <div
          class="flex justify-between items-center text-sm text-gray-500 mb-2"
        >
          <span>By: {{ recipe.user?.username || "Anonymous" }}</span>
          <div class="flex gap-2">
            <span
              v-if="recipe.prep_time_minutes"
              class="bg-orange-100 text-orange-800 px-2 py-1 rounded"
            >
              {{ recipe.prep_time_minutes }}min
            </span>
            <span
              v-if="recipe.category"
              class="bg-blue-100 text-blue-800 px-2 py-1 rounded"
            >
              {{ recipe.category.name }}
            </span>
          </div>
        </div>
        <div class="flex justify-between items-center text-sm">
          <RecipeLikes
            :like-count="recipe.recipe_likes_aggregate?.aggregate?.count || 0"
          />
          <RecipeComments
            :comment-count="
              recipe.recipe_comments_aggregate?.aggregate?.count || 0
            "
          />
          <RecipeRating
            :recipe-id="recipe.id"
            :display-mode="true"
            :size="'small'"
          />
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import GetAllRecipes from "~/queries/recipes.gql";
import GetCategoriesQuery from "~/queries/categories.gql";
import RecipeLikes from "~/components/RecipeLikes.vue";
import RecipeComments from "~/components/RecipeComments.vue";
import RecipeRating from "~/components/RecipeRating.vue";

const { data, pending, error } = await useAsyncQuery(GetAllRecipes);
const { data: categoriesData } = await useAsyncQuery(GetCategoriesQuery);

const categories = computed(() => categoriesData.value?.categories || []);

// Reactive search and filter
const searchTerm = ref("");
const selectedCategory = ref("");
const ingredientFilter = ref("");
const selectedPrepTime = ref("");
const sortBy = ref("newest");

// Extract unique creators for the filter dropdown
const selectedCreator = ref("");
const uniqueCreators = computed(() => {
  if (!data.value?.recipes) return [];

  const creators = new Map();
  data.value.recipes.forEach((recipe) => {
    if (recipe.user && recipe.user.username) {
      creators.set(recipe.user_id, {
        id: recipe.user_id,
        username: recipe.user.username,
      });
    }
  });

  return Array.from(creators.values()).sort((a, b) =>
    a.username.localeCompare(b.username)
  );
});

const filteredRecipes = computed(() => {
  if (!data.value?.recipes) return [];

  let recipes = data.value.recipes;

  // Filter by search term
  if (searchTerm.value) {
    recipes = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        recipe.description
          .toLowerCase()
          .includes(searchTerm.value.toLowerCase())
    );
  }

  // Filter by ingredients
  if (ingredientFilter.value) {
    recipes = recipes.filter((recipe) => {
      if (
        !recipe.recipe_ingredients ||
        recipe.recipe_ingredients.length === 0
      ) {
        return false;
      }

      const searchTerms = ingredientFilter.value
        .toLowerCase()
        .split(",")
        .map((term) => term.trim());

      return searchTerms.every((searchTerm) =>
        recipe.recipe_ingredients.some((ingredient) =>
          ingredient.name.toLowerCase().includes(searchTerm)
        )
      );
    });
  }

  // Filter by category
  if (selectedCategory.value) {
    recipes = recipes.filter(
      (recipe) => recipe.category?.id === selectedCategory.value
    );
  }

  // Filter by creator
  if (selectedCreator.value) {
    recipes = recipes.filter(
      (recipe) => recipe.user_id === selectedCreator.value
    );
  }

  // Filter by prep time
  if (selectedPrepTime.value) {
    recipes = recipes.filter((recipe) => {
      const prepTime = recipe.prep_time_minutes;

      switch (selectedPrepTime.value) {
        case "quick":
          return prepTime && prepTime <= 15;
        case "moderate":
          return prepTime && prepTime >= 16 && prepTime <= 30;
        case "medium":
          return prepTime && prepTime >= 31 && prepTime <= 60;
        case "long":
          return prepTime && prepTime >= 61 && prepTime <= 120;
        case "extended":
          return prepTime && prepTime > 120;
        case "no-time":
          return !prepTime || prepTime === null;
        default:
          return true;
      }
    });
  }

  // Sort recipes
  recipes = [...recipes].sort((a, b) => {
    switch (sortBy.value) {
      case "newest":
        return new Date(b.created_at) - new Date(a.created_at);
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "title":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "prep_time":
        const aTime = a.prep_time_minutes || 999999;
        const bTime = b.prep_time_minutes || 999999;
        return aTime - bTime;
      case "prep_time_desc":
        const aTimeDesc = a.prep_time_minutes || 0;
        const bTimeDesc = b.prep_time_minutes || 0;
        return bTimeDesc - aTimeDesc;
      case "creator":
        const aCreator = a.user?.username || "zzz";
        const bCreator = b.user?.username || "zzz";
        return aCreator.localeCompare(bCreator);
      case "creator_desc":
        const aCreatorDesc = a.user?.username || "";
        const bCreatorDesc = b.user?.username || "";
        return bCreatorDesc.localeCompare(aCreatorDesc);
      default:
        return 0;
    }
  });

  return recipes;
});

function clearFilters() {
  searchTerm.value = "";
  selectedCategory.value = "";
  selectedCreator.value = "";
  ingredientFilter.value = "";
  selectedPrepTime.value = "";
  sortBy.value = "newest";
}
</script>
