<template>
  <div class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto text-center">
      <div v-if="loading" class="py-8">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"
        ></div>
        <p class="mt-4 text-gray-600">Verifying your payment...</p>
      </div>

      <div v-else-if="verificationResult?.success" class="py-8">
        <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div
            class="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-green-800 mb-2">
            Payment Successful!
          </h1>
          <p class="text-green-700">
            Your purchase has been completed successfully. You now have access
            to this recipe!
          </p>
        </div>

        <div v-if="recipe" class="bg-white border rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold mb-2">{{ recipe.title }}</h2>
          <p class="text-gray-600 mb-4">{{ recipe.description }}</p>
          <div class="text-sm text-gray-500">
            <p><strong>Transaction ID:</strong> {{ txRef }}</p>
            <p>
              <strong>Amount:</strong> {{ verificationResult.data.amount }}
              {{ verificationResult.data.currency }}
            </p>
            <p><strong>Date:</strong> {{ formatDate(new Date()) }}</p>
          </div>
        </div>

        <div class="space-x-4">
          <NuxtLink
            :to="`/recipe/${recipeId}`"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Recipe
          </NuxtLink>
          <NuxtLink
            to="/my-recipes"
            class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            My Recipes
          </NuxtLink>
        </div>
      </div>

      <div v-else class="py-8">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div
            class="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4"
          >
            <svg
              class="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
          <p class="text-red-700 mb-4">
            {{
              error ||
              "There was an issue processing your payment. Please try again."
            }}
          </p>
          <p class="text-sm text-red-600">
            If you believe this is an error, please contact support with
            transaction reference: {{ txRef }}
          </p>
        </div>

        <div class="space-x-4">
          <NuxtLink
            :to="`/recipe/${recipeId}`"
            class="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </NuxtLink>
          <NuxtLink
            to="/"
            class="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Back to Home
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useChapaPayment } from "~/composables/useChapaPayment";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { UpdatePurchaseStatus } from "~/queries/recipe-payments.gql";
import GetRecipeByIdQuery from "~/queries/recipe-detail.gql";

const route = useRoute();
const recipeId = route.params.id;
const txRef = route.query.tx_ref;

const { verifyPayment } = useChapaPayment();
const { mutate: updatePurchaseStatus } = useMutation(UpdatePurchaseStatus);

const loading = ref(true);
const error = ref("");
const verificationResult = ref(null);

// Get recipe details
const { result: recipeData } = useQuery(GetRecipeByIdQuery, {
  id: recipeId,
});

const recipe = computed(() => recipeData.value?.recipes_by_pk);

const verifyAndUpdatePurchase = async () => {
  if (!txRef) {
    error.value = "No transaction reference found";
    loading.value = false;
    return;
  }

  try {
    // Verify payment with Chapa
    const result = await verifyPayment(txRef);
    verificationResult.value = result;

    // Update purchase status in database
    const paymentStatus =
      result.data.status === "success" ? "completed" : "failed";

    await updatePurchaseStatus({
      transaction_id: txRef,
      payment_status: paymentStatus,
      chapa_response_data: result.data,
    });

    if (result.data.status !== "success") {
      error.value = "Payment was not successful";
    }
  } catch (err) {
    console.error("Payment verification error:", err);
    error.value = err.message || "Failed to verify payment";

    // Still try to update the purchase status as failed
    try {
      await updatePurchaseStatus({
        transaction_id: txRef,
        payment_status: "failed",
        chapa_response_data: { error: err.message },
      });
    } catch (updateErr) {
      console.error("Failed to update purchase status:", updateErr);
    }
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  verifyAndUpdatePurchase();
});

// SEO
useHead({
  title: "Purchase Status - Food Recipes",
  meta: [
    {
      name: "description",
      content:
        "Payment verification and purchase status for your recipe purchase.",
    },
  ],
});
</script>
