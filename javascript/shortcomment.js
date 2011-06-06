
// Provide a default path to dwr.engine
if (dwr == null) var dwr = {};
if (dwr.engine == null) dwr.engine = {};
if (DWREngine == null) var DWREngine = dwr.engine;

if (ShortComment == null) var ShortComment = {};
ShortComment._path = '/_c21_/shortcomment';
ShortComment.remove = function(p0, p1, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'remove', p0, p1, callback);
}
ShortComment.write = function(p0, p1, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'write', p0, p1, callback);
}
ShortComment.read = function(p0, p1, p2, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'read', p0, p1, p2, callback);
}
ShortComment.getList = function(p0, p1, p2, p3, p4, p5, p6, p7, p8, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'getList', p0, p1, p2, p3, p4, p5, p6, p7, p8, callback);
}
ShortComment.modify = function(p0, p1, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'modify', p0, p1, callback);
}
ShortComment.removeList = function(p0, p1, p2, p3, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'removeList', p0, p1, p2, p3, callback);
}
ShortComment.removeListForSpam = function(p0, p1, p2, p3, callback) {
  dwr.engine._execute(ShortComment._path, 'ShortComment', 'removeListForSpam', p0, p1, p2, p3, callback);
}
