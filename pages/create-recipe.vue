<template>
  <div class="max-w-2xl mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Create New Recipe</h1>

    <Form @submit="handleSubmit" :validation-schema="schema" class="space-y-6">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Recipe Title
        </label>
        <Field
          name="title"
          type="text"
          id="title"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="Enter recipe title"
        />
        <ErrorMessage name="title" class="text-red-500 text-sm mt-1" />
      </div>

      <div>
        <label
          for="description"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Description
        </label>
        <Field
          name="description"
          as="textarea"
          id="description"
          rows="3"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="Brief description of the recipe"
        />
        <ErrorMessage name="description" class="text-red-500 text-sm mt-1" />
      </div>

      <div>
        <label
          for="category_id"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Category
        </label>
        <Field
          name="category_id"
          as="select"
          id="category_id"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
        >
          <option value="">Select a category (optional)</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </Field>
        <ErrorMessage name="category_id" class="text-red-500 text-sm mt-1" />
      </div>

      <div>
        <label
          for="prep_time_minutes"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Prep Time (minutes)
        </label>
        <Field
          name="prep_time_minutes"
          type="number"
          id="prep_time_minutes"
          min="1"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="e.g., 30"
        />
        <ErrorMessage name="prep_time_minutes" class="text-red-500 text-sm mt-1" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Recipe Images
        </label>
        <div class="mb-4">
          <div class="flex flex-wrap gap-4 mb-2">
            <div 
              v-for="(image, index) in images" 
              :key="index" 
              class="relative border rounded-md p-1 w-32 h-32"
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
                  @click="setFeaturedImage(index)"
                  class="bg-yellow-100 hover:bg-yellow-200 p-1 rounded-full"
                  :class="{'bg-yellow-400': image.is_featured}"
                  title="Set as featured image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="removeImage(index)"
                  class="bg-red-100 hover:bg-red-200 p-1 rounded-full"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Add new image -->
            <div class="border border-dashed rounded-md p-1 w-32 h-32 flex flex-col items-center justify-center">
              <div class="text-center">
                <div class="text-gray-500 mb-1">Add Image</div>
                <input
                  v-model="newImageUrl"
                  type="text"
                  placeholder="Image URL"
                  class="w-full border border-gray-300 rounded p-1 text-xs"
                />
                <button
                  type="button"
                  @click="addImage"
                  class="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
          <div v-if="!hasFeaturedImage" class="text-yellow-600 text-sm">
            Please select a featured image for the recipe thumbnail.
          </div>
        </div>
      </div>

      <!-- Dynamic Ingredients Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ingredients
        </label>
        <div v-for="(ingredient, index) in ingredients" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="ingredient.name"
            placeholder="Ingredient name"
            class="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
            required
          />
          <input
            v-model="ingredient.quantity"
            placeholder="Quantity (optional)"
            class="w-32 border border-gray-300 rounded-md shadow-sm p-2"
          />
          <button
            type="button"
            @click="removeIngredient(index)"
            class="px-3 py-2 text-red-500 border border-red-300 rounded-md hover:bg-red-50"
            :disabled="ingredients.length <= 1"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="addIngredient"
          class="mt-2 px-4 py-2 text-blue-500 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          Add Ingredient
        </button>
      </div>

      <!-- Dynamic Steps Section -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Cooking Steps
        </label>
        <div v-for="(step, index) in steps" :key="index" class="flex gap-2 mb-2">
          <span class="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-medium">
            {{ index + 1 }}
          </span>
          <textarea
            v-model="step.description"
            placeholder="Describe this step..."
            class="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
            rows="2"
            required
          ></textarea>
          <button
            type="button"
            @click="removeStep(index)"
            class="px-3 py-2 text-red-500 border border-red-300 rounded-md hover:bg-red-50"
            :disabled="steps.length <= 1"
          >
            Remove
          </button>
        </div>
        <button
          type="button"
          @click="addStep"
          class="mt-2 px-4 py-2 text-blue-500 border border-blue-300 rounded-md hover:bg-blue-50"
        >
          Add Step
        </button>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          class="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 flex-1"
        >
          Create Recipe
        </button>
        <NuxtLink
          to="/my-recipes"
          class="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 text-center flex-1"
        >
          Cancel
        </NuxtLink>
      </div>
    </Form>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useMutation, useQuery } from "@vue/apollo-composable";
import CreateRecipeMutation from "~/queries/create-recipe.gql";
import GetCategoriesQuery from "~/queries/categories.gql";

definePageMeta({
  middleware: "auth",
});

const schema = yup.object({
  title: yup.string().required("Recipe title is required"),
  description: yup.string().required("Description is required"),
  prep_time_minutes: yup.number().positive("Must be a positive number").optional(),
});

const router = useRouter();
const { mutate: createRecipe } = useMutation(CreateRecipeMutation);
const { getUserId } = useAuth();

// Fetch categories for dropdown
const { result: categoriesData } = useQuery(GetCategoriesQuery);
const categories = computed(() => categoriesData.value?.categories || []);

// Dynamic ingredients and steps
const ingredients = ref([{ name: '', quantity: '' }]);
const steps = ref([{ description: '' }]);
const images = ref([]);
const newImageUrl = ref('');
const hasFeaturedImage = computed(() => images.value.some(img => img.is_featured));

function addImage() {
  if (!newImageUrl.value.trim()) return;
  
  // Add the new image
  const isFirstImage = images.value.length === 0;
  images.value.push({
    url: newImageUrl.value.trim(),
    is_featured: isFirstImage // First image is automatically set as featured
  });
  
  // Clear input
  newImageUrl.value = '';
}

function removeImage(index) {
  const wasFeaturendImage = images.value[index].is_featured;
  images.value.splice(index, 1);
  
  // If we removed the featured image and we still have other images, set the first one as featured
  if (wasFeaturendImage && images.value.length > 0) {
    images.value[0].is_featured = true;
  }
}

function setFeaturedImage(index) {
  // Unmark all images as featured
  images.value.forEach(img => img.is_featured = false);
  // Mark the selected image as featured
  images.value[index].is_featured = true;
}

function addIngredient() {
  ingredients.value.push({ name: '', quantity: '' });
}

function removeIngredient(index) {
  if (ingredients.value.length > 1) {
    ingredients.value.splice(index, 1);
  }
}

function addStep() {
  steps.value.push({ description: '' });
}

function removeStep(index) {
  if (steps.value.length > 1) {
    steps.value.splice(index, 1);
  }
}

async function handleSubmit(values) {
  try {
    console.log("Submitting recipe:", values);

    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to create a recipe.");
      return;
    }

    // Validate ingredients and steps
    const validIngredients = ingredients.value.filter(ing => ing.name.trim());
    const validSteps = steps.value.filter(step => step.description.trim());

    if (validIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      return;
    }

    if (validSteps.length === 0) {
      alert("Please add at least one cooking step.");
      return;
    }

    // Step 1: Create the recipe
    const recipeData = {
      title: values.title,
      description: values.description,
      user_id: userId,
      category_id: values.category_id || null,
      prep_time_minutes: values.prep_time_minutes || null,
    };

    const recipeResult = await createRecipe({
      object: recipeData,
    });

    const newRecipeId = recipeResult?.data?.insert_recipes_one?.id;
    if (!newRecipeId) {
      throw new Error("Failed to create recipe");
    }

    // Step 2: Create ingredients
    const ingredientsData = validIngredients.map(ingredient => ({
      recipe_id: newRecipeId,
      name: ingredient.name.trim(),
      quantity: ingredient.quantity.trim() || null,
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

    // Step 3: Create steps
    const stepsData = validSteps.map((step, index) => ({
      recipe_id: newRecipeId,
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

    // Step 4: Add recipe images if provided
    if (images.value.length > 0) {
      // Validate that at least one image is marked as featured
      if (!hasFeaturedImage.value) {
        throw new Error("Please select a featured image for the recipe thumbnail");
      }

      const imagesData = images.value.map(image => ({
        recipe_id: newRecipeId,
        url: image.url,
        is_featured: image.is_featured,
      }));

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

    alert("Recipe created successfully!");
    await router.push("/my-recipes");
  } catch (error) {
    console.error("Error creating recipe:", error);
    alert(`Failed to create recipe: ${error.message || "Unknown error"}`);
  }
}
</script>
