<template>
  <div>
    <button
      @click="handlePurchase"
      :disabled="loading"
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
    >
      <span v-if="loading">Processing...</span>
      <span v-else>Buy Recipe for ${{ price }}</span>
    </button>
    <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useChapaPayment } from "~/composables/useChapaPayment";
import { useAuth } from "~/composables/useAuth";

const props = defineProps({
  recipeId: {
    type: [String, Number],
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  recipeTitle: {
    type: String,
    required: true,
  },
});

const { user } = useAuth();
const { initializePayment, loading, error } = useChapaPayment();

const handlePurchase = async () => {
  if (!user.value) {
    // Or redirect to login
    alert("Please log in to purchase a recipe.");
    return;
  }

  const paymentData = {
    amount: props.price,
    email: user.value.email,
    first_name: user.value.first_name || "Customer",
    last_name: user.value.last_name || "Name",
    tx_ref: `recipe-${props.recipeId}-${Date.now()}`,
    "customization[title]": `Purchase of ${props.recipeTitle}`,
    "customization[description]": `Payment for recipe ID: ${props.recipeId}`,
  };

  const checkoutUrl = await initializePayment(
    paymentData,
    props.recipeId,
    user.value.id
  );

  if (checkoutUrl) {
    window.location.href = checkoutUrl;
  }
};
</script>
