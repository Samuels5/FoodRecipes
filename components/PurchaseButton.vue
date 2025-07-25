<template>
  <div>
    <template v-if="userOwnsRecipe">
      <div
        class="px-4 py-2 bg-gray-200 text-gray-600 rounded text-center font-semibold"
      >
        You own this recipe
      </div>
    </template>
    <template v-else>
      <button
        @click="handlePurchase"
        :disabled="loading"
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400 transition-colors"
      >
        <span v-if="loading">Processing...</span>
        <span v-else>Buy Recipe for {{ price }} {{ currency }}</span>
      </button>
      <p v-if="error" class="text-red-500 mt-2 text-sm">{{ error }}</p>
    </template>
  </div>
</template>

<script setup>
import { RecordPurchase } from "~/queries/recipe-payments.gql";

const props = defineProps({
  recipeId: {
    type: [String, Number],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: "ETB",
  },
  recipeTitle: {
    type: String,
    required: true,
  },
  userOwnsRecipe: {
    type: Boolean,
    default: false,
  },
});

const { user, isAuthenticated, getUserId } = useAuth();
const { initializePayment, generateTxRef, formatAmount, generateUrls } =
  useChapaPayment();
const { mutate: recordPurchaseMutation } = useMutation(RecordPurchase);

const loading = ref(false);
const error = ref("");

const handlePurchase = async () => {
  const buyerId = getUserId();
  if (!isAuthenticated.value || !user.value || !buyerId) {
    error.value = "Please log in to purchase a recipe.";
    await navigateTo("/login");
    return;
  }

  try {
    loading.value = true;
    error.value = "";
    const txRef = generateTxRef(`recipe-${props.recipeId}`);
    const formattedAmount = formatAmount(props.price);
    const baseUrl = window.location.origin;
    const urls = generateUrls(baseUrl, props.recipeId, txRef);

    // Chapa customization.title must not exceed 16 characters
    const safeTitle = `Test Purchase ${props.recipeTitle}`.slice(0, 16);
    const paymentData = {
      amount: Math.max(formattedAmount, 1), // Ensure minimum 1 ETB for test
      currency: "ETB", // Force ETB for test mode
      email: user.value.email || "testuser@gmail.com",
      first_name: user.value.first_name || user.value.username || "Test",
      last_name: user.value.last_name || "User",
      phone_number: user.value.phone_number || "+251911000000", // Test phone number
      tx_ref: txRef,
      callback_url: urls.callback_url,
      return_url: urls.return_url,
      description: `Test Purchase ${props.recipeTitle}`,
      customization: {
        title: safeTitle,
        description: `Test payment for recipe ${props.recipeTitle}`,
      },
    };

    console.log("Payment data being sent:", paymentData);

    await recordPurchaseMutation({
      recipe_id: props.recipeId,
      buyer_id: buyerId,
      transaction_id: txRef,
      amount: formattedAmount,
      currency: props.currency,
      payment_status: "pending",
      payment_method: "chapa",
      chapa_tx_ref: txRef,
    });

    const checkoutUrl = await initializePayment(
      paymentData,
      props.recipeId,
      buyerId
    );

    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    } else {
      throw new Error("Failed to get checkout URL");
    }
  } catch (err) {
    console.error("Payment initialization error:", err);

    // Handle different error types
    if (err.message) {
      error.value = err.message;
    } else if (typeof err === "object" && err.error) {
      error.value = err.error;
    } else if (typeof err === "string") {
      error.value = err;
    } else {
      error.value = "Failed to initialize payment. Please try again.";
    }
  } finally {
    loading.value = false;
  }
};
</script>
