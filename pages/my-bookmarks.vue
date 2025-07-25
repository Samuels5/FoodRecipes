<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 py-12">
    <div class="container mx-auto px-4">
      <h1
        class="text-3xl md:text-4xl font-bold mb-8 text-orange-600 text-center"
      >
        My Bookmarked Recipes
      </h1>

      <div v-if="pending" class="text-center py-8">
        <p class="text-lg">Loading your bookmarks...</p>
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-500">
        <p>Error loading bookmarks: {{ error.message }}</p>
      </div>

      <div v-else-if="!bookmarks.length" class="text-center py-8">
        <p class="text-gray-500 mb-4">
          You haven't bookmarked any recipes yet.
        </p>
        <NuxtLink
          to="/"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Browse Recipes
        </NuxtLink>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="bookmark in bookmarks"
          :key="bookmark.recipe.id"
          class="border p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer block"
        >
          <NuxtLink :to="`/recipe/${bookmark.recipe.id}`" class="block">
            <img
              :src="
                bookmark.recipe.recipe_images[0]?.url ||
                'https://via.placeholder.com/400x300?text=Recipe+Image'
              "
              :alt="bookmark.recipe.title"
              class="mb-2 w-full h-48 object-cover rounded"
            />
            <h2 class="text-xl font-bold mb-2">{{ bookmark.recipe.title }}</h2>
            <p class="text-gray-600 mb-2 line-clamp-2">
              {{ bookmark.recipe.description }}
            </p>
            <div
              class="flex justify-between items-center text-sm text-gray-500 mb-2"
            >
              <span
                >By: {{ bookmark.recipe.user?.username || "Anonymous" }}</span
              >
              <div class="flex gap-2">
                <span
                  v-if="bookmark.recipe.prep_time_minutes"
                  class="bg-orange-100 text-orange-800 px-2 py-1 rounded"
                >
                  {{ bookmark.recipe.prep_time_minutes }}min
                </span>
                <span
                  v-if="bookmark.recipe.category"
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {{ bookmark.recipe.category.name }}
                </span>
              </div>
            </div>
            <div class="flex justify-between items-center text-sm">
              <div class="flex gap-4">
                <RecipeLikes
                  :like-count="
                    bookmark.recipe.recipe_likes_aggregate?.aggregate?.count ||
                    0
                  "
                />
                <RecipeComments
                  :comment-count="
                    bookmark.recipe.recipe_comments_aggregate?.aggregate
                      ?.count || 0
                  "
                />
              </div>
              <div class="text-blue-500">
                <span class="flex items-center">
                  <span class="mr-1">🔖</span> Bookmarked
                </span>
              </div>
            </div>
          </NuxtLink>
          <!-- Pricing Information -->
          <div class="mt-3 pt-3 border-t">
            <div
              v-if="getRecipePricing(bookmark.recipe)?.is_free"
              class="text-green-600 font-medium text-sm"
            >
              🆓 FREE RECIPE
            </div>
            <div
              v-else-if="getRecipePricing(bookmark.recipe)"
              class="space-y-2"
            >
              <div class="text-blue-600 font-medium text-sm">
                💰 {{ formatPrice(getRecipePricing(bookmark.recipe)) }}
              </div>
              <PurchaseButton
                :recipe-id="bookmark.recipe.id"
                :price="parseFloat(getRecipePricing(bookmark.recipe).price)"
                :recipe-title="bookmark.recipe.title"
                :currency="getRecipePricing(bookmark.recipe).currency"
                :user-owns-recipe="userOwnsRecipe(bookmark.recipe)"
              />
            </div>
            <div v-else class="text-gray-500 text-sm">No pricing info</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import { GetUserBookmarks } from "~/queries/recipe-bookmarks.gql";
import RecipeLikes from "~/components/RecipeLikes.vue";
import RecipeComments from "~/components/RecipeComments.vue";

import GetMyRecipesAndPurchasesQuery from "~/queries/my-recipes-and-purchases.gql";

definePageMeta({
  middleware: "auth",
});

const { getUserId } = useAuth();
const userId = getUserId();

const { result: myRecipesData } = useQuery(
  GetMyRecipesAndPurchasesQuery,
  { user_id: userId },
  { enabled: !!userId }
);

const ownedRecipeIds = computed(() => {
  if (!myRecipesData.value) return new Set();
  const created = myRecipesData.value.created || [];
  const purchased = (myRecipesData.value.purchased || []).map((p) => p.recipe);
  const all = [...created, ...purchased];
  return new Set(all.map((r) => r.id));
});

function userOwnsRecipe(recipe) {
  if (!userId) return false;
  return ownedRecipeIds.value.has(recipe.id);
}

const {
  result,
  loading: pending,
  error,
} = useQuery(GetUserBookmarks, { user_id: userId }, { enabled: !!userId });

const bookmarks = computed(() => {
  return result.value?.recipe_bookmarks || [];
});

// SEO
useHead({
  title: "My Bookmarked Recipes - Food Recipes",
  meta: [
    {
      name: "description",
      content: "View and manage your bookmarked recipes",
    },
  ],
});

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
