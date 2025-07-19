<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="pending" class="text-center py-8">
      <p>Loading recipe...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error loading recipe: {{ error.message }}</p>
      <NuxtLink to="/" class="text-blue-500 hover:underline"
        >← Back to Home</NuxtLink
      >
    </div>

    <div v-else-if="!recipe" class="text-center py-8">
      <p class="text-gray-500">Recipe not found.</p>
      <NuxtLink to="/" class="text-blue-500 hover:underline"
        >← Back to Home</NuxtLink
      >
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-6">
        <NuxtLink
          to="/"
          class="text-blue-500 hover:underline mb-4 inline-block"
        >
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
            <strong>By:</strong> {{ recipe.user?.username || "Anonymous" }}
          </span>
          <span>
            <strong>Created:</strong> {{ formatDate(recipe.created_at) }}
          </span>
          <!-- Like Count -->
          <span class="flex items-center gap-1">
            <strong>Likes:</strong> {{ likeCount }}
          </span>
        </div>

        <!-- Like Button -->
        <div class="mt-4">
          <button
            v-if="isAuthenticated && !isOwnRecipe"
            @click="toggleLike"
            class="flex items-center gap-2 px-4 py-2 bg-white border rounded-full hover:bg-pink-50 transition-colors"
            :class="{
              'text-pink-500 border-pink-500': !hasLiked,
              'bg-pink-500 text-red-500 border-pink-500': hasLiked,
            }"
            :disabled="isLikeLoading"
          >
            <div v-if="isLikeLoading" class="loader"></div>
            <!-- Heart Icon: Outlined when not liked, Filled when liked -->
            <template v-else>
              <svg
                v-if="!hasLiked"
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd"
                />
              </svg>
            </template>
            {{ hasLiked ? "Liked" : "Like" }}
          </button>
          <span v-else-if="isOwnRecipe" class="text-sm text-gray-500 italic">
            You can't like your own recipe
          </span>
          <NuxtLink
            v-else-if="!isAuthenticated"
            to="/login"
            class="text-blue-500 hover:underline text-sm"
          >
            Log in to like this recipe
          </NuxtLink>
        </div>
      </div>

      <!-- Featured Image -->
      <div v-if="featuredImage && featuredImage.url" class="mb-8">
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
              <span
                class="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm"
              >
                {{ step.step_number }}
              </span>
              <p class="text-gray-700 leading-relaxed">
                {{ step.description }}
              </p>
            </li>
          </ol>
        </div>
      </div>

      <!-- Additional Images -->
      <div v-if="additionalImages && additionalImages.length > 0" class="mt-8">
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

      <!-- Like/Bookmark Section -->
      <div class="mt-6 flex flex-wrap gap-3">
        <div class="flex items-center">
          <button
            v-if="isAuthenticated && !isOwnRecipe"
            @click="toggleLike"
            class="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg shadow-md hover:bg-pink-700 transition-colors"
            :disabled="isLikeLoading"
          >
            <span v-if="isLikeLoading" class="loader"></span>
            <span v-else-if="hasLiked">❤️ Liked</span>
            <span v-else>🤍 Like</span>
          </button>
          <NuxtLink
            v-else-if="!isAuthenticated"
            to="/login"
            class="text-blue-500 hover:underline text-sm"
          >
            Log in to like this recipe
          </NuxtLink>
          <span class="text-sm text-gray-500 ml-2" v-if="isAuthenticated">
            {{ likeCount }} {{ likeCount === 1 ? "Like" : "Likes" }}
          </span>
        </div>

        <div class="flex items-center">
          <button
            v-if="isAuthenticated"
            @click="toggleBookmark"
            class="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            :disabled="isBookmarkLoading"
          >
            <span v-if="isBookmarkLoading" class="loader"></span>
            <span v-else-if="isBookmarked">🔖 Saved</span>
            <span v-else>📑 Save</span>
          </button>
          <NuxtLink
            v-else
            to="/login"
            class="text-blue-500 hover:underline text-sm"
          >
            Log in to bookmark this recipe
          </NuxtLink>
          <span
            class="text-sm text-gray-500 ml-2"
            v-if="isAuthenticated && isBookmarked"
          >
            Recipe saved to your bookmarks
          </span>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="mt-12">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-gray-800">
            Comments ({{ commentsCount }})
          </h2>
        </div>

        <!-- Add Comment Form -->
        <div v-if="isAuthenticated" class="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 class="text-lg font-semibold mb-4">Add a Comment</h3>
          <form @submit.prevent="submitComment">
            <textarea
              v-model="newComment"
              placeholder="Share your thoughts about this recipe..."
              rows="3"
              class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              :disabled="isCommentLoading"
            ></textarea>
            <div class="flex justify-between items-center mt-4">
              <span class="text-sm text-gray-500">
                {{ newComment.length }}/500 characters
              </span>
              <button
                type="submit"
                :disabled="
                  !newComment.trim() ||
                  newComment.length > 500 ||
                  isCommentLoading
                "
                class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <span v-if="isCommentLoading" class="loader"></span>
                <span v-else>Post Comment</span>
              </button>
            </div>
          </form>
        </div>

        <!-- Login prompt for non-authenticated users -->
        <div v-else class="mb-8 bg-gray-50 p-6 rounded-lg text-center">
          <p class="text-gray-600 mb-4">Join the conversation!</p>
          <NuxtLink
            to="/login"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log in to comment
          </NuxtLink>
        </div>

        <!-- Comments List -->
        <div class="space-y-6">
          <div v-if="commentsLoading" class="text-center py-8">
            <p class="text-gray-500">Loading comments...</p>
          </div>

          <div v-else-if="!comments.length" class="text-center py-8">
            <p class="text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>

          <div v-else>
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold"
                  >
                    {{ comment.user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="font-semibold text-gray-800">
                      {{ comment.user.username }}
                    </p>
                    <p class="text-sm text-gray-500">
                      {{ formatDate(comment.created_at) }}
                    </p>
                  </div>
                </div>

                <!-- Edit/Delete buttons for comment author -->
                <div
                  v-if="isAuthenticated && comment.user.id === userId"
                  class="flex gap-2"
                >
                  <button
                    @click="startEditingComment(comment)"
                    class="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    @click="deleteComment(comment.id)"
                    class="text-red-600 hover:text-red-800 text-sm"
                    :disabled="isDeletingComment"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <!-- Comment content -->
              <div v-if="editingCommentId === comment.id" class="mt-4">
                <textarea
                  v-model="editCommentText"
                  rows="3"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  :disabled="isEditingLoading"
                ></textarea>
                <div class="flex justify-end gap-2 mt-3">
                  <button
                    @click="cancelEditComment"
                    class="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveEditComment(comment.id)"
                    :disabled="!editCommentText.trim() || isEditingLoading"
                    class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    <span v-if="isEditingLoading" class="loader"></span>
                    <span v-else>Save</span>
                  </button>
                </div>
              </div>

              <div v-else class="mt-4">
                <p class="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {{ comment.comment_text }}
                </p>
                <p
                  v-if="comment.updated_at !== comment.created_at"
                  class="text-xs text-gray-400 mt-2 italic"
                >
                  Edited {{ formatDate(comment.updated_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useQuery, useMutation } from "@vue/apollo-composable";
import GetRecipeByIdQuery from "~/queries/recipe-detail.gql";
import {
  LikeRecipe,
  UnlikeRecipe,
  CheckUserLike,
} from "~/queries/recipe-likes.gql";
import {
  BookmarkRecipe,
  UnbookmarkRecipe,
  CheckUserBookmark,
} from "~/queries/recipe-bookmarks.gql";
import {
  AddComment,
  UpdateComment,
  DeleteComment,
  GetRecipeComments,
} from "~/queries/recipe-comments.gql";

const route = useRoute();
const recipeId = route.params.id;
const { isAuthenticated, getUserId } = useAuth();
const userId = ref(getUserId());
const hasLiked = ref(false);
const isLikeLoading = ref(false);
const likeCount = ref(0);
const isBookmarked = ref(false);
const isBookmarkLoading = ref(false);

// Comments state
const comments = ref([]);
const commentsCount = ref(0);
const commentsLoading = ref(false);
const newComment = ref("");
const isCommentLoading = ref(false);
const editingCommentId = ref(null);
const editCommentText = ref("");
const isEditingLoading = ref(false);
const isDeletingComment = ref(false);

// Query recipe details
const {
  result: data,
  loading: pending,
  error,
} = useQuery(GetRecipeByIdQuery, {
  id: recipeId,
});

const recipe = computed(() => data.value?.recipes_by_pk);

// Check if this recipe belongs to the current user
const isOwnRecipe = computed(() => {
  return userId.value && recipe.value?.user_id === userId.value;
});

// Setup like/unlike mutations
const { mutate: likeRecipeMutation } = useMutation(LikeRecipe);
const { mutate: unlikeRecipeMutation } = useMutation(UnlikeRecipe);

// Setup bookmark/unbookmark mutations
const { mutate: bookmarkRecipeMutation } = useMutation(BookmarkRecipe);
const { mutate: unbookmarkRecipeMutation } = useMutation(UnbookmarkRecipe);

// Setup comment mutations
const { mutate: addCommentMutation } = useMutation(AddComment);
const { mutate: updateCommentMutation } = useMutation(UpdateComment);
const { mutate: deleteCommentMutation } = useMutation(DeleteComment);

// Check if user has liked this recipe
const checkUserLike = async () => {
  if (!isAuthenticated.value || !userId.value) {
    hasLiked.value = false;
    return;
  }

  try {
    isLikeLoading.value = true;
    const { data } = await useAsyncQuery(CheckUserLike, {
      recipe_id: recipeId,
      user_id: userId.value,
    });

    // User has liked if there's at least one like record
    const recipeLikes = data.value?.recipe_likes || [];
    hasLiked.value = recipeLikes.length > 0;
  } catch (error) {
    console.error("Error checking like status:", error);
    hasLiked.value = false;
  } finally {
    isLikeLoading.value = false;
  }
};

// Check if user has bookmarked this recipe
const checkUserBookmark = async () => {
  if (!isAuthenticated.value || !userId.value) {
    isBookmarked.value = false;
    return;
  }

  try {
    isBookmarkLoading.value = true;
    const { data } = await useAsyncQuery(CheckUserBookmark, {
      recipe_id: recipeId,
      user_id: userId.value,
    });

    // User has bookmarked if there's at least one bookmark record
    const recipeBookmarks = data.value?.recipe_bookmarks || [];
    isBookmarked.value = recipeBookmarks.length > 0;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    isBookmarked.value = false;
  } finally {
    isBookmarkLoading.value = false;
  }
};

// Toggle like/unlike recipe
const toggleLike = async () => {
  if (!isAuthenticated.value) {
    // Redirect to login if not authenticated
    navigateTo("/login");
    return;
  }

  if (!userId.value) return;

  try {
    isLikeLoading.value = true;

    if (hasLiked.value) {
      // Unlike recipe
      await unlikeRecipeMutation({
        recipe_id: recipeId,
        user_id: userId.value,
      });
      hasLiked.value = false;
      likeCount.value--;
    } else {
      // Like recipe
      await likeRecipeMutation({
        recipe_id: recipeId,
        user_id: userId.value,
      });
      hasLiked.value = true;
      likeCount.value++;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  } finally {
    isLikeLoading.value = false;
  }
};

// Toggle bookmark/unbookmark recipe
const toggleBookmark = async () => {
  if (!isAuthenticated.value) {
    // Redirect to login if not authenticated
    navigateTo("/login");
    return;
  }

  if (!userId.value) return;

  try {
    isBookmarkLoading.value = true;

    if (isBookmarked.value) {
      // Unbookmark recipe
      await unbookmarkRecipeMutation({
        recipe_id: recipeId,
        user_id: userId.value,
      });
      isBookmarked.value = false;
    } else {
      // Bookmark recipe
      await bookmarkRecipeMutation({
        recipe_id: recipeId,
        user_id: userId.value,
      });
      isBookmarked.value = true;
    }
  } catch (error) {
    console.error("Error toggling bookmark:", error);
  } finally {
    isBookmarkLoading.value = false;
  }
};

// Submit a new comment
const submitComment = async () => {
  if (!isAuthenticated.value || !newComment.value.trim()) return;

  try {
    isCommentLoading.value = true;
    const result = await addCommentMutation({
      recipe_id: recipeId,
      user_id: userId.value,
      comment_text: newComment.value.trim(),
    });

    if (result?.data?.insert_recipe_comments_one) {
      // Add new comment to the beginning of the list
      comments.value.unshift(result.data.insert_recipe_comments_one);
      commentsCount.value++;
      newComment.value = "";
    }
  } catch (error) {
    console.error("Error adding comment:", error);
  } finally {
    isCommentLoading.value = false;
  }
};

// Start editing a comment
const startEditingComment = (comment) => {
  editingCommentId.value = comment.id;
  editCommentText.value = comment.comment_text;
};

// Cancel editing
const cancelEditComment = () => {
  editingCommentId.value = null;
  editCommentText.value = "";
};

// Save edited comment
const saveEditComment = async (commentId) => {
  if (!editCommentText.value.trim()) return;

  try {
    isEditingLoading.value = true;
    const result = await updateCommentMutation({
      id: commentId,
      comment_text: editCommentText.value.trim(),
    });

    if (result?.data?.update_recipe_comments_by_pk) {
      // Update the comment in the list
      const index = comments.value.findIndex((c) => c.id === commentId);
      if (index !== -1) {
        comments.value[index] = {
          ...comments.value[index],
          ...result.data.update_recipe_comments_by_pk,
        };
      }
      cancelEditComment();
    }
  } catch (error) {
    console.error("Error updating comment:", error);
  } finally {
    isEditingLoading.value = false;
  }
};

// Delete a comment
const deleteComment = async (commentId) => {
  if (!confirm("Are you sure you want to delete this comment?")) return;

  try {
    isDeletingComment.value = true;
    const result = await deleteCommentMutation({ id: commentId });

    if (result?.data?.delete_recipe_comments_by_pk) {
      // Remove comment from the list
      comments.value = comments.value.filter((c) => c.id !== commentId);
      commentsCount.value--;
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
  } finally {
    isDeletingComment.value = false;
  }
};

// Update like count and check if user has liked when recipe data changes
watch(
  () => recipe.value,
  (newRecipe) => {
    if (newRecipe?.recipe_likes_aggregate?.aggregate?.count !== undefined) {
      likeCount.value = newRecipe.recipe_likes_aggregate.aggregate.count;
    }

    // Update comments count and list
    if (newRecipe?.recipe_comments_aggregate?.aggregate?.count !== undefined) {
      commentsCount.value = newRecipe.recipe_comments_aggregate.aggregate.count;
    }
    if (newRecipe?.recipe_comments) {
      comments.value = newRecipe.recipe_comments;
    }

    // Check if user has liked this recipe when recipe data is loaded
    if (newRecipe && isAuthenticated.value) {
      checkUserLike();
    }

    // Check if user has bookmarked this recipe when recipe data is loaded
    if (newRecipe && isAuthenticated.value) {
      checkUserBookmark();
    }
  },
  { immediate: true }
);

function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// SEO
useHead({
  title: computed(() =>
    recipe.value
      ? `${recipe.value.title} - Food Recipes`
      : "Recipe - Food Recipes"
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          recipe.value?.description || "Delicious recipe from our food website"
      ),
    },
  ],
});

const featuredImage = computed(() => {
  return (
    recipe.value?.recipe_images?.find((img) => img.is_featured) ||
    recipe.value?.recipe_images?.[0]
  );
});

const additionalImages = computed(() => {
  if (!recipe.value?.recipe_images) return [];
  return recipe.value.recipe_images.filter(
    (img) => !img.is_featured && img.id !== featuredImage.value?.id
  );
});
</script>

<style scoped>
.loader {
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  width: 1rem;
  height: 1rem;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
