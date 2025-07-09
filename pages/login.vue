<template>
  <div class="max-w-md mx-auto mt-8">
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <Form @submit="handleSubmit" :validation-schema="schema" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700"
          >Email</label
        >
        <Field
          name="email"
          type="email"
          id="email"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        <ErrorMessage name="email" class="text-red-500 text-sm" />
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700"
          >Password</label
        >
        <Field
          name="password"
          type="password"
          id="password"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        <ErrorMessage name="password" class="text-red-500 text-sm" />
      </div>

      <button
        type="submit"
        class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
      >
        Login
      </button>
    </Form>
  </div>
</template>





<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().required().email("Must be a valid email"),
  password: yup.string().required(),
});

const router = useRouter();
const authToken = useCookie("auth-token");

async function handleSubmit(values) {
  console.log("Login form submitted with:", values);

  try {
    const { data, error } = await useFetch("http://localhost:8081/login", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error.value) {
      console.error("Error submitting login form:", error.value);
      alert("Login failed. Please check your credentials.");
    } else {
      if (data.value && data.value.token) {
        authToken.value = data.value.token;
        alert("Login successful!");
        await router.push("/");
      } else {
        console.error("Login response did not include a token:", data.value);
        alert(
          `Login failed: ${
            data.value?.message || "Invalid credentials or server error."
          }`
        );
      }
    }
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    alert("An unexpected error occurred during login.");
  }
}
</script>
