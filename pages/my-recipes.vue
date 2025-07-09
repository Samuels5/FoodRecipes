<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Recipes</h1>
      <div class="flex gap-4 items-center">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Sort by</label>
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

    <div v-else-if="!data?.recipes?.length" class="text-center py-8">
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
        v-for="recipe in sortedRecipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
      >
        <img
          :src="recipe.recipe_images[0]?.url || 'https://via.placeholder.com/400x300?text=Recipe+Image'"
          :alt="recipe.title"
          class="w-full h-48 object-cover"
        />
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">{{ recipe.title }}</h3>
          <p class="text-gray-600 mb-2 line-clamp-2">{{ recipe.description }}</p>
          <div class="flex justify-between items-center text-sm text-gray-500 mb-2">
            <span>Category: {{ recipe.category?.name || 'Uncategorized' }}</span>
            <span v-if="recipe.prep_time_minutes" class="bg-orange-100 text-orange-800 px-2 py-1 rounded">
              {{ recipe.prep_time_minutes }}min
            </span>
          </div>
          <div class="mb-2">
            <strong>Ingredients:</strong>
            <ul class="list-disc list-inside">
              <li v-for="ingredient in recipe.recipe_ingredients" :key="ingredient.id">
                {{ ingredient.name }}<span v-if="ingredient.quantity"> ({{ ingredient.quantity }})</span>
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
              class="text-blue-500 hover:text-blue-700 px-3 py-1 rounded border border-blue-500 hover:bg-blue-50"
              @click="startEdit(recipe)"
            >
              Edit
            </button>
            <button
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
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
  >
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
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
            <option v-for="category in categories" :key="category.id" :value="category.id">
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
          <label class="block mb-1 font-medium">Image URL</label>
          <input
            v-model="editForm.image_url"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <!-- Dynamic Ingredients -->
        <div class="mb-4">
          <label class="block mb-1 font-medium">Ingredients</label>
          <div v-for="(ingredient, index) in editForm.ingredients" :key="index" class="flex gap-2 mb-2">
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
          <div v-for="(step, index) in editForm.steps" :key="index" class="flex gap-2 mb-2">
            <span class="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs">
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
} = useQuery(GetMyRecipesQuery, {
  userId: userId,
});

// Fetch categories for dropdown
const { result: categoriesData } = useQuery(GetCategoriesQuery);
const categories = computed(() => categoriesData.value?.categories || []);

// Sorting functionality
const sortBy = ref('newest');

const sortedRecipes = computed(() => {
  if (!data.value?.recipes) return [];
  
  const recipes = [...data.value.recipes];
  
  return recipes.sort((a, b) => {
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
  image_url: "",
  ingredients: [],
  steps: [],
});
const editLoading = ref(false);
const editError = ref("");
const { mutate: updateRecipeBasic } = useMutation(UpdateRecipeMutation);

function addEditIngredient() {
  editForm.value.ingredients.push({ name: '', quantity: '' });
}

function removeEditIngredient(index) {
  if (editForm.value.ingredients.length > 1) {
    editForm.value.ingredients.splice(index, 1);
  }
}

function addEditStep() {
  editForm.value.steps.push({ description: '' });
}

function removeEditStep(index) {
  if (editForm.value.steps.length > 1) {
    editForm.value.steps.splice(index, 1);
  }
}

function startEdit(recipe) {
  editForm.value = {
    id: recipe.id,
    title: recipe.title || "",
    description: recipe.description || "",
    category_id: recipe.category?.id || "",
    prep_time_minutes: recipe.prep_time_minutes || null,
    image_url: recipe.recipe_images[0]?.url || "",
    ingredients: recipe.recipe_ingredients.map(i => ({ ...i })),
    steps: recipe.recipe_steps.map(s => ({ ...s })),
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
    image_url: "",
    ingredients: [],
    steps: [],
  };
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
    const validIngredients = editForm.value.ingredients.filter(ing => ing.name.trim());
    if (validIngredients.length > 0) {
      const ingredientsData = validIngredients.map(ingredient => ({
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
    const validSteps = editForm.value.steps.filter(step => step.description.trim());
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

    // 5. Handle image update if needed
    if (editForm.value.image_url) {
      // Delete existing featured image
      await $fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "myadminsecretkey",
        },
        body: JSON.stringify({
          query: `
            mutation DeleteFeaturedImage($recipe_id: uuid!) {
              delete_recipe_images(where: { recipe_id: { _eq: $recipe_id }, is_featured: { _eq: true } }) {
                affected_rows
              }
            }
          `,
          variables: { recipe_id: recipeId },
        }),
      });

      // Insert new featured image
      await $fetch("http://localhost:8080/v1/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hasura-admin-secret": "myadminsecretkey",
        },
        body: JSON.stringify({
          query: `
            mutation InsertImage($object: recipe_images_insert_input!) {
              insert_recipe_images_one(object: $object) {
                id
              }
            }
          `,
          variables: {
            object: {
              recipe_id: recipeId,
              url: editForm.value.image_url,
              is_featured: true,
            },
          },
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
