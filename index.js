var fs = require('fs')
  , semver = require('semver')
  , patterns = require('./patterns');

var exports = module.exports = { name: 'test' };

module.exports.version = '0.0.1';

var getExtension = function (filename) {
  var parts = filename.split('.');
  return parts.length > 1 ? parts.pop() : '';
};

var count = 0;

module.exports.getVersion = function (filename) {
	var ext = getExtension(filename)
    , version;  
  
  if (!~['js', 'json'].indexOf(ext)) {
    throw new Error('unsupported extension ' + ext);
  }

  var data = fs.readFileSync(filename, 'utf-8');
  if (ext === 'json') {
    version = JSON.parse(data).version;
  } else if (ext === 'js') {
    version = patterns.parse(data);
  }

  if (!semver.valid(version)) {
    throw new Error('Missing or wrong semver number in ' + filename + '. Found: ' + version);
  }
  return version;
};

module.exports.setVersion = function (arr, version) {
  arr.forEach(function (filename) {
    var ext = getExtension(filename);
    if (ext === 'json') {
      fs.readFile(filename, function (err, data) {
      });
      // TODO: check here that we only replace the version
      // number in the root and not for other dependencies
    } else {
      // TODO: throw an error if there is more than one occurence 
      // of the version number in the file we're updating
    }
  });
};

