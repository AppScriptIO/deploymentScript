"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.readInput = void 0;var _readline = _interopRequireDefault(require("readline"));

const readInput = question => {
  const readlineInstance = _readline.default.createInterface({ input: process.stdin, output: process.stdout });
  readlineInstance.setPrompt(question);
  readlineInstance.prompt();
  return new Promise((resolve, reject) => {
    let response;
    readlineInstance.on('line', userInput => {
      response = userInput;
      readlineInstance.close();
    });
    readlineInstance.on('close', () => {
      resolve(response);
    });
  });
};exports.readInput = readInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS91dGlsaXR5L3JlYWRJbnB1dC5qcyJdLCJuYW1lcyI6WyJyZWFkSW5wdXQiLCJxdWVzdGlvbiIsInJlYWRsaW5lSW5zdGFuY2UiLCJyZWFkbGluZSIsImNyZWF0ZUludGVyZmFjZSIsImlucHV0IiwicHJvY2VzcyIsInN0ZGluIiwib3V0cHV0Iiwic3Rkb3V0Iiwic2V0UHJvbXB0IiwicHJvbXB0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJyZXNwb25zZSIsIm9uIiwidXNlcklucHV0IiwiY2xvc2UiXSwibWFwcGluZ3MiOiIyTEFBQTs7QUFFTyxNQUFNQSxTQUFTLEdBQUdDLFFBQVEsSUFBSTtBQUNuQyxRQUFNQyxnQkFBZ0IsR0FBR0Msa0JBQVNDLGVBQVQsQ0FBeUIsRUFBRUMsS0FBSyxFQUFFQyxPQUFPLENBQUNDLEtBQWpCLEVBQXdCQyxNQUFNLEVBQUVGLE9BQU8sQ0FBQ0csTUFBeEMsRUFBekIsQ0FBekI7QUFDQVAsRUFBQUEsZ0JBQWdCLENBQUNRLFNBQWpCLENBQTJCVCxRQUEzQjtBQUNBQyxFQUFBQSxnQkFBZ0IsQ0FBQ1MsTUFBakI7QUFDQSxTQUFPLElBQUlDLE9BQUosQ0FBWSxDQUFDQyxPQUFELEVBQVVDLE1BQVYsS0FBcUI7QUFDdEMsUUFBSUMsUUFBSjtBQUNBYixJQUFBQSxnQkFBZ0IsQ0FBQ2MsRUFBakIsQ0FBb0IsTUFBcEIsRUFBNEJDLFNBQVMsSUFBSTtBQUN2Q0YsTUFBQUEsUUFBUSxHQUFHRSxTQUFYO0FBQ0FmLE1BQUFBLGdCQUFnQixDQUFDZ0IsS0FBakI7QUFDRCxLQUhEO0FBSUFoQixJQUFBQSxnQkFBZ0IsQ0FBQ2MsRUFBakIsQ0FBb0IsT0FBcEIsRUFBNkIsTUFBTTtBQUNqQ0gsTUFBQUEsT0FBTyxDQUFDRSxRQUFELENBQVA7QUFDRCxLQUZEO0FBR0QsR0FUTSxDQUFQO0FBVUQsQ0FkTSxDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHJlYWRsaW5lIGZyb20gJ3JlYWRsaW5lJ1xuXG5leHBvcnQgY29uc3QgcmVhZElucHV0ID0gcXVlc3Rpb24gPT4ge1xuICBjb25zdCByZWFkbGluZUluc3RhbmNlID0gcmVhZGxpbmUuY3JlYXRlSW50ZXJmYWNlKHsgaW5wdXQ6IHByb2Nlc3Muc3RkaW4sIG91dHB1dDogcHJvY2Vzcy5zdGRvdXQgfSlcbiAgcmVhZGxpbmVJbnN0YW5jZS5zZXRQcm9tcHQocXVlc3Rpb24pXG4gIHJlYWRsaW5lSW5zdGFuY2UucHJvbXB0KClcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsZXQgcmVzcG9uc2VcbiAgICByZWFkbGluZUluc3RhbmNlLm9uKCdsaW5lJywgdXNlcklucHV0ID0+IHtcbiAgICAgIHJlc3BvbnNlID0gdXNlcklucHV0XG4gICAgICByZWFkbGluZUluc3RhbmNlLmNsb3NlKClcbiAgICB9KVxuICAgIHJlYWRsaW5lSW5zdGFuY2Uub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgcmVzb2x2ZShyZXNwb25zZSlcbiAgICB9KVxuICB9KVxufVxuIl19