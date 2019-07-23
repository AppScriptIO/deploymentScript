import gql from 'graphql-tag'

const githubGraphqlEndpoint = 'https://api.github.com/graphql'

// https://developer.github.com/v4/explorer
const getReleases = gql`
  # @parameter numberOfReleaseNode - is the number of recent (by date) releases to retreive.
  query getReleases($numberOfReleaseNode: Int = 20, $repoURL: URI!) {
    resource(url: $repoURL) {
      ... on Repository {
        releases(first: $numberOfReleaseNode, orderBy: { field: CREATED_AT, direction: ASC }) {
          totalCount
          ...releaseFields
        }
      }
    }
  }

  fragment releaseFields on ReleaseConnection {
    edges {
      node {
        name
        tag {
          name
        }
        isPrerelease
        isDraft
      }
    }
  }
`

export { getReleases, githubGraphqlEndpoint }
