"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.githubGraphqlEndpoint = exports.getReleases = void 0;

var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

const githubGraphqlEndpoint = 'https://api.github.com/graphql'; // https://developer.github.com/v4/explorer

exports.githubGraphqlEndpoint = githubGraphqlEndpoint;
const getReleases = _graphqlTag.default`
    # @parameter numberOfReleaseNode - is the number of recent (by date) releases to retreive.
    query getReleases($numberOfReleaseNode:Int = 20, $repoURL: URI!) {
        resource(url: $repoURL) {
            ... on Repository {
                releases(first: $numberOfReleaseNode, orderBy: { field: CREATED_AT, direction: ASC}) {
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

`;
exports.getReleases = getReleases;