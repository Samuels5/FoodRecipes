<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12">
    <div class="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg border border-orange-100 p-8">
      <h1 class="text-3xl md:text-4xl font-bold mb-8 text-orange-600 text-center">Register</h1>
    <Form @submit="handleSubmit" :validation-schema="schema" class="space-y-4">
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700"
          >Username</label
        >
        <Field
          name="username"
          type="text"
          id="username"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
        <ErrorMessage name="username" class="text-red-500 text-sm" />
      </div>

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
        Register
      </button>
    </Form>
  </div>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";

const { login } = useAuth();
const router = useRouter();

const schema = yup.object({
  username: yup
    .string()
    .required()
    .min(3, "Username must be at least 3 characters"),
  email: yup.string().required().email("Must be a valid email"),
  password: yup
    .string()
    .required()
    .min(6, "Password must be at least 6 characters"),
});

async function handleSubmit(values) {
  console.log("Form submitted with:", values);

  try {
    const { data, error } = await useFetch("http://localhost:8081/register", {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (error.value) {
      console.error("Error submitting form:", error.value);
      alert("An error occurred. Please try again.");
    } else {
      console.log("Server response:", data.value);
      
      // Check if we got a token back
      if (data.value?.token) {
        console.log("Registration successful, logging user in with token:", data.value.token);
        
        // Store the token and update authentication state
        login(data.value.token, data.value.user);
        
        // Navigate to the home page or dashboard
        await router.push('/');
        
        alert("Registration successful! You are now logged in.");
      } else {
        console.error("No token received from server");
        alert("Registration successful, but could not log you in automatically. Please log in manually.");
      }
    }
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    alert("An unexpected error occurred. Please try again.");
  }
}
</script>
