"use strict";var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");Object.defineProperty(exports, "__esModule", { value: true });exports.recursivelySyncFile = recursivelySyncFile;exports.copyFileAndSymlink = copyFileAndSymlink;
var _util = _interopRequireDefault(require("util"));
var _stream = _interopRequireDefault(require("stream"));

var _mkdirp = _interopRequireDefault(require("mkdirp"));
var _rsync = _interopRequireDefault(require("rsync"));
var _gulpSize = _interopRequireDefault(require("gulp-size"));

var _vinylFs = require("vinyl-fs");
var _anyPromise = require("any-promise");const pipeline = _util.default.promisify(_stream.default.pipeline);




























function recursivelySyncFile({
  source,
  destination,
  copyContentOnly = false,
  extraOption = {} } =
{}) {

  destination = destination.replace(/\/$/, '');
  if (copyContentOnly) source = source.substr(-1) != '/' ? `${source}/` : source;else

    source.replace(/\/$/, '');

  let options = Object.assign(
  {
    a: true,

    z: true,
    R: false,
    r: true },

  extraOption);


  let rsync = new _rsync.default().
  flags(options).


  source(source).
  destination(destination);


  return new Promise(resolve => {
    (0, _mkdirp.default)(destination, function (err) {

      rsync.execute(
      function (error, code, cmd) {
        if (error) (0, _anyPromise.reject)(error);
        console.log(`• RSync ${source} to ${destination}`);
        resolve();
      },
      function (data) {
        console.log(' ' + data);
      });

    });
  });
}


async function copyFileAndSymlink({
  source,
  destination })
{
  if (!Array.isArray(source)) source = [source];

  return await pipeline(
  (0, _vinylFs.src)(source, { followSymlinks: false }),

  (0, _vinylFs.dest)(destination, { overwrite: true }),
  (0, _gulpSize.default)({ title: 'copyFileAndSymlink' }));

}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NvdXJjZS91dGlsaXR5L2ZpbGVzeXN0ZW1PcGVyYXRpb24vc3luY2hyb25pemVGaWxlLmpzIl0sIm5hbWVzIjpbInBpcGVsaW5lIiwidXRpbCIsInByb21pc2lmeSIsInN0cmVhbSIsInJlY3Vyc2l2ZWx5U3luY0ZpbGUiLCJzb3VyY2UiLCJkZXN0aW5hdGlvbiIsImNvcHlDb250ZW50T25seSIsImV4dHJhT3B0aW9uIiwicmVwbGFjZSIsInN1YnN0ciIsIm9wdGlvbnMiLCJPYmplY3QiLCJhc3NpZ24iLCJhIiwieiIsIlIiLCJyIiwicnN5bmMiLCJSc3luYyIsImZsYWdzIiwiUHJvbWlzZSIsInJlc29sdmUiLCJlcnIiLCJleGVjdXRlIiwiZXJyb3IiLCJjb2RlIiwiY21kIiwiY29uc29sZSIsImxvZyIsImRhdGEiLCJjb3B5RmlsZUFuZFN5bWxpbmsiLCJBcnJheSIsImlzQXJyYXkiLCJmb2xsb3dTeW1saW5rcyIsIm92ZXJ3cml0ZSIsInRpdGxlIl0sIm1hcHBpbmdzIjoiO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx5Q0FOQSxNQUFNQSxRQUFRLEdBQUdDLGNBQUtDLFNBQUwsQ0FBZUMsZ0JBQU9ILFFBQXRCLENBQWpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1DTyxTQUFTSSxtQkFBVCxDQUE2QjtBQUNsQ0MsRUFBQUEsTUFEa0M7QUFFbENDLEVBQUFBLFdBRmtDO0FBR2xDQyxFQUFBQSxlQUFlLEdBQUcsS0FIZ0I7QUFJbENDLEVBQUFBLFdBQVcsR0FBRyxFQUpvQjtBQUtoQyxFQUxHLEVBS0M7O0FBRU5GLEVBQUFBLFdBQVcsR0FBR0EsV0FBVyxDQUFDRyxPQUFaLENBQW9CLEtBQXBCLEVBQTJCLEVBQTNCLENBQWQ7QUFDQSxNQUFJRixlQUFKLEVBQXFCRixNQUFNLEdBQUdBLE1BQU0sQ0FBQ0ssTUFBUCxDQUFjLENBQUMsQ0FBZixLQUFxQixHQUFyQixHQUE0QixHQUFFTCxNQUFPLEdBQXJDLEdBQTBDQSxNQUFuRCxDQUFyQjs7QUFFS0EsSUFBQUEsTUFBTSxDQUFDSSxPQUFQLENBQWUsS0FBZixFQUFzQixFQUF0Qjs7QUFFTCxNQUFJRSxPQUFPLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBUDtBQUNaO0FBQ0VDLElBQUFBLENBQUMsRUFBRSxJQURMOztBQUdFQyxJQUFBQSxDQUFDLEVBQUUsSUFITDtBQUlFQyxJQUFBQSxDQUFDLEVBQUUsS0FKTDtBQUtFQyxJQUFBQSxDQUFDLEVBQUUsSUFMTCxFQURZOztBQVFaVCxFQUFBQSxXQVJZLENBQWQ7OztBQVdBLE1BQUlVLEtBQUssR0FBRyxJQUFJQyxjQUFKO0FBQ1RDLEVBQUFBLEtBRFMsQ0FDSFQsT0FERzs7O0FBSVROLEVBQUFBLE1BSlMsQ0FJRkEsTUFKRTtBQUtUQyxFQUFBQSxXQUxTLENBS0dBLFdBTEgsQ0FBWjs7O0FBUUEsU0FBTyxJQUFJZSxPQUFKLENBQVlDLE9BQU8sSUFBSTtBQUM1Qix5QkFBT2hCLFdBQVAsRUFBb0IsVUFBU2lCLEdBQVQsRUFBYzs7QUFFaENMLE1BQUFBLEtBQUssQ0FBQ00sT0FBTjtBQUNFLGdCQUFTQyxLQUFULEVBQWdCQyxJQUFoQixFQUFzQkMsR0FBdEIsRUFBMkI7QUFDekIsWUFBSUYsS0FBSixFQUFXLHdCQUFPQSxLQUFQO0FBQ1hHLFFBQUFBLE9BQU8sQ0FBQ0MsR0FBUixDQUFhLFdBQVV4QixNQUFPLE9BQU1DLFdBQVksRUFBaEQ7QUFDQWdCLFFBQUFBLE9BQU87QUFDUixPQUxIO0FBTUUsZ0JBQVNRLElBQVQsRUFBZTtBQUNiRixRQUFBQSxPQUFPLENBQUNDLEdBQVIsQ0FBWSxNQUFNQyxJQUFsQjtBQUNELE9BUkg7O0FBVUQsS0FaRDtBQWFELEdBZE0sQ0FBUDtBQWVEOzs7QUFHTSxlQUFlQyxrQkFBZixDQUFrQztBQUN2QzFCLEVBQUFBLE1BRHVDO0FBRXZDQyxFQUFBQSxXQUZ1QyxFQUFsQztBQUdKO0FBQ0QsTUFBSSxDQUFDMEIsS0FBSyxDQUFDQyxPQUFOLENBQWM1QixNQUFkLENBQUwsRUFBNEJBLE1BQU0sR0FBRyxDQUFDQSxNQUFELENBQVQ7O0FBRTVCLFNBQU8sTUFBTUwsUUFBUTtBQUNuQixvQkFBdUJLLE1BQXZCLEVBQStCLEVBQUU2QixjQUFjLEVBQUUsS0FBbEIsRUFBL0IsQ0FEbUI7O0FBR25CLHFCQUEwQjVCLFdBQTFCLEVBQXVDLEVBQUU2QixTQUFTLEVBQUUsSUFBYixFQUF2QyxDQUhtQjtBQUluQix5QkFBSyxFQUFFQyxLQUFLLEVBQUUsb0JBQVQsRUFBTCxDQUptQixDQUFyQjs7QUFNRCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXG5pbXBvcnQgdXRpbCBmcm9tICd1dGlsJ1xuaW1wb3J0IHN0cmVhbSBmcm9tICdzdHJlYW0nXG5jb25zdCBwaXBlbGluZSA9IHV0aWwucHJvbWlzaWZ5KHN0cmVhbS5waXBlbGluZSlcbmltcG9ydCBta2RpcnAgZnJvbSAnbWtkaXJwJ1xuaW1wb3J0IFJzeW5jIGZyb20gJ3JzeW5jJ1xuaW1wb3J0IHNpemUgZnJvbSAnZ3VscC1zaXplJ1xuaW1wb3J0IHBsdW1iZXIgZnJvbSAnZ3VscC1wbHVtYmVyJ1xuaW1wb3J0IHsgc3JjIGFzIHJlYWRGaWxlQXNPYmplY3RTdHJlYW0sIGRlc3QgYXMgd3JpdGVGaWxlRnJvbU9iamVjdFN0cmVhbSB9IGZyb20gJ3ZpbnlsLWZzJ1xuaW1wb3J0IHsgcmVqZWN0IH0gZnJvbSAnYW55LXByb21pc2UnXG5cbi8qXG5pbXBvcnQgcnN5bmNPYmplY3RTdHJlYW0gZnJvbSAnZ3VscC1yc3luYydcbmltcG9ydCBndWxwIGZyb20gJ2d1bHAnXG4vLyB1c2luZyBndWxwLXJzeW5jXG5mdW5jdGlvbiBndWxwUnN5bmMoYmFzZVNvdXJjZSwgc291cmNlLCBkZXN0aW5hdGlvbikge1xuICByZXR1cm4gZ3VscC5zcmMoc291cmNlKVxuICAgIC5waXBlKHJzeW5jT2JqZWN0U3RyZWFtKHtcbiAgICAgIC8vIHBhdGhzIG91dHNpZGUgb2Ygcm9vdCBjYW5ub3QgYmUgc3BlY2lmaWVkLlxuICAgICAgcm9vdDogYmFzZVNvdXJjZSxcbiAgICAgIGRlc3RpbmF0aW9uOiBkZXN0aW5hdGlvbixcbiAgICAgIGluY3JlbWVudGFsOiB0cnVlLFxuICAgICAgY29tcHJlc3M6IHRydWUsXG4gICAgICAvLyByZWN1cnNpdmU6IHRydWUsXG4gICAgICAvLyBjbGVhbjogdHJ1ZSwgLy8gLS1kZWxldGUgLSBkZWxldGVzIGZpbGVzIG9uIHRhcmdldC4gRmlsZXMgd2hpY2ggYXJlIG5vdCBwcmVzZW50IG9uIHNvdXJjZS5cbiAgICAgIC8vIGRyeXJ1bjogdHJ1ZSwgLy8gZm9yIHRlc3RzIHVzZSBkcnlydW4gd2hpY2ggd2lsbCBub3QgY2hhbmdlIGZpbGVzIG9ubHkgbWltaWMgdGhlIHJ1bi5cbiAgICAgIC8vIHByb2dyZXNzOiB0cnVlLFxuICAgICAgLy8gc2tpcCBmaWxlcyB3aGljaCBhcmUgbmV3ZXIgb24gdGFyZ2V0L3JlY2lldmVyIHBhdGguXG4gICAgICB1cGRhdGU6IHRydWVcbiAgICAgIC8vIGFyZ3MgdGhpcyB3YXkgZG9lc24ndCB3b3JrICEgc2hvdWxkIHVzZSB0aGUgZXF1ZXZhbGVudCBvcHRpb25zIGluIEFQSVxuICAgICAgLy8gYXJnczogWyctLXZlcmJvc2UnLCAnLS1jb21wcmVzcycsICctLXVwZGF0ZScsICctLWRyeS1ydW4nXVxuICAgICAgLy8gRE9FU04nVCBXT1JLIEZPUiBNVUxUSVBMRSBQQVRIUyAtIGVycm9yIFwib3V0c2lkZSBvZiByb290XCIgV2hlbiByZWxhdGljZSBpcyBvZmYgcnN5bmMgY2FuIHJlY2lldmUgbXVsdGlwbGUgcGF0aHMgdGhyb3VnaCBndWxwLnNyYy5cbiAgICAgIC8vIHJlbGF0aXZlOiBmYWxzZVxuICAgIH0pKVxufVxuKi9cblxuLy8gaW1wbGVtZW50YXRpb24gdXNpbmcgYHJzeW5jYCBtb2R1bGUgZGlyZWN0bHlcbmV4cG9ydCBmdW5jdGlvbiByZWN1cnNpdmVseVN5bmNGaWxlKHtcbiAgc291cmNlLCAvLyBzb3VyY2UgZm9sZGVyXG4gIGRlc3RpbmF0aW9uLFxuICBjb3B5Q29udGVudE9ubHkgPSBmYWxzZSwgLy8gd2V0aGVyIHRvIGNvcHkgdGhlIGNvbnRlbnRzIG9mIHRoZSByb290IHNvdXJjZSBmb2xkZXIgd2l0aG91dCB0aGUgcm9vdCBmb2xkZXIgIGl0c2VsZi5cbiAgZXh0cmFPcHRpb24gPSB7fSxcbn0gPSB7fSkge1xuICAvLyBkZWFsIHdpdGggdHJhaWxpbmcgc2xhc2ggYXMgaXQgbWF5IGNoYW5nZSBgcnN5bmNgIGJlaGF2aW9yLlxuICBkZXN0aW5hdGlvbiA9IGRlc3RpbmF0aW9uLnJlcGxhY2UoL1xcLyQvLCAnJykgLy8gcmVtb3ZlIHRyYWlsaW5nIHNsYXNoIGZyb20gYGRlc3RpbmF0aW9uYCBhcyBpdCBoYXMgbm8gZWZmZWN0IChib3RoIGNhc2VzIGFyZSB0aGUgc2FtZSlcbiAgaWYgKGNvcHlDb250ZW50T25seSkgc291cmNlID0gc291cmNlLnN1YnN0cigtMSkgIT0gJy8nID8gYCR7c291cmNlfS9gIDogc291cmNlXG4gIC8vIGFkZCB0cmFpbGluZyBzbGFzaCAtIGFzIHJzeW5jIHdpbGwgY29weSBvbmx5IGNvbnRhbnRzIHdoZW4gdHJhaWxpbmcgc2xhc2ggaXMgcHJlc2VudC5cbiAgZWxzZSBzb3VyY2UucmVwbGFjZSgvXFwvJC8sICcnKSAvLyByZW1vdmUgdHJhaWxpbmcgc2xhc2guXG5cbiAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKFxuICAgIHtcbiAgICAgIGE6IHRydWUsIC8vIGFyY2hpdmVcbiAgICAgIC8vICd2JzogdHJ1ZSwgLy8gdmVyYm9zZVxuICAgICAgejogdHJ1ZSwgLy8gY29tcHJlc3NcbiAgICAgIFI6IGZhbHNlLCAvLyByZWxhdGl2ZSAtIHdpbGwgY3JlYXRlIGEgbmVzdGVkIHBhdGggaW5zaWRlIHRoZSBkZXN0aW5hdGlvbiB1c2luZyB0aGUgZnVsbCBwYXRoIG9mIHRoZSBzb3VyY2UgZm9sZGVyLlxuICAgICAgcjogdHJ1ZSwgLy8gcmVjdXJzaXZlXG4gICAgfSxcbiAgICBleHRyYU9wdGlvbixcbiAgKVxuXG4gIGxldCByc3luYyA9IG5ldyBSc3luYygpXG4gICAgLmZsYWdzKG9wdGlvbnMpXG4gICAgLy8gLmV4Y2x1ZGUoJysgKi8nKVxuICAgIC8vIC5pbmNsdWRlKCcvdG1wL3NvdXJjZS8qKi8qJylcbiAgICAuc291cmNlKHNvdXJjZSlcbiAgICAuZGVzdGluYXRpb24oZGVzdGluYXRpb24pXG5cbiAgLy8gQ3JlYXRlIGRpcmVjdG9yeS5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgIG1rZGlycChkZXN0aW5hdGlvbiwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAvLyBFeGVjdXRlIHRoZSBjb21tYW5kXG4gICAgICByc3luYy5leGVjdXRlKFxuICAgICAgICBmdW5jdGlvbihlcnJvciwgY29kZSwgY21kKSB7XG4gICAgICAgICAgaWYgKGVycm9yKSByZWplY3QoZXJyb3IpXG4gICAgICAgICAgY29uc29sZS5sb2coYOKAoiBSU3luYyAke3NvdXJjZX0gdG8gJHtkZXN0aW5hdGlvbn1gKVxuICAgICAgICAgIHJlc29sdmUoKVxuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJyAnICsgZGF0YSlcbiAgICAgICAgfSxcbiAgICAgIClcbiAgICB9KVxuICB9KVxufVxuXG4vLyBpbXBsZW1lbnRhdGlvbiB1c2luZyBzdHJlYW1zLlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvcHlGaWxlQW5kU3ltbGluayh7XG4gIHNvdXJjZSwgLy8gbGlzdCBvZiBmaWxlcyBvciBmaWxlIG1hdGNoaW5nIHBhdHRlcm5zIChnbG9icylcbiAgZGVzdGluYXRpb24sXG59KSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShzb3VyY2UpKSBzb3VyY2UgPSBbc291cmNlXVxuICAvLyB1c2luZyBgdmlueWwtZnNgIG1vZHVsZSB0byBhbGxvdyBzeW1saW5rcyB0byBiZSBjb3BpZWQgYXMgc3ltbGlua3MgYW5kIG5vdCBmb2xsb3cgZG93biB0aGUgdHJlZSBvZiBmaWxlcy5cbiAgcmV0dXJuIGF3YWl0IHBpcGVsaW5lKFxuICAgIHJlYWRGaWxlQXNPYmplY3RTdHJlYW0oc291cmNlLCB7IGZvbGxvd1N5bWxpbmtzOiBmYWxzZSB9KSxcbiAgICAvLyBwbHVtYmVyKCksXG4gICAgd3JpdGVGaWxlRnJvbU9iamVjdFN0cmVhbShkZXN0aW5hdGlvbiwgeyBvdmVyd3JpdGU6IHRydWUgfSksXG4gICAgc2l6ZSh7IHRpdGxlOiAnY29weUZpbGVBbmRTeW1saW5rJyB9KSxcbiAgKVxufVxuIl19