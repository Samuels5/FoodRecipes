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
          <option
            v-for="category in categories"
            :key="category.id"
            :value="category.id"
          >
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
        <ErrorMessage
          name="prep_time_minutes"
          class="text-red-500 text-sm mt-1"
        />
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
                  :class="{ 'bg-yellow-400': image.is_featured }"
                  title="Set as featured image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
                  @click="removeImage(index)"
                  class="bg-red-100 hover:bg-red-200 p-1 rounded-full"
                  title="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
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
              class="border border-dashed rounded-md p-1 w-32 h-32 flex flex-col items-center justify-center"
            >
              <div class="text-center">
                <div class="text-gray-500 mb-1">Add Image</div>
                <input
                  v-model="newImageUrl"
                  type="text"
                  placeholder="Image URL"
                  class="w-full border border-gray-300 rounded p-1 text-xs mb-1"
                />
                <button
                  type="button"
                  @click="addImage"
                  class="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 w-full"
                >
                  Add URL
                </button>
                <div class="relative w-full mt-1">
                  <input
                    type="file"
                    id="upload-create-image"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/bmp"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    @change="uploadImage"
                    :disabled="isSubmitting"
                  />
                  <button
                    type="button"
                    class="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 w-full"
                    :class="{ 'opacity-50': isSubmitting }"
                  >
                    {{ isSubmitting ? "Uploading..." : "Upload" }}
                  </button>
                </div>
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
        <div
          v-for="(ingredient, index) in ingredients"
          :key="index"
          class="flex gap-2 mb-2"
        >
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
        <div
          v-for="(step, index) in steps"
          :key="index"
          class="flex gap-2 mb-2"
        >
          <span
            class="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-sm font-medium"
          >
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

      <!-- Pricing Section -->
      <div class="border-t pt-6">
        <h3 class="text-lg font-medium text-gray-700 mb-4">Recipe Pricing</h3>

        <div class="space-y-4">
          <!-- Free/Paid Toggle -->
          <div>
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="isFreeRecipe"
                class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
              />
              <span class="ml-2 text-sm text-gray-700"
                >Make this recipe free</span
              >
            </label>
          </div>

          <!-- Pricing fields (shown only if not free) -->
          <div
            v-if="!isFreeRecipe"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label
                for="price"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Price (ETB)
              </label>
              <input
                v-model="recipePrice"
                type="number"
                id="price"
                min="1"
                step="0.01"
                class="w-full border border-gray-300 rounded-md shadow-sm p-3"
                placeholder="e.g., 100.00"
              />
            </div>

            <div>
              <label
                for="currency"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Currency
              </label>
              <select
                v-model="recipeCurrency"
                id="currency"
                class="w-full border border-gray-300 rounded-md shadow-sm p-3"
              >
                <option value="ETB">Ethiopian Birr (ETB)</option>
                <option value="USD">US Dollar (USD)</option>
                <option value="EUR">Euro (EUR)</option>
              </select>
            </div>

            <div class="md:col-span-2">
              <label
                for="discount_percentage"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Discount Percentage (optional)
              </label>
              <input
                v-model="discountPercentage"
                type="number"
                id="discount_percentage"
                min="0"
                max="100"
                step="0.01"
                class="w-full border border-gray-300 rounded-md shadow-sm p-3"
                placeholder="e.g., 10 (for 10% discount)"
              />
              <p class="text-xs text-gray-500 mt-1">
                Enter a number between 0-100 for discount percentage
              </p>
            </div>
          </div>

          <!-- Price preview -->
          <div
            v-if="!isFreeRecipe && pricePreview"
            class="bg-gray-50 p-3 rounded-md"
          >
            <h4 class="text-sm font-medium text-gray-700 mb-2">
              Price Preview:
            </h4>
            <div class="text-sm text-gray-600">
              <div v-if="pricePreview.hasDiscount">
                <span class="line-through">{{
                  pricePreview.originalPrice
                }}</span>
                <span class="text-green-600 font-medium ml-2">{{
                  pricePreview.finalPrice
                }}</span>
                <span class="text-xs text-gray-500 ml-2"
                  >({{ pricePreview.discountPercent }}% off)</span
                >
              </div>
              <div v-else>
                <span class="font-medium">{{ pricePreview.finalPrice }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4">
        <button
          type="submit"
          class="bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 flex-1"
          :disabled="isSubmitting"
          :class="{ 'opacity-70 cursor-not-allowed': isSubmitting }"
        >
          {{ isSubmitting ? "Creating Recipe..." : "Create Recipe" }}
        </button>
        <NuxtLink
          to="/my-recipes"
          class="bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 text-center flex-1"
          :class="{ 'pointer-events-none opacity-50': isSubmitting }"
          :tabindex="isSubmitting ? -1 : undefined"
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
import { AddRecipePricing } from "~/queries/recipe-payments.gql";
import GetCategoriesQuery from "~/queries/categories.gql";
import { useImageUpload } from "~/composables/useImageUpload";

definePageMeta({
  middleware: "auth",
});

const schema = yup.object({
  title: yup.string().required("Recipe title is required"),
  description: yup.string().required("Description is required"),
  prep_time_minutes: yup
    .number()
    .positive("Must be a positive number")
    .optional(),
  is_free: yup.boolean().default(true),
  price: yup.number().optional(),
  currency: yup.string().optional(),
  discount_percentage: yup
    .number()
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100%")
    .optional(),
});

const router = useRouter();
const { mutate: createRecipe } = useMutation(CreateRecipeMutation);
const { mutate: addRecipePricing } = useMutation(AddRecipePricing);
const { getUserId } = useAuth();
const { processImageFile } = useImageUpload();

// Fetch categories for dropdown
const { result: categoriesData } = useQuery(GetCategoriesQuery);
const categories = computed(() => categoriesData.value?.categories || []);

// Dynamic ingredients and steps
const ingredients = ref([{ name: "", quantity: "" }]);
const steps = ref([{ description: "" }]);
const images = ref([]);
const newImageUrl = ref("");
const isSubmitting = ref(false); // Define isSubmitting state for upload loading indicator

// Pricing related variables
const isFreeRecipe = ref(true);
const recipePrice = ref(0);
const recipeCurrency = ref("ETB");
const discountPercentage = ref(0);

const hasFeaturedImage = computed(() =>
  images.value.some((img) => img.is_featured)
);

// Price preview calculation
const pricePreview = computed(() => {
  if (isFreeRecipe.value || !recipePrice.value) return null;

  const originalPrice = parseFloat(recipePrice.value);
  const discount = parseFloat(discountPercentage.value) || 0;
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount
    ? originalPrice * (1 - discount / 100)
    : originalPrice;

  return {
    originalPrice: `${originalPrice.toFixed(2)} ${recipeCurrency.value}`,
    finalPrice: `${finalPrice.toFixed(2)} ${recipeCurrency.value}`,
    discountPercent: discount,
    hasDiscount,
  };
});

// Watch for form field changes to update price preview
watch(
  [isFreeRecipe, recipePrice, recipeCurrency, discountPercentage],
  () => {
    // This will trigger the computed property update
  },
  { deep: true }
);

function addImage() {
  if (!newImageUrl.value.trim()) return;

  // Add the new image
  const isFirstImage = images.value.length === 0;
  images.value.push({
    url: newImageUrl.value.trim(),
    is_featured: isFirstImage, // First image is automatically set as featured
  });

  // Clear input
  newImageUrl.value = "";
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
  images.value.forEach((img) => (img.is_featured = false));
  // Mark the selected image as featured
  images.value[index].is_featured = true;
}

// File upload handler
async function uploadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Show loading state if needed
    isSubmitting.value = true;

    // Validate file mime type directly
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp|bmp)/i)) {
      throw new Error(
        "Invalid file type. Please select a JPG, PNG, GIF, WebP, or BMP image."
      );
    }

    // Process the image with compression and optimization
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
    const isFirstImage = images.value.length === 0;
    images.value.push({
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
    isSubmitting.value = false;
  }
}

function addIngredient() {
  ingredients.value.push({ name: "", quantity: "" });
}

function removeIngredient(index) {
  if (ingredients.value.length > 1) {
    ingredients.value.splice(index, 1);
  }
}

function addStep() {
  steps.value.push({ description: "" });
}

function removeStep(index) {
  if (steps.value.length > 1) {
    steps.value.splice(index, 1);
  }
}

async function handleSubmit(values) {
  try {
    isSubmitting.value = true; // Set submitting state when starting form submission
    console.log("Submitting recipe:", values);
    console.log("Free recipe?", isFreeRecipe.value);
    console.log("Recipe price:", recipePrice.value);

    const userId = getUserId();
    if (!userId) {
      alert("You must be logged in to create a recipe.");
      isSubmitting.value = false; // Reset submitting state
      return;
    }

    // Validate pricing if recipe is not free
    if (!isFreeRecipe.value) {
      if (!recipePrice.value || parseFloat(recipePrice.value) <= 0) {
        alert("Please enter a valid price for paid recipes.");
        isSubmitting.value = false;
        return;
      }
      if (!recipeCurrency.value) {
        alert("Please select a currency for paid recipes.");
        isSubmitting.value = false;
        return;
      }
    }

    // Validate ingredients and steps
    const validIngredients = ingredients.value.filter((ing) => ing.name.trim());
    const validSteps = steps.value.filter((step) => step.description.trim());

    if (validIngredients.length === 0) {
      alert("Please add at least one ingredient.");
      isSubmitting.value = false;
      return;
    }

    if (validSteps.length === 0) {
      alert("Please add at least one cooking step.");
      isSubmitting.value = false;
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
    const ingredientsData = validIngredients.map((ingredient) => ({
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
        throw new Error(
          "Please select a featured image for the recipe thumbnail"
        );
      }

      // In a production environment, you'd upload any file-based images to a server/storage service here
      // For now, we're using the base64 data directly or the URL
      const imagesData = images.value.map((image) => ({
        recipe_id: newRecipeId,
        url: image.url, // This could be a URL or base64 data string from uploaded file
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

    // Step 5: Add recipe pricing
    try {
      const pricingData = {
        recipe_id: newRecipeId,
        price: isFreeRecipe.value ? 0 : parseFloat(recipePrice.value || 0),
        currency: recipeCurrency.value || "ETB",
        is_free: isFreeRecipe.value,
        discount_percentage: discountPercentage.value
          ? parseFloat(discountPercentage.value)
          : 0,
      };

      console.log("Adding pricing data:", pricingData);
      await addRecipePricing(pricingData);
    } catch (pricingError) {
      console.warn(
        "Failed to add pricing, but recipe was created:",
        pricingError
      );
      // Don't fail the entire operation if pricing fails
    }

    alert("Recipe created successfully!");
    await router.push("/my-recipes");
  } catch (error) {
    console.error("Error creating recipe:", error);
    alert(`Failed to create recipe: ${error.message || "Unknown error"}`);
  } finally {
    isSubmitting.value = false; // Reset submitting state whether successful or not
  }
}
</script>
