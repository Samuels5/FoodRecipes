// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/apollo"],
  apollo: {
    clients: {
      default: {
        httpEndpoint: "http://localhost:8080/v1/graphql",
        httpLinkOptions: {
          headers: {
            "x-hasura-admin-secret": "myadminsecretkey",
          },
        },
      },
    },
  },
  css: ["~/assets/css/main.css"],
});
