import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import { onError } from "apollo-link-error"
import { ApolloLink } from 'apollo-link'
import nodeFetch from 'node-fetch'
  
// reference: https://www.apollographql.com/docs/react/api/apollo-client.html#apollo-client 
const defaultOptions = {
    watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
    },
    query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
    },
}

export function createGraphqlClient({ endpoint, token }) { 

    // https://github.com/apollographql/apollo-client/blob/master/docs/source/features/error-handling.md#usage
    const errorMiddleware = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors)
          graphQLErrors.map(({ message, locations, path }) =>
            console.error(
              `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
          );
      
        if (networkError) console.error(`[Network error]: ${networkError}`);
    })
    
    const httpMiddleware =  new HttpLink({
        fetch: nodeFetch, 
        uri: endpoint,
        headers: {
            Authorization: `bearer ${token}`
        }
    })

    // combine apollo `links` to allow for error handling that includes GraphQL response errors.
    const combinedLink = ApolloLink.from([
        errorMiddleware,
        httpMiddleware // As defined by apollo - this is considered a terminated link that should be concatenated at last.
    ])

    return new ApolloClient({
        link: combinedLink,
        cache: new InMemoryCache(), 
        defaultOptions
    })
}
