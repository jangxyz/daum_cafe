
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (BbsRead == null) var BbsRead = {};
BbsRead._path = '/_c21_/cafebbsread';
BbsRead.updateRecommedCount = function(p0, p1, p2, p3, p4, callback) {
  dwr.engine._execute(BbsRead._path, 'BbsRead', 'updateRecommedCount', p0, p1, p2, p3, p4, callback);
}
BbsRead.getAlbumList = function(p0, p1, p2, p3, p4, p5, callback) {
  dwr.engine._execute(BbsRead._path, 'BbsRead', 'getAlbumList', p0, p1, p2, p3, p4, p5, callback);
}
