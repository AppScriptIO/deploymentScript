"use strict";module.exports = function () {






  const preserveSymlinkOption = 'NODE_PRESERVE_SYMLINKS';
  if (!process.env[preserveSymlinkOption]) throw new Error("Node's preserve symlink option must be turned on (NODE_PRESERVE_SYMLINKS)");

  return require('./script.js');
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NvdXJjZS91dGlsaXR5L3ByZXNlcnZlU3ltbGluay5lbnRyeXBvaW50LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydHMiLCJwcmVzZXJ2ZVN5bWxpbmtPcHRpb24iLCJwcm9jZXNzIiwiZW52IiwiRXJyb3IiLCJyZXF1aXJlIl0sIm1hcHBpbmdzIjoiYUFBQUEsTUFBTSxDQUFDQyxPQUFQLEdBQWlCLFlBQVc7Ozs7Ozs7QUFPMUIsUUFBTUMscUJBQXFCLEdBQUcsd0JBQTlCO0FBQ0EsTUFBSSxDQUFDQyxPQUFPLENBQUNDLEdBQVIsQ0FBWUYscUJBQVosQ0FBTCxFQUF5QyxNQUFNLElBQUlHLEtBQUosQ0FBVSwyRUFBVixDQUFOOztBQUV6QyxTQUFPQyxPQUFPLENBQUMsYUFBRCxDQUFkO0FBQ0QsQ0FYRCIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gIC8qKlxuICAgKiBDaGVjayB0aGF0IHByZXNlcnZlIHN5bWxpbmsgaXMgZW5hYmxlZC5cbiAgICogTm9kZSBwcm9jZXNzIG11c3QgYmUgcnVuIHdpdGggYHByZXNldmUgc3ltbGlua2Agb3B0aW9uIChmbGFnIG9yIGVudiB2YXJpYWJsZSksIGJ5IE5vZGUncyBkZWZhdWx0IGl0IGlzIG9mZi4gaHR0cHM6Ly9ub2RlanMub3JnL2FwaS9jbGkuaHRtbCNjbGlfbm9kZV9wcmVzZXJ2ZV9zeW1saW5rc18xXG4gICAqIEFzIHRoaXMgbW9kdWxlIHJlbGllcyBvbiBub2RlX21vZHVsZXMgYmVpbmcgcmVzb2x2ZWQgZnJvbSB0aGUgc3ltbGluayBsb2NhdGlvbiBpbiBjYXNlIHRoZSBtb2R1bGUgaXMgc3ltbGlua3MgZnJvbSBvdXRzaWRlIG9mIHRoZSBhcHBsaWNhdGlvbiByb290IHBhdGggKGZvciBkZXZlbG9wbWVudCBwdXJwb3NlcykuXG4gICAqIFRoaXMgaW1wbGVtZW50YXRpb24gY2hlY2tzIG9ubHkgZm9yIGVudmlyb25tZW50IHZhcmlhYmxlIChub3QgZmxhZykuXG4gICAqL1xuICBjb25zdCBwcmVzZXJ2ZVN5bWxpbmtPcHRpb24gPSAnTk9ERV9QUkVTRVJWRV9TWU1MSU5LUydcbiAgaWYgKCFwcm9jZXNzLmVudltwcmVzZXJ2ZVN5bWxpbmtPcHRpb25dKSB0aHJvdyBuZXcgRXJyb3IoXCJOb2RlJ3MgcHJlc2VydmUgc3ltbGluayBvcHRpb24gbXVzdCBiZSB0dXJuZWQgb24gKE5PREVfUFJFU0VSVkVfU1lNTElOS1MpXCIpXG5cbiAgcmV0dXJuIHJlcXVpcmUoJy4vc2NyaXB0LmpzJylcbn1cbiJdfQ==