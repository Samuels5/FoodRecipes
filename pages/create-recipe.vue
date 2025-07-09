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

      <div>
        <label
          for="ingredients"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Ingredients
        </label>
        <Field
          name="ingredients"
          as="textarea"
          id="ingredients"
          rows="5"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="List ingredients (one per line)"
        />
        <ErrorMessage name="ingredients" class="text-red-500 text-sm mt-1" />
      </div>

      <div>
        <label
          for="instructions"
          class="block text-sm font-medium text-gray-700 mb-2"
        >
          Instructions
        </label>
        <Field
          name="instructions"
          as="textarea"
          id="instructions"
          rows="8"
          class="w-full border border-gray-300 rounded-md shadow-sm p-3"
          placeholder="Step-by-step cooking instructions"
        />
        <ErrorMessage name="instructions" class="text-red-500 text-sm mt-1" />
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
  ingredients: yup.string().required("Ingredients are required"),
  instructions: yup.string().required("Instructions are required"),
});

const router = useRouter();
const { mutate: createRecipe } = useMutation(CreateRecipeMutation);
const { getUserId } = useAuth();

async function handleSubmit(values) {
  try {
    console.log("Submitting recipe:", values);

    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to create a recipe.");
      return;
    }

    // Provide a default image URL if none is provided and include user_id
    const recipeData = {
      ...values,
      image_url:
        values.image_url ||
        "https://via.placeholder.com/400x300?text=Recipe+Image",
      user_id: userId,
    };

    const result = await createRecipe({
      object: recipeData,
    });

    console.log("GraphQL result:", result);

    if (result?.data?.insert_recipes_one) {
      alert("Recipe created successfully!");
      await router.push("/my-recipes");
    } else {
      console.error("No data returned from mutation:", result);
      alert("Failed to create recipe. No data returned.");
    }
  } catch (error) {
    console.error("Error creating recipe:", error);
    console.error("Error details:", error.message, error.graphQLErrors);
    alert(`Failed to create recipe: ${error.message || "Unknown error"}`);
  }
}
</script>
