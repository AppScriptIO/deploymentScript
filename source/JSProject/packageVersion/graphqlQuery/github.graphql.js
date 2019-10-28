"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.githubGraphqlEndpoint = exports.getReleases = void 0;var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

const githubGraphqlEndpoint = 'https://api.github.com/graphql';exports.githubGraphqlEndpoint = githubGraphqlEndpoint;


const getReleases = _graphqlTag.default`
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
`;exports.getReleases = getReleases;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcGFja2FnZVZlcnNpb24vZ3JhcGhxbFF1ZXJ5L2dpdGh1Yi5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbImdpdGh1YkdyYXBocWxFbmRwb2ludCIsImdldFJlbGVhc2VzIiwiZ3FsIl0sIm1hcHBpbmdzIjoiNk5BQUE7O0FBRUEsTUFBTUEscUJBQXFCLEdBQUcsZ0NBQTlCLEM7OztBQUdBLE1BQU1DLFdBQVcsR0FBR0MsbUJBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBeEIsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBncWwgZnJvbSAnZ3JhcGhxbC10YWcnXHJcblxyXG5jb25zdCBnaXRodWJHcmFwaHFsRW5kcG9pbnQgPSAnaHR0cHM6Ly9hcGkuZ2l0aHViLmNvbS9ncmFwaHFsJ1xyXG5cclxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92NC9leHBsb3JlclxyXG5jb25zdCBnZXRSZWxlYXNlcyA9IGdxbGBcclxuICAjIEBwYXJhbWV0ZXIgbnVtYmVyT2ZSZWxlYXNlTm9kZSAtIGlzIHRoZSBudW1iZXIgb2YgcmVjZW50IChieSBkYXRlKSByZWxlYXNlcyB0byByZXRyZWl2ZS5cclxuICBxdWVyeSBnZXRSZWxlYXNlcygkbnVtYmVyT2ZSZWxlYXNlTm9kZTogSW50ID0gMjAsICRyZXBvVVJMOiBVUkkhKSB7XHJcbiAgICByZXNvdXJjZSh1cmw6ICRyZXBvVVJMKSB7XHJcbiAgICAgIC4uLiBvbiBSZXBvc2l0b3J5IHtcclxuICAgICAgICByZWxlYXNlcyhmaXJzdDogJG51bWJlck9mUmVsZWFzZU5vZGUsIG9yZGVyQnk6IHsgZmllbGQ6IENSRUFURURfQVQsIGRpcmVjdGlvbjogQVNDIH0pIHtcclxuICAgICAgICAgIHRvdGFsQ291bnRcclxuICAgICAgICAgIC4uLnJlbGVhc2VGaWVsZHNcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZyYWdtZW50IHJlbGVhc2VGaWVsZHMgb24gUmVsZWFzZUNvbm5lY3Rpb24ge1xyXG4gICAgZWRnZXMge1xyXG4gICAgICBub2RlIHtcclxuICAgICAgICBuYW1lXHJcbiAgICAgICAgdGFnIHtcclxuICAgICAgICAgIG5hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNQcmVyZWxlYXNlXHJcbiAgICAgICAgaXNEcmFmdFxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5gXHJcblxyXG5leHBvcnQgeyBnZXRSZWxlYXNlcywgZ2l0aHViR3JhcGhxbEVuZHBvaW50IH1cclxuIl19