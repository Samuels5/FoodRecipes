import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";

export default defineNuxtPlugin(() => {
  const httpLink = createHttpLink({
    uri: "http://localhost:8080/v1/graphql",
  });

  const authLink = setContext((_, { headers }) => {
    // Get the authentication token from cookie
    const token = useCookie("auth-token").value;

    // For public queries (like home page), use admin secret
    // For authenticated queries, use JWT token
    return {
      headers: {
        ...headers,
        ...(token
          ? { authorization: `Bearer ${token}` }
          : { "x-hasura-admin-secret": "myadminsecretkey" }),
      },
    };
  });

  const apolloClient = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });

  return {
    provide: {
      apolloClient,
    },
  };
});
