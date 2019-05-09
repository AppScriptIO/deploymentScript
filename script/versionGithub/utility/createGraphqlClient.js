"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGraphqlClient = createGraphqlClient;

var _apolloCacheInmemory = require("apollo-cache-inmemory");

var _apolloLinkHttp = require("apollo-link-http");

var _apolloClient = require("apollo-client");

var _apolloLinkError = require("apollo-link-error");

var _apolloLink = require("apollo-link");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

function createGraphqlClient({
  endpoint,
  token
}) {
  // reference: https://www.apollographql.com/docs/react/api/apollo-client.html#apollo-client 
  const defaultOptions = {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'ignore'
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all'
    } // https://github.com/apollographql/apollo-client/blob/master/docs/source/features/error-handling.md#usage

  };
  const errorMiddleware = (0, _apolloLinkError.onError)(({
    graphQLErrors,
    networkError
  }) => {
    let formatedErrorMessage = [];

    if (graphQLErrors) {
      formatedErrorMessage = graphQLErrors.map(({
        message,
        locations,
        path
      }) => {
        return `Message: ${message}, Location: ${locations}, Path: ${path} \n`;
      });
      console.error(`❌  GraphQl 'errors' property:`);
      console.dir(formatedErrorMessage);
      throw new Error(`[GraphQL error]: An error received from the response of the GraphQL API.`);
    }

    if (networkError) throw new Error(`[Network error]: ${networkError}`);
  });
  const httpMiddleware = new _apolloLinkHttp.HttpLink({
    fetch: _nodeFetch.default,
    uri: endpoint,
    headers: {
      Authorization: `bearer ${token}`
    }
  }); // combine apollo `links` to allow for error handling that includes GraphQL response errors.

  const combinedLink = _apolloLink.ApolloLink.from([errorMiddleware, httpMiddleware // As defined by apollo - this is considered a terminated link that should be concatenated at last.
  ]);

  return new _apolloClient.ApolloClient({
    link: combinedLink,
    cache: new _apolloCacheInmemory.InMemoryCache(),
    defaultOptions
  });
}