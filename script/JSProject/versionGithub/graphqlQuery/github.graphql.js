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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvdmVyc2lvbkdpdGh1Yi9ncmFwaHFsUXVlcnkvZ2l0aHViLmdyYXBocWwuanMiXSwibmFtZXMiOlsiZ2l0aHViR3JhcGhxbEVuZHBvaW50IiwiZ2V0UmVsZWFzZXMiLCJncWwiXSwibWFwcGluZ3MiOiI2TkFBQTs7QUFFQSxNQUFNQSxxQkFBcUIsR0FBRyxnQ0FBOUIsQzs7O0FBR0EsTUFBTUMsV0FBVyxHQUFHQyxtQkFBSTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQUF4QixDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGdxbCBmcm9tICdncmFwaHFsLXRhZydcblxuY29uc3QgZ2l0aHViR3JhcGhxbEVuZHBvaW50ID0gJ2h0dHBzOi8vYXBpLmdpdGh1Yi5jb20vZ3JhcGhxbCdcblxuLy8gaHR0cHM6Ly9kZXZlbG9wZXIuZ2l0aHViLmNvbS92NC9leHBsb3JlclxuY29uc3QgZ2V0UmVsZWFzZXMgPSBncWxgXG4gICMgQHBhcmFtZXRlciBudW1iZXJPZlJlbGVhc2VOb2RlIC0gaXMgdGhlIG51bWJlciBvZiByZWNlbnQgKGJ5IGRhdGUpIHJlbGVhc2VzIHRvIHJldHJlaXZlLlxuICBxdWVyeSBnZXRSZWxlYXNlcygkbnVtYmVyT2ZSZWxlYXNlTm9kZTogSW50ID0gMjAsICRyZXBvVVJMOiBVUkkhKSB7XG4gICAgcmVzb3VyY2UodXJsOiAkcmVwb1VSTCkge1xuICAgICAgLi4uIG9uIFJlcG9zaXRvcnkge1xuICAgICAgICByZWxlYXNlcyhmaXJzdDogJG51bWJlck9mUmVsZWFzZU5vZGUsIG9yZGVyQnk6IHsgZmllbGQ6IENSRUFURURfQVQsIGRpcmVjdGlvbjogQVNDIH0pIHtcbiAgICAgICAgICB0b3RhbENvdW50XG4gICAgICAgICAgLi4ucmVsZWFzZUZpZWxkc1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnJhZ21lbnQgcmVsZWFzZUZpZWxkcyBvbiBSZWxlYXNlQ29ubmVjdGlvbiB7XG4gICAgZWRnZXMge1xuICAgICAgbm9kZSB7XG4gICAgICAgIG5hbWVcbiAgICAgICAgdGFnIHtcbiAgICAgICAgICBuYW1lXG4gICAgICAgIH1cbiAgICAgICAgaXNQcmVyZWxlYXNlXG4gICAgICAgIGlzRHJhZnRcbiAgICAgIH1cbiAgICB9XG4gIH1cbmBcblxuZXhwb3J0IHsgZ2V0UmVsZWFzZXMsIGdpdGh1YkdyYXBocWxFbmRwb2ludCB9XG4iXX0=