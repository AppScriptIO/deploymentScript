import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import nodeFetch from 'node-fetch'

export function createGraphqlClient({ endpoint, token }) { 
    return new ApolloClient({
        link: new HttpLink({ 
            fetch: nodeFetch, 
            uri: endpoint,
            headers: {
                Authorization: `bearer ${token}`
            }
        }),
        cache: new InMemoryCache()
    })
}
