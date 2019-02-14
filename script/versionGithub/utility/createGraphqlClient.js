import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
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
    return new ApolloClient({
        link: new HttpLink({
            fetch: nodeFetch, 
            uri: endpoint,
            headers: {
                Authorization: `bearer ${token}`
            }
        }),
        cache: new InMemoryCache(), 
        defaultOptions
    })
}
