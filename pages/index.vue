<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
    <!-- Hero Section -->
    <div class="hero-section bg-gradient-to-r from-orange-500 to-red-500 text-white py-16 mb-8">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          Discover Amazing Recipes
        </h1>
        <p class="text-xl md:text-2xl opacity-90 mb-8">
          Cook, Share, and Enjoy Delicious Meals
        </p>
      </div>
    </div>

    <div class="container mx-auto px-4 pb-8">
      <!-- Search and Filter Section -->
      <div class="mb-8 bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Search Recipes</label
            >
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Search by title..."
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Filter by Ingredients</label
            >
            <input
              v-model="ingredientFilter"
              type="text"
              placeholder="Search by ingredients..."
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Sort by</label
            >
            <select
              v-model="sortBy"
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Filter by Category</label
            >
            <select
              v-model="selectedCategory"
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Filter by Creator</label
            >
            <select
              v-model="selectedCreator"
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Filter by Prep Time</label
            >
            <select
              v-model="selectedPrepTime"
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >Filter by Price</label
            >
            <select
              v-model="selectedPriceFilter"
              class="w-full border border-orange-200 rounded-xl shadow-sm p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">All Prices</option>
              <option value="free">Free Only</option>
              <option value="paid">Paid Only</option>
              <option value="discounted">Discounted</option>
            </select>
          </div>
        </div>
        <div class="mt-6 flex gap-3">
          <button
            @click="clearFilters"
            class="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md"
          >
            Clear All Filters
          </button>
          <div class="text-sm text-gray-600 flex items-center bg-orange-50 px-4 py-3 rounded-xl">
            Showing {{ filteredRecipes.length }} of
            {{ data?.recipes?.length || 0 }} recipes
          </div>
        </div>
      </div>

      <div v-if="pending" class="text-center py-16">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading delicious recipes...</p>
      </div>
      <div v-else-if="error" class="text-center py-16">
        <div class="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl max-w-md mx-auto">
          <h3 class="font-semibold mb-2">Oops! Something went wrong</h3>
          <p>{{ error.message }}</p>
        </div>
      </div>
      <div v-else-if="!filteredRecipes.length" class="text-center py-16">
        <div class="text-gray-500">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33"></path>
          </svg>
          <p class="text-xl">No recipes found matching your criteria.</p>
          <p class="text-sm mt-2">Try adjusting your filters or search terms.</p>
        </div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-orange-100 hover:border-orange-200 transform hover:-translate-y-1"
        >
        <NuxtLink :to="`/recipe/${recipe.id}`" class="block group">
          <div class="relative overflow-hidden">
            <img
              :src="
                recipe.recipe_images[0]?.url ||
                'https://via.placeholder.com/400x300?text=Recipe+Image'
              "
              alt="Recipe image"
              class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div class="absolute top-4 right-4">
              <span
                v-if="recipe.prep_time_minutes"
                class="bg-white/90 backdrop-blur-sm text-orange-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg"
              >
                {{ recipe.prep_time_minutes }}min
              </span>
            </div>
          </div>
          <div class="p-6">
            <div class="flex items-start justify-between mb-3">
              <h2 class="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-2">
                {{ recipe.title }}
              </h2>
              <span
                v-if="recipe.category"
                class="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {{ recipe.category.name }}
              </span>
            </div>
            <p class="text-gray-600 mb-4 line-clamp-2 text-sm">
              {{ recipe.description }}
            </p>
            <div class="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path>
                </svg>
                {{ recipe.user?.username || "Anonymous" }}
              </span>
            </div>
            <div class="flex justify-between items-center text-sm border-t pt-3">
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
          </div>
        </NuxtLink>
        <!-- Pricing Information -->
        <div class="px-6 pb-6">
          <div
            v-if="getRecipePricing(recipe)?.is_free"
            class="flex items-center justify-center bg-green-50 text-green-700 font-medium text-sm py-2 px-4 rounded-xl border border-green-200"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"></path>
            </svg>
            FREE RECIPE
          </div>
          <div v-else-if="getRecipePricing(recipe)" class="space-y-3">
            <div class="flex items-center justify-center bg-blue-50 text-blue-700 font-medium text-sm py-2 px-4 rounded-xl border border-blue-200">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd"></path>
              </svg>
              {{ formatPrice(getRecipePricing(recipe)) }}
            </div>
            <PurchaseButton
              :recipe-id="recipe.id"
              :price="parseFloat(getRecipePricing(recipe).price)"
              :recipe-title="recipe.title"
              :currency="getRecipePricing(recipe).currency"
            />
          </div>
          <div v-else class="text-center text-gray-400 text-sm py-2">
            No pricing information available
          </div>
        </div>
      </div>
    </div>
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
const selectedPriceFilter = ref("");
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

  // Filter by price
  if (selectedPriceFilter.value) {
    recipes = recipes.filter((recipe) => {
      const pricing = getRecipePricing(recipe);

      switch (selectedPriceFilter.value) {
        case "free":
          return !pricing || pricing.is_free;
        case "paid":
          return pricing && !pricing.is_free;
        case "discounted":
          return pricing && !pricing.is_free && pricing.discount_percentage > 0;
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
  selectedPriceFilter.value = "";
  sortBy.value = "newest";
}

// Helper function to get recipe pricing
function getRecipePricing(recipe) {
  // Handle both array and single object cases
  if (Array.isArray(recipe.recipe_pricing)) {
    return recipe.recipe_pricing?.[0] || null;
  } else {
    // Handle single object case
    return recipe.recipe_pricing || null;
  }
}

// Helper function to format price with discount
function formatPrice(pricing) {
  if (!pricing || pricing.is_free) return "FREE";

  const originalPrice = parseFloat(pricing.price);
  const discount = parseFloat(pricing.discount_percentage) || 0;
  const currency = pricing.currency || "ETB";

  if (discount > 0) {
    const finalPrice = originalPrice * (1 - discount / 100);
    return `${finalPrice.toFixed(2)} ${currency} (${discount}% off)`;
  }

  return `${originalPrice.toFixed(2)} ${currency}`;
}
</script>
