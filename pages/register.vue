<template>
  <div
    class="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center py-12"
  >
    <div
      class="max-w-md w-full mx-auto bg-white rounded-2xl shadow-lg border border-orange-100 p-8"
    >
      <h1
        class="text-3xl md:text-4xl font-bold mb-8 text-orange-600 text-center"
      >
        Register
      </h1>
      <Form
        @submit="handleSubmit"
        :validation-schema="schema"
        class="space-y-4"
      >
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
      <div class="my-6 flex items-center justify-center">
        <span class="text-gray-400">or</span>
      </div>
      <button
        type="button"
        class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md shadow hover:bg-gray-50"
        @click="handleGoogleSignIn"
      >
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          class="w-5 h-5"
        />
        Continue with Google
      </button>
    </div>
  </div>
</template>

<script setup>
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { onMounted } from "vue";

const { login } = useAuth();
const router = useRouter();

const GOOGLE_CLIENT_ID =
  "238660670571-hrao7k7jv7j550a2ld1h2jkdfgrikgti.apps.googleusercontent.com"; // <-- Replace with your real client ID

function loadGoogleScript() {
  if (document.getElementById("google-oauth-script")) return;
  const script = document.createElement("script");
  script.id = "google-oauth-script";
  script.src = "https://accounts.google.com/gsi/client";
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
}
onMounted(() => {
  loadGoogleScript();
});

async function handleGoogleSignIn() {
  if (!window.google || !window.google.accounts || !window.google.accounts.id) {
    alert("Google Sign-In not loaded. Try again in a moment.");
    return;
  }
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response) => {
      if (!response.credential) {
        alert("Google authentication failed.");
        return;
      }
      try {
        const res = await fetch("http://localhost:8081/api/auth/google", {
          method: "POST",
          body: JSON.stringify({ credential: response.credential }),
          headers: { "Content-Type": "application/json" },
        });
        const data = await res.json();
        if (res.ok && data.token) {
          login(data.token, data.user);
          alert("Registration successful!");
          await router.push("/");
        } else {
          alert("Google registration failed.");
        }
      } catch (e) {
        alert("Google registration failed.");
      }
    },
  });
  window.google.accounts.id.prompt();
}

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
        console.log(
          "Registration successful, logging user in with token:",
          data.value.token
        );

        // Store the token and update authentication state
        login(data.value.token, data.value.user);

        // Navigate to the home page or dashboard
        await router.push("/");

        alert("Registration successful! You are now logged in.");
      } else {
        console.error("No token received from server");
        alert(
          "Registration successful, but could not log you in automatically. Please log in manually."
        );
      }
    }
  } catch (e) {
    console.error("An unexpected error occurred:", e);
    alert("An unexpected error occurred. Please try again.");
  }
}
</script>
