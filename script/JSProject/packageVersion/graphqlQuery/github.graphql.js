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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvcGFja2FnZVZlcnNpb24vZ3JhcGhxbFF1ZXJ5L2dpdGh1Yi5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbImdpdGh1YkdyYXBocWxFbmRwb2ludCIsImdldFJlbGVhc2VzIiwiZ3FsIl0sIm1hcHBpbmdzIjoiNk5BQUE7O0FBRUEsTUFBTUEscUJBQXFCLEdBQUcsZ0NBQTlCLEM7OztBQUdBLE1BQU1DLFdBQVcsR0FBR0MsbUJBQUk7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBeEIsQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBncWwgZnJvbSAnZ3JhcGhxbC10YWcnXG5cbmNvbnN0IGdpdGh1YkdyYXBocWxFbmRwb2ludCA9ICdodHRwczovL2FwaS5naXRodWIuY29tL2dyYXBocWwnXG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLmdpdGh1Yi5jb20vdjQvZXhwbG9yZXJcbmNvbnN0IGdldFJlbGVhc2VzID0gZ3FsYFxuICAjIEBwYXJhbWV0ZXIgbnVtYmVyT2ZSZWxlYXNlTm9kZSAtIGlzIHRoZSBudW1iZXIgb2YgcmVjZW50IChieSBkYXRlKSByZWxlYXNlcyB0byByZXRyZWl2ZS5cbiAgcXVlcnkgZ2V0UmVsZWFzZXMoJG51bWJlck9mUmVsZWFzZU5vZGU6IEludCA9IDIwLCAkcmVwb1VSTDogVVJJISkge1xuICAgIHJlc291cmNlKHVybDogJHJlcG9VUkwpIHtcbiAgICAgIC4uLiBvbiBSZXBvc2l0b3J5IHtcbiAgICAgICAgcmVsZWFzZXMoZmlyc3Q6ICRudW1iZXJPZlJlbGVhc2VOb2RlLCBvcmRlckJ5OiB7IGZpZWxkOiBDUkVBVEVEX0FULCBkaXJlY3Rpb246IEFTQyB9KSB7XG4gICAgICAgICAgdG90YWxDb3VudFxuICAgICAgICAgIC4uLnJlbGVhc2VGaWVsZHNcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZyYWdtZW50IHJlbGVhc2VGaWVsZHMgb24gUmVsZWFzZUNvbm5lY3Rpb24ge1xuICAgIGVkZ2VzIHtcbiAgICAgIG5vZGUge1xuICAgICAgICBuYW1lXG4gICAgICAgIHRhZyB7XG4gICAgICAgICAgbmFtZVxuICAgICAgICB9XG4gICAgICAgIGlzUHJlcmVsZWFzZVxuICAgICAgICBpc0RyYWZ0XG4gICAgICB9XG4gICAgfVxuICB9XG5gXG5cbmV4cG9ydCB7IGdldFJlbGVhc2VzLCBnaXRodWJHcmFwaHFsRW5kcG9pbnQgfVxuIl19