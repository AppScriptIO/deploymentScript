"use strict";const { runTest } = require('@dependency/javascriptTestRunner');

module.exports = function (...args) {
  const { api } = args[0];
  args[0].targetProject = api.project;
  runTest(...args);
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NjcmlwdC9KU1Byb2plY3QvdGVzdC5qcyJdLCJuYW1lcyI6WyJydW5UZXN0IiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJhcmdzIiwiYXBpIiwidGFyZ2V0UHJvamVjdCIsInByb2plY3QiXSwibWFwcGluZ3MiOiJhQUFBLE1BQU0sRUFBRUEsT0FBRixLQUFjQyxPQUFPLENBQUMsa0NBQUQsQ0FBM0I7O0FBRUFDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQixVQUFTLEdBQUdDLElBQVosRUFBa0I7QUFDakMsUUFBTSxFQUFFQyxHQUFGLEtBQTBDRCxJQUFJLENBQUMsQ0FBRCxDQUFwRDtBQUNBQSxFQUFBQSxJQUFJLENBQUMsQ0FBRCxDQUFKLENBQVFFLGFBQVIsR0FBd0JELEdBQUcsQ0FBQ0UsT0FBNUI7QUFDQVAsRUFBQUEsT0FBTyxDQUFDLEdBQUdJLElBQUosQ0FBUDtBQUNELENBSkQiLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCB7IHJ1blRlc3QgfSA9IHJlcXVpcmUoJ0BkZXBlbmRlbmN5L2phdmFzY3JpcHRUZXN0UnVubmVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gIGNvbnN0IHsgYXBpIC8qIHN1cHBsaWVkIGJ5IHNjcmlwdE1hbmFnZXIgKi8gfSA9IGFyZ3NbMF1cbiAgYXJnc1swXS50YXJnZXRQcm9qZWN0ID0gYXBpLnByb2plY3QgLy8gYWRhcHRlciBmb3Igd29ya2luZyB3aXRoIHRhcmdldCBmdW5jdGlvbiBpbnRlcmZhY2UuXG4gIHJ1blRlc3QoLi4uYXJncylcbn1cbiJdfQ==