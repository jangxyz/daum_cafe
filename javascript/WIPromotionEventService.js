
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (WIPromotionEventService == null) var WIPromotionEventService = {};
WIPromotionEventService._path = '/_c21_/cafepromotionevent';
WIPromotionEventService.isSimpleId = function(callback) {
  dwr.engine._execute(WIPromotionEventService._path, 'WIPromotionEventService', 'isSimpleId', callback);
}
WIPromotionEventService.isAgreePrivateInfo = function(callback) {
  dwr.engine._execute(WIPromotionEventService._path, 'WIPromotionEventService', 'isAgreePrivateInfo', callback);
}
WIPromotionEventService.collectBalloon = function(p0, p1, p2, callback) {
  dwr.engine._execute(WIPromotionEventService._path, 'WIPromotionEventService', 'collectBalloon', p0, p1, p2, callback);
}
