"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.githubGraphqlEndpoint = exports.getReleases = void 0;var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

const githubGraphqlEndpoint = 'https://api.github.com/graphql';exports.githubGraphqlEndpoint = githubGraphqlEndpoint;


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

`;exports.getReleases = getReleases;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NjcmlwdC92ZXJzaW9uR2l0aHViL2dyYXBocWxRdWVyeS9naXRodWIuZ3JhcGhxbC5qcyJdLCJuYW1lcyI6WyJnaXRodWJHcmFwaHFsRW5kcG9pbnQiLCJnZXRSZWxlYXNlcyIsImdxbCJdLCJtYXBwaW5ncyI6IjZOQUFBOztBQUVBLE1BQU1BLHFCQUFxQixHQUFHLGdDQUE5QixDOzs7QUFHQSxNQUFNQyxXQUFXLEdBQUdDLG1CQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUF4QixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdxbCBmcm9tICdncmFwaHFsLXRhZydcblxuY29uc3QgZ2l0aHViR3JhcGhxbEVuZHBvaW50ID0gJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ3JhcGhxbCdcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92NC9leHBsb3JlclxuY29uc3QgZ2V0UmVsZWFzZXMgPSBncWxgXG4gICAgIyBAcGFyYW1ldGVyIG51bWJlck9mUmVsZWFzZU5vZGUgLSBpcyB0aGUgbnVtYmVyIG9mIHJlY2VudCAoYnkgZGF0ZSkgcmVsZWFzZXMgdG8gcmV0cmVpdmUuXG4gICAgcXVlcnkgZ2V0UmVsZWFzZXMoJG51bWJlck9mUmVsZWFzZU5vZGU6SW50ID0gMjAsICRyZXBvVVJMOiBVUkkhKSB7XG4gICAgICAgIHJlc291cmNlKHVybDogJHJlcG9VUkwpIHtcbiAgICAgICAgICAgIC4uLiBvbiBSZXBvc2l0b3J5IHtcbiAgICAgICAgICAgICAgICByZWxlYXNlcyhmaXJzdDogJG51bWJlck9mUmVsZWFzZU5vZGUsIG9yZGVyQnk6IHsgZmllbGQ6IENSRUFURURfQVQsIGRpcmVjdGlvbjogQVNDfSkge1xuICAgICAgICAgICAgICAgICAgICB0b3RhbENvdW50XG4gICAgICAgICAgICAgICAgICAgIC4uLnJlbGVhc2VGaWVsZHNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmcmFnbWVudCByZWxlYXNlRmllbGRzIG9uIFJlbGVhc2VDb25uZWN0aW9uIHtcbiAgICAgICAgZWRnZXMge1xuICAgICAgICAgICAgbm9kZSB7XG4gICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICBcdHRhZyB7XG4gICAgICAgICAgICAgICAgICAgIG5hbWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaXNQcmVyZWxlYXNlXG4gICAgICAgICAgICAgICAgaXNEcmFmdFxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5gO1xuXG5leHBvcnQgeyBnZXRSZWxlYXNlcywgZ2l0aHViR3JhcGhxbEVuZHBvaW50IH1cbiJdfQ==