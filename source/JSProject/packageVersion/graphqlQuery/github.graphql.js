"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.githubGraphqlEndpoint = exports.getReleases = void 0;var _graphqlTag = _interopRequireDefault(require("graphql-tag"));

const githubGraphqlEndpoint = 'https://api.github.com/graphql';exports.githubGraphqlEndpoint = githubGraphqlEndpoint;


const getReleases = (0, _graphqlTag.default)`
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NvdXJjZS9KU1Byb2plY3QvcGFja2FnZVZlcnNpb24vZ3JhcGhxbFF1ZXJ5L2dpdGh1Yi5ncmFwaHFsLmpzIl0sIm5hbWVzIjpbImdpdGh1YkdyYXBocWxFbmRwb2ludCIsImdldFJlbGVhc2VzIl0sIm1hcHBpbmdzIjoiNk5BQUE7O0FBRUEsTUFBTUEscUJBQXFCLEdBQUcsZ0NBQTlCLEM7OztBQUdBLE1BQU1DLFdBQVcsR0FBRyx3QkFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUF4QixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdxbCBmcm9tICdncmFwaHFsLXRhZydcclxuXHJcbmNvbnN0IGdpdGh1YkdyYXBocWxFbmRwb2ludCA9ICdodHRwczovL2FwaS5naXRodWIuY29tL2dyYXBocWwnXHJcblxyXG4vLyBodHRwczovL2RldmVsb3Blci5naXRodWIuY29tL3Y0L2V4cGxvcmVyXHJcbmNvbnN0IGdldFJlbGVhc2VzID0gZ3FsYFxyXG4gICMgQHBhcmFtZXRlciBudW1iZXJPZlJlbGVhc2VOb2RlIC0gaXMgdGhlIG51bWJlciBvZiByZWNlbnQgKGJ5IGRhdGUpIHJlbGVhc2VzIHRvIHJldHJlaXZlLlxyXG4gIHF1ZXJ5IGdldFJlbGVhc2VzKCRudW1iZXJPZlJlbGVhc2VOb2RlOiBJbnQgPSAyMCwgJHJlcG9VUkw6IFVSSSEpIHtcclxuICAgIHJlc291cmNlKHVybDogJHJlcG9VUkwpIHtcclxuICAgICAgLi4uIG9uIFJlcG9zaXRvcnkge1xyXG4gICAgICAgIHJlbGVhc2VzKGZpcnN0OiAkbnVtYmVyT2ZSZWxlYXNlTm9kZSwgb3JkZXJCeTogeyBmaWVsZDogQ1JFQVRFRF9BVCwgZGlyZWN0aW9uOiBBU0MgfSkge1xyXG4gICAgICAgICAgdG90YWxDb3VudFxyXG4gICAgICAgICAgLi4ucmVsZWFzZUZpZWxkc1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnJhZ21lbnQgcmVsZWFzZUZpZWxkcyBvbiBSZWxlYXNlQ29ubmVjdGlvbiB7XHJcbiAgICBlZGdlcyB7XHJcbiAgICAgIG5vZGUge1xyXG4gICAgICAgIG5hbWVcclxuICAgICAgICB0YWcge1xyXG4gICAgICAgICAgbmFtZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpc1ByZXJlbGVhc2VcclxuICAgICAgICBpc0RyYWZ0XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbmBcclxuXHJcbmV4cG9ydCB7IGdldFJlbGVhc2VzLCBnaXRodWJHcmFwaHFsRW5kcG9pbnQgfVxyXG4iXX0=