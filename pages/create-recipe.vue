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
          for="image_url"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Image URL (optional)
        </label>
        <Field
          name="image_url"
          type="url"
          id="image_url"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="https://example.com/image.jpg"
        />
        <ErrorMessage name="image_url" class="text-red-500 text-sm mt-1" />
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
import { useMutation } from "@vue/apollo-composable";
import CreateRecipeMutation from "~/queries/create-recipe.gql";

definePageMeta({
  middleware: "auth",
});

const schema = yup.object({
  title: yup.string().required("Recipe title is required"),
  description: yup.string().required("Description is required"),
  image_url: yup.string().url("Must be a valid URL").optional(),
});

const router = useRouter();
const { mutate: createRecipe } = useMutation(CreateRecipeMutation);
const { getUserId } = useAuth();

// Dynamic ingredients and steps
const ingredients = ref([{ name: '', quantity: '' }]);
const steps = ref([{ description: '' }]);

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

    // Step 4: Create featured image if provided
    if (values.image_url) {
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
              recipe_id: newRecipeId,
              url: values.image_url,
              is_featured: true,
            },
          },
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
