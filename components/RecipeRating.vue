<template>
  <div class="recipe-rating">
    <!-- Display Mode: Show average rating and count -->
    <div v-if="displayMode" class="flex items-center gap-2">
      <div class="flex items-center">
        <StarRating :rating="averageRating" :readonly="true" :size="size" />
        <span class="ml-1 text-sm text-gray-600">
          {{ averageRating.toFixed(1) }}
        </span>
      </div>
      <span class="text-sm text-gray-500">
        ({{ ratingCount }} {{ ratingCount === 1 ? "rating" : "ratings" }})
      </span>
    </div>

    <!-- Interactive Mode: Allow user to rate -->
    <div v-else class="space-y-3">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium">Rate this recipe:</span>
        <StarRating
          :rating="userRating"
          :readonly="false"
          :size="size"
          @rate="handleRate"
        />
        <button
          v-if="userRating > 0"
          @click="removeRating"
          class="text-xs text-red-500 hover:text-red-700"
          :disabled="isLoading"
        >
          Remove rating
        </button>
      </div>

      <div
        v-if="averageRating > 0"
        class="flex items-center gap-2 text-sm text-gray-600"
      >
        <span>Average:</span>
        <StarRating :rating="averageRating" :readonly="true" :size="'small'" />
        <span>{{ averageRating.toFixed(1) }} ({{ ratingCount }} ratings)</span>
      </div>

      <div v-if="isLoading" class="text-xs text-gray-500">Saving rating...</div>
    </div>
  </div>
</template>

<script setup>
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  RateRecipe,
  RemoveRating,
  GetUserRating,
  GetRecipeRatingStats,
} from "~/queries/recipe-ratings.gql";

const props = defineProps({
  recipeId: {
    type: String,
    required: true,
  },
  displayMode: {
    type: Boolean,
    default: false, // false = interactive mode, true = display only mode
  },
  size: {
    type: String,
    default: "medium", // small, medium, large
  },
});

const { isAuthenticated, getUserId } = useAuth();
const userId = getUserId();

const userRating = ref(0);
const averageRating = ref(0);
const ratingCount = ref(0);
const isLoading = ref(false);

// Mutations
const { mutate: rateRecipeMutation } = useMutation(RateRecipe);
const { mutate: removeRatingMutation } = useMutation(RemoveRating);

// Get rating statistics
const { result: statsResult } = useQuery(GetRecipeRatingStats, {
  recipe_id: props.recipeId,
});

// Get user's current rating (only if authenticated)
const { result: userRatingResult } = useQuery(
  GetUserRating,
  {
    recipe_id: props.recipeId,
    user_id: userId,
  },
  {
    enabled: computed(() => isAuthenticated.value && !!userId),
  }
);

// Watch for rating stats changes
watch(
  statsResult,
  (newStats) => {
    if (newStats?.recipe_ratings_aggregate?.aggregate) {
      const aggregate = newStats.recipe_ratings_aggregate.aggregate;
      averageRating.value = aggregate.avg?.rating || 0;
      ratingCount.value = aggregate.count || 0;
    }
  },
  { immediate: true }
);

// Watch for user rating changes
watch(
  userRatingResult,
  (newUserRating) => {
    if (newUserRating?.recipe_ratings?.[0]?.rating) {
      userRating.value = newUserRating.recipe_ratings[0].rating;
    } else {
      userRating.value = 0;
    }
  },
  { immediate: true }
);

// Handle rating
const handleRate = async (rating) => {
  if (!isAuthenticated.value) {
    // Redirect to login or show message
    await navigateTo("/login");
    return;
  }

  if (!userId) return;

  try {
    isLoading.value = true;

    await rateRecipeMutation({
      recipe_id: props.recipeId,
      user_id: userId,
      rating: rating,
    });

    userRating.value = rating;

    // Optionally show success message
    // $toast.success('Rating saved!');
  } catch (error) {
    console.error("Error rating recipe:", error);
    // $toast.error('Failed to save rating');
  } finally {
    isLoading.value = false;
  }
};

// Remove rating
const removeRating = async () => {
  if (!userId) return;

  try {
    isLoading.value = true;

    await removeRatingMutation({
      recipe_id: props.recipeId,
      user_id: userId,
    });

    userRating.value = 0;

    // Optionally show success message
    // $toast.success('Rating removed!');
  } catch (error) {
    console.error("Error removing rating:", error);
    // $toast.error('Failed to remove rating');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Component styles will be added as needed */
</style>
