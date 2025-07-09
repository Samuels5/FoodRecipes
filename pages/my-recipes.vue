<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Recipes</h1>
      <NuxtLink
        to="/create-recipe"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Create New Recipe
      </NuxtLink>
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
        v-for="recipe in data.recipes"
        :key="recipe.id"
        class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
      >
        <img
          :src="recipe.image_url"
          :alt="recipe.title"
          class="w-full h-48 object-cover"
          @error="
            $event.target.src =
              'https://via.placeholder.com/400x300?text=Recipe+Image'
          "
        />
        <div class="p-6">
          <h3 class="text-xl font-semibold mb-2">{{ recipe.title }}</h3>
          <p class="text-gray-600 mb-4 line-clamp-2">
            {{ recipe.description }}
          </p>
          <div class="flex gap-2">
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
          <label class="block mb-1 font-medium">Image URL</label>
          <input
            v-model="editForm.image_url"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Ingredients</label>
          <textarea
            v-model="editForm.ingredients"
            class="w-full border rounded px-3 py-2"
            required
          ></textarea>
        </div>
        <div class="mb-4">
          <label class="block mb-1 font-medium">Instructions</label>
          <textarea
            v-model="editForm.instructions"
            class="w-full border rounded px-3 py-2"
            required
          ></textarea>
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
import UpdateRecipeMutation from "~/queries/update-recipe.gql";

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
  image_url: "",
  ingredients: "",
  instructions: "",
});
const editLoading = ref(false);
const editError = ref("");
const { mutate: updateRecipe } = useMutation(UpdateRecipeMutation);

function startEdit(recipe) {
  editForm.value = {
    id: recipe.id,
    title: recipe.title || "",
    description: recipe.description || "",
    image_url: recipe.image_url || "",
    ingredients: recipe.ingredients || "",
    instructions: recipe.instructions || "",
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
    image_url: "",
    ingredients: "",
    instructions: "",
  };
  editError.value = "";
}

function submitEdit() {
  editLoading.value = true;
  editError.value = "";
  // Convert textarea strings to arrays for jsonb
  const ingredients = editForm.value.ingredients
    ? editForm.value.ingredients.split('\n').filter(Boolean)
    : [];
  const instructions = editForm.value.instructions
    ? editForm.value.instructions.split('\n').filter(Boolean)
    : [];
  updateRecipe({
    id: editForm.value.id,
    title: editForm.value.title,
    description: editForm.value.description,
    image_url: editForm.value.image_url,
    ingredients,
    instructions,
  })
    .then(() => {
      refetch();
      closeEditModal();
    })
    .catch((e) => {
      editError.value = e.message || "Failed to update recipe.";
    })
    .finally(() => {
      editLoading.value = false;
    });
}
</script>
