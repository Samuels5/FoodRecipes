<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Recipes</h1>
      <div class="flex gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1"
            >Sort by</label
          >
          <select
            v-model="sortBy"
            class="border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="prep_time">Prep Time (Shortest)</option>
            <option value="prep_time_desc">Prep Time (Longest)</option>
          </select>
        </div>
        <NuxtLink
          to="/create-recipe"
          class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-6"
        >
          Create New Recipe
        </NuxtLink>
      </div>
    </div>

    <div v-if="pending" class="text-center py-8">
      <p>Loading your recipes...</p>
    </div>

    <div v-else-if="error" class="text-center py-8 text-red-500">
      <p>Error loading recipes: {{ error.message }}</p>
    </div>

    <div v-else-if="!filteredRecipes?.length" class="text-center py-8">
      <p class="text-gray-500 mb-4">You haven't created any recipes yet.</p>
      <NuxtLink
        to="/create-recipe"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Create Your First Recipe
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="recipe in filteredRecipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
      >
        <img
          :src="
            recipe.recipe_images[0]?.url ||
            'https://via.placeholder.com/400x300?text=Recipe+Image'
          "
          :alt="recipe.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">{{ recipe.title }}</h3>
          <p class="text-gray-600 mb-2 line-clamp-2">
            {{ recipe.description }}
          </p>
          <div
            class="flex justify-between items-center text-sm text-gray-500 mb-2"
          >
            <span
              >Category: {{ recipe.category?.name || "Uncategorized" }}</span
            >
            <div class="flex gap-2">
              <span
                v-if="recipe.prep_time_minutes"
                class="bg-orange-100 text-orange-800 px-2 py-1 rounded"
              >
                {{ recipe.prep_time_minutes }}min
              </span>
            </div>
          </div>
          <div class="flex items-center text-sm mb-2">
            <RecipeLikes :like-count="recipe.recipe_likes_aggregate?.aggregate?.count || 0" />
          </div>
          <div class="mb-2">
            <strong>Ingredients:</strong>
            <ul class="list-disc list-inside">
              <li
                v-for="ingredient in recipe.recipe_ingredients"
                :key="ingredient.id"
              >
                {{ ingredient.name
                }}<span v-if="ingredient.quantity">
                  ({{ ingredient.quantity }})</span
                >
              </li>
            </ul>
          </div>
          <div class="mb-2">
            <strong>Steps:</strong>
            <ol class="list-decimal list-inside">
              <li v-for="step in recipe.recipe_steps" :key="step.id">
                {{ step.description }}
              </li>
            </ol>
          </div>
          <div class="flex gap-2 mt-4">
            <NuxtLink
              :to="`/recipe/${recipe.id}`"
              class="text-green-500 hover:text-green-700 px-3 py-1 rounded border border-green-500 hover:bg-green-50"
            >
              View
            </NuxtLink>
            <button
              v-if="recipe.user_id === userId"
              class="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-500 hover:bg-blue-50"
              @click="startEdit(recipe)"
            >
              Edit
            </button>
            <button
              v-if="recipe.user_id === userId"
              class="text-red-500 hover:text-red-700 px-3 py-1 rounded border border-red-500 hover:bg-red-50"
              @click="confirmDelete(recipe)"
              :disabled="deletingId === recipe.id"
            >
              <span v-if="deletingId === recipe.id">Deleting...</span>
              <span v-else>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Edit Modal -->
  <div
    v-if="showEditModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 overflow-y-auto py-8"
  >
    <div
      class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative my-auto mx-auto max-h-[90vh] overflow-y-auto"
    >
      <button
        class="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        @click="closeEditModal"
      >
        &times;
      </button>
      <h2 class="text-2xl font-bold mb-4">Edit Recipe</h2>
      <form @submit.prevent="submitEdit">
        <div class="mb-4">
          <label class="block mb-1 font-medium">Title</label>
          <input
            v-model="editForm.title"
            class="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Description</label>
          <textarea
            v-model="editForm.description"
            class="w-full border rounded px-3 py-2"
            required
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Category</label>
          <select
            v-model="editForm.category_id"
            class="w-full border rounded px-3 py-2"
          >
            <option value="">Select a category (optional)</option>
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Prep Time (minutes)</label>
          <input
            v-model="editForm.prep_time_minutes"
            type="number"
            min="1"
            class="w-full border rounded px-3 py-2"
            placeholder="e.g., 30"
          />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Recipe Images</label>
          <div class="flex flex-wrap gap-2 mb-2">
            <div
              v-for="(image, index) in editForm.images"
              :key="index"
              class="relative border rounded-md p-1 w-20 h-20"
            >
              <img
                v-if="image.url"
                :src="image.url"
                alt="Recipe image"
                class="w-full h-full object-cover rounded"
              />
              <div class="absolute top-1 right-1 flex gap-1">
                <button
                  type="button"
                  @click="setEditFeaturedImage(index)"
                  class="bg-yellow-100 hover:bg-yellow-200 p-1 rounded-full"
                  :class="{ 'bg-yellow-400': image.is_featured }"
                  title="Set as featured image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="{2}"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="removeEditImage(index)"
                  class="bg-red-100 hover:bg-red-200 p-1 rounded-full"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="{2}"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Add new image -->
            <div
              class="border border-dashed rounded-md p-1 w-20 h-20 flex items-center justify-center"
            >
              <div class="text-center">
                <div class="flex flex-col gap-1">
                  <input
                    v-model="newEditImageUrl"
                    type="text"
                    placeholder="URL"
                    class="w-full border border-gray-300 rounded p-1 text-xs mb-1"
                  />
                  <button
                    type="button"
                    @click="addEditImage"
                    class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded hover:bg-blue-600"
                  >
                    Add URL
                  </button>
                  <div class="relative w-full mt-1">
                    <input
                      type="file"
                      id="upload-image"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      @change="uploadImage"
                      :disabled="editLoading"
                    />
                    <button
                      type="button"
                      class="text-xs bg-green-500 text-white px-2 py-0.5 rounded hover:bg-green-600 w-full"
                      :class="{ 'opacity-50': editLoading }"
                    >
                      {{ editLoading ? "Uploading..." : "Upload" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!hasEditFeaturedImage" class="text-yellow-600 text-xs">
            Please select a featured image for the recipe thumbnail.
          </div>
        </div>

        <!-- Dynamic Ingredients -->
        <div class="mb-4">
          <label class="block mb-1 font-medium">Ingredients</label>
          <div
            v-for="(ingredient, index) in editForm.ingredients"
            :key="index"
            class="flex gap-2 mb-2"
          >
            <input
              v-model="ingredient.name"
              placeholder="Ingredient name"
              class="flex-1 border rounded px-2 py-1"
              required
            />
            <input
              v-model="ingredient.quantity"
              placeholder="Quantity"
              class="w-24 border rounded px-2 py-1"
            />
            <button
              type="button"
              @click="removeEditIngredient(index)"
              class="px-2 py-1 text-red-500 border border-red-300 rounded hover:bg-red-50"
              :disabled="editForm.ingredients.length <= 1"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            @click="addEditIngredient"
            class="mt-1 px-3 py-1 text-blue-500 border border-blue-300 rounded hover:bg-blue-50"
          >
            Add Ingredient
          </button>
        </div>

        <!-- Dynamic Steps -->
        <div class="mb-4">
          <label class="block mb-1 font-medium">Cooking Steps</label>
          <div
            v-for="(step, index) in editForm.steps"
            :key="index"
            class="flex gap-2 mb-2"
          >
            <span
              class="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs"
            >
              {{ index + 1 }}
            </span>
            <textarea
              v-model="step.description"
              placeholder="Step description"
              class="flex-1 border rounded px-2 py-1"
              rows="2"
              required
            ></textarea>
            <button
              type="button"
              @click="removeEditStep(index)"
              class="px-2 py-1 text-red-500 border border-red-300 rounded hover:bg-red-50"
              :disabled="editForm.steps.length <= 1"
            >
              ×
            </button>
          </div>
          <button
            type="button"
            @click="addEditStep"
            class="mt-1 px-3 py-1 text-blue-500 border border-blue-300 rounded hover:bg-blue-50"
          >
            Add Step
          </button>
        </div>
        <div class="flex justify-end gap-2">
          <button
            type="button"
            class="px-4 py-2 rounded border"
            @click="closeEditModal"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            :disabled="editLoading"
          >
            <span v-if="editLoading">Saving...</span>
            <span v-else>Save</span>
          </button>
        </div>
        <div v-if="editError" class="text-red-500 mt-2">{{ editError }}</div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useQuery, useMutation } from "@vue/apollo-composable";
import GetMyRecipesQuery from "~/queries/my-recipes.gql";
import DeleteRecipeMutation from "~/queries/delete-recipe.gql";
import UpdateRecipeMutation from "~/queries/update-recipe-basic.gql";
import GetCategoriesQuery from "~/queries/categories.gql";
import { useImageUpload } from "~/composables/useImageUpload";
import RecipeLikes from "~/components/RecipeLikes.vue";

definePageMeta({
  middleware: "auth",
});

const { getUserId } = useAuth();
const userId = getUserId();
if (!userId) {
  throw createError({
    statusCode: 401,
    statusMessage: "User not authenticated",
  });
}

const {
  result: data,
  loading: pending,
  error,
  refetch,
} = useQuery(GetMyRecipesQuery, { user_id: userId });

// Fetch categories for dropdown
const { result: categoriesData } = useQuery(GetCategoriesQuery);
const categories = computed(() => categoriesData.value?.categories || []);

// Sorting functionality
const sortBy = ref("newest");

const filteredRecipes = computed(() => {
  if (!data.value?.recipes) return [];

  // Create a shallow copy of the array before sorting to avoid mutating the original
  const recipes = [...data.value.recipes];

  return recipes.sort((a, b) => {
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
      default:
        return 0;
    }
  });
});

// Delete functionality
const deletingId = ref(null);
const { mutate: deleteRecipe } = useMutation(DeleteRecipeMutation);

function confirmDelete(recipe) {
  if (window.confirm(`Are you sure you want to delete "${recipe.title}"?`)) {
    deletingId.value = recipe.id;
    deleteRecipe({ id: recipe.id })
      .then(() => {
        refetch();
      })
      .catch((e) => {
        alert("Failed to delete recipe: " + (e.message || e));
      })
      .finally(() => {
        deletingId.value = null;
      });
  }
}

// Edit functionality
const showEditModal = ref(false);
const editForm = ref({
  id: null,
  title: "",
  description: "",
  category_id: "",
  prep_time_minutes: null,
  images: [],
  ingredients: [],
  steps: [],
});
const newEditImageUrl = ref("");
const hasEditFeaturedImage = computed(() =>
  editForm.value.images.some((img) => img.is_featured)
);
const editLoading = ref(false);
const editError = ref("");
const { mutate: updateRecipeBasic } = useMutation(UpdateRecipeMutation);
const { processImageFile } = useImageUpload();

function addEditImage() {
  if (!newEditImageUrl.value.trim()) return;

  // Add the new image
  const isFirstImage = editForm.value.images.length === 0;
  editForm.value.images.push({
    url: newEditImageUrl.value.trim(),
    is_featured: isFirstImage, // First image is automatically set as featured
  });

  // Clear input
  newEditImageUrl.value = "";
}

function removeEditImage(index) {
  const wasFeaturendImage = editForm.value.images[index].is_featured;
  editForm.value.images.splice(index, 1);

  // If we removed the featured image and we still have other images, set the first one as featured
  if (wasFeaturendImage && editForm.value.images.length > 0) {
    editForm.value.images[0].is_featured = true;
  }
}

function setEditFeaturedImage(index) {
  // Unmark all images as featured
  editForm.value.images.forEach((img) => (img.is_featured = false));
  // Mark the selected image as featured
  editForm.value.images[index].is_featured = true;
}

// File upload handler
async function uploadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Show loading indicator
    editLoading.value = true;

    // Validate file mime type directly
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp|bmp)/i)) {
      throw new Error(
        "Invalid file type. Please select a JPG, PNG, GIF, WebP, or BMP image."
      );
    }

    // Process the image (compress if needed and convert to base64)
    const base64String = await processImageFile(file, {
      maxWidth: 1200,
      quality: 0.8,
    });

    // Check base64 string validity (very basic check)
    if (
      !base64String ||
      typeof base64String !== "string" ||
      !base64String.startsWith("data:image/")
    ) {
      throw new Error("Failed to process image. Please try another image.");
    }

    // For now, store the image as base64 data URL
    // In a production environment, you would upload to a server/storage service
    const isFirstImage = editForm.value.images.length === 0;
    editForm.value.images.push({
      url: base64String,
      is_featured: isFirstImage, // First image is automatically set as featured
    });

    // Reset the file input
    event.target.value = "";
  } catch (error) {
    console.error("Error uploading image:", error);
    // Display the specific error message to the user
    alert(error.message || "Failed to upload image. Please try again.");
  } finally {
    editLoading.value = false;
  }
}

function addEditIngredient() {
  editForm.value.ingredients.push({ name: "", quantity: "" });
}

function removeEditIngredient(index) {
  if (editForm.value.ingredients.length > 1) {
    editForm.value.ingredients.splice(index, 1);
  }
}

function addEditStep() {
  editForm.value.steps.push({ description: "" });
}

function removeEditStep(index) {
  if (editForm.value.steps.length > 1) {
    editForm.value.steps.splice(index, 1);
  }
}

function startEdit(recipe) {
  const images =
    recipe.recipe_images?.map((img) => ({
      id: img.id,
      url: img.url,
      is_featured: img.is_featured,
    })) || [];

  // If no images have is_featured=true but we have images, mark the first as featured
  if (images.length > 0 && !images.some((img) => img.is_featured)) {
    images[0].is_featured = true;
  }

  editForm.value = {
    id: recipe.id,
    title: recipe.title || "",
    description: recipe.description || "",
    category_id: recipe.category?.id || "",
    prep_time_minutes: recipe.prep_time_minutes || null,
    images: images,
    ingredients: recipe.recipe_ingredients.map((i) => ({ ...i })),
    steps: recipe.recipe_steps.map((s) => ({ ...s })),
  };
  showEditModal.value = true;
  editError.value = "";
}

function closeEditModal() {
  showEditModal.value = false;
  editForm.value = {
    id: null,
    title: "",
    description: "",
    category_id: "",
    prep_time_minutes: null,
    images: [],
    ingredients: [],
    steps: [],
  };
  newEditImageUrl.value = "";
  editError.value = "";
}

// NOTE: You must implement new mutations for updating recipe, ingredients, and steps in Hasura and import them here.
// This is a placeholder for the new logic:
async function submitEdit() {
  editLoading.value = true;
  editError.value = "";
  try {
    const recipeId = editForm.value.id;

    // 1. Update the recipe's main fields (title, description)
    await updateRecipeBasic({
      id: recipeId,
      title: editForm.value.title,
      description: editForm.value.description,
      category_id: editForm.value.category_id || null,
      prep_time_minutes: editForm.value.prep_time_minutes || null,
    });

    // 2. Delete existing ingredients and steps, then recreate them
    await $fetch("http://localhost:8080/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "myadminsecretkey",
      },
      body: JSON.stringify({
        query: `
          mutation DeleteIngredients($recipe_id: uuid!) {
            delete_recipe_ingredients(where: { recipe_id: { _eq: $recipe_id } }) {
              affected_rows
            }
          }
        `,
        variables: { recipe_id: recipeId },
      }),
    });

    await $fetch("http://localhost:8080/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "myadminsecretkey",
      },
      body: JSON.stringify({
        query: `
          mutation DeleteSteps($recipe_id: uuid!) {
            delete_recipe_steps(where: { recipe_id: { _eq: $recipe_id } }) {
              affected_rows
            }
          }
        `,
        variables: { recipe_id: recipeId },
      }),
    });

    // 3. Insert new ingredients
    const validIngredients = editForm.value.ingredients.filter((ing) =>
      ing.name.trim()
    );
    if (validIngredients.length > 0) {
      const ingredientsData = validIngredients.map((ingredient) => ({
        recipe_id: recipeId,
        name: ingredient.name.trim(),
        quantity: ingredient.quantity?.trim() || null,
      }));

      await $fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "myadminsecretkey",
        },
        body: JSON.stringify({
          query: `
            mutation InsertIngredients($objects: [recipe_ingredients_insert_input!]!) {
              insert_recipe_ingredients(objects: $objects) {
                returning {
                  id
                }
              }
            }
          `,
          variables: { objects: ingredientsData },
        }),
      });
    }

    // 4. Insert new steps
    const validSteps = editForm.value.steps.filter((step) =>
      step.description.trim()
    );
    if (validSteps.length > 0) {
      const stepsData = validSteps.map((step, index) => ({
        recipe_id: recipeId,
        step_number: index + 1,
        description: step.description.trim(),
      }));

      await $fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "myadminsecretkey",
        },
        body: JSON.stringify({
          query: `
            mutation InsertSteps($objects: [recipe_steps_insert_input!]!) {
              insert_recipe_steps(objects: $objects) {
                returning {
                  id
                }
              }
            }
          `,
          variables: { objects: stepsData },
        }),
      });
    }

    // 5. Handle recipe images
    // First validate that at least one image is marked as featured if we have images
    if (editForm.value.images.length > 0 && !hasEditFeaturedImage.value) {
      throw new Error(
        "Please select a featured image for the recipe thumbnail"
      );
    }

    // Delete all existing images
    await $fetch("http://localhost:8080/v1/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": "myadminsecretkey",
      },
      body: JSON.stringify({
        query: `
          mutation DeleteAllImages($recipe_id: uuid!) {
            delete_recipe_images(where: { recipe_id: { _eq: $recipe_id } }) {
              affected_rows
            }
          }
        `,
        variables: { recipe_id: recipeId },
      }),
    });

    // Insert new images if available
    if (editForm.value.images.length > 0) {
      // In a production environment, you'd upload any file-based images to a server/storage service here
      // For now, we're using the base64 data directly or the URL

      const imagesData = editForm.value.images.map((image) => {
        // Use the URL we already have (either original URL or base64 data URL from upload)
        return {
          recipe_id: recipeId,
          url: image.url,
          is_featured: image.is_featured,
        };
      });

      await $fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "myadminsecretkey",
        },
        body: JSON.stringify({
          query: `
            mutation InsertImages($objects: [recipe_images_insert_input!]!) {
              insert_recipe_images(objects: $objects) {
                returning {
                  id
                }
              }
            }
          `,
          variables: { objects: imagesData },
        }),
      });
    }

    refetch();
    closeEditModal();
  } catch (e) {
    editError.value = e.message || "Failed to update recipe.";
  } finally {
    editLoading.value = false;
  }
}
</script>
