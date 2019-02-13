import gql from 'graphql-tag'

const githubGraphqlEndpoint = 'https://api.github.com/graphql'

const getReleases = gql`
    query getReleases($number:Int = 10, $repoURL: URI!) {
        resource(url: $repoURL) {
            ... on Repository {
                releases(first: $number, orderBy: { field: CREATED_AT, direction: ASC}) {
                    totalCount
                    ...releaseFields
                }
            }
        }
    }

    fragment releaseFields on ReleaseConnection {
        edges {
            node {
                id
            }
        }
    }

`;

export { getReleases, githubGraphqlEndpoint }
