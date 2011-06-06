
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (WISNSShareService == null) var WISNSShareService = {};
WISNSShareService._path = '/_c21_/snsshare';
WISNSShareService.reportSNSShareResult = function(p0, callback) {
  dwr.engine._execute(WISNSShareService._path, 'WISNSShareService', 'reportSNSShareResult', p0, callback);
}
WISNSShareService.isSecededUser = function(callback) {
  dwr.engine._execute(WISNSShareService._path, 'WISNSShareService', 'isSecededUser', callback);
}
