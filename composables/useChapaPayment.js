import { ref, readonly } from "vue";

// Chapa Payment Service
export class ChapaPaymentService {
  constructor() {
    this.baseURL = "http://localhost:8081/chapa-payment"; // Use Go backend proxy
  }

  /**
   * Initialize payment with Chapa
   * @param {Object} paymentData - Payment information
   * @returns {Promise<Object>} - Payment initialization response
   */
  async initializePayment(paymentData) {
    // Send paymentData directly to Go backend proxy
    try {
      const response = await fetch(this.baseURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = {};
      }

      if (!response.ok) {
        // Log the full error response for debugging
        console.error("Chapa payment initialization error (response):", data);
        // Try to extract a detailed error message
        let errorMessage =
          data.error ||
          data.message ||
          data.detail ||
          data.status ||
          `HTTP ${response.status}: ${response.statusText}`;
        // If the error is still an object, stringify it
        if (typeof errorMessage === "object") {
          errorMessage = JSON.stringify(errorMessage);
        }
        throw new Error(errorMessage);
      }

      return {
        success: true,
        data: data.data,
        checkout_url: data.data.checkout_url,
      };
    } catch (error) {
      // Log the error and any nested response if available
      if (error && error.response) {
        console.error(
          "Chapa payment initialization error (catch):",
          error,
          error.response
        );
      } else {
        console.error("Chapa payment initialization error (catch):", error);
      }
      // Show the most informative error message possible
      throw new Error(error.message || error.toString());
    }
  }

  /**
   * Verify payment status
   * @param {string} tx_ref - Transaction reference
   * @returns {Promise<Object>} - Payment verification response
   */
  async verifyPayment(tx_ref) {
    try {
      const response = await fetch(
        `${this.baseURL}/transaction/verify/${tx_ref}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment verification failed");
      }

      return {
        success: true,
        data: data.data,
        status: data.data.status,
      };
    } catch (error) {
      console.error("Chapa payment verification error:", error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Generate unique transaction reference
   * @param {string} prefix - Prefix for transaction reference
   * @returns {string} - Unique transaction reference
   */
  generateTxRef(prefix = "recipe") {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Format amount for Chapa (minimum amount validation)
   * @param {number} amount - Amount to format
   * @returns {number} - Formatted amount
   */
  formatAmount(amount) {
    // Chapa minimum amount is usually 1 ETB
    const minAmount = 1;
    const formattedAmount = parseFloat(amount);

    if (formattedAmount < minAmount) {
      throw new Error(`Minimum amount is ${minAmount} ETB`);
    }

    return Math.round(formattedAmount * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Generate callback and return URLs
   * @param {string} baseUrl - Base URL of your application
   * @param {string} recipeId - Recipe ID
   * @param {string} txRef - Transaction reference
   * @returns {Object} - URLs object
   */
  generateUrls(baseUrl, recipeId, txRef) {
    return {
      callback_url: `${baseUrl}/api/payments/chapa/callback`,
      return_url: `${baseUrl}/recipe/${recipeId}/purchase-success?tx_ref=${txRef}`,
    };
  }
}

// Composable for using Chapa payment service
export const useChapaPayment = () => {
  const chapaService = new ChapaPaymentService();
  const loading = ref(false);
  const error = ref("");

  const initializePayment = async (paymentData, recipeId, userId) => {
    try {
      loading.value = true;
      error.value = "";

      const result = await chapaService.initializePayment(paymentData);
      return result.checkout_url;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const verifyPayment = async (tx_ref) => {
    try {
      const result = await chapaService.verifyPayment(tx_ref);
      return result;
    } catch (err) {
      throw err;
    }
  };

  const generateTxRef = (prefix) => {
    return chapaService.generateTxRef(prefix);
  };

  const formatAmount = (amount) => {
    return chapaService.formatAmount(amount);
  };

  const generateUrls = (baseUrl, recipeId, txRef) => {
    return chapaService.generateUrls(baseUrl, recipeId, txRef);
  };

  return {
    initializePayment,
    verifyPayment,
    generateTxRef,
    formatAmount,
    generateUrls,
    loading: readonly(loading),
    error: readonly(error),
  };
};
