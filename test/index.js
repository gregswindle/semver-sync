var exec = require('child_process').exec
  , test = require('tap').test
  , sync = require('../');

var getVersion = function (filename) {
  return sync.getVersion(filename).version;
}

var getLine = function (filename) {
  return sync.getVersion(filename).line;
}

test('reading version numbers from simple text fixtures', function (t) {
  t.equal(getVersion('fixtures/package.json'), '0.0.1', "json");
  t.equal(getVersion('fixtures/assigned.js'), '0.0.7', "module.exports.version assignment");
  t.equal(getVersion('fixtures/literal.js'), '0.10.29', "object literal returned from a module function");
  t.equal(getVersion('fixtures/assigned-literal.js'), '7.7.7', "object literal assigned to exports");
  t.end();
});

test('reading version numbers from actual libraries', function (t) {
  t.equal(getVersion('fixtures/complete/topojson.js'), '0.0.10', 'topojson.js parsed correctly.');
  t.equal(getVersion('fixtures/complete/queue.js'), '1.0.0', 'queue.js parsed correctly.');
  t.equal(getVersion('fixtures/complete/d3.js'), '3.0.5', 'd3.js parsed correctly.');
  t.end();
});

test('version numbers come with line number infomation', function (t) {
  t.equal(getLine('fixtures/package.json'), 4, 'Line numbers work for JSON.');
  t.equal(getLine('fixtures/complete/topojson.js'), 248, 'Line number determined correctly for topojson.js.');
  t.end();
});

test('setting version numbers', function (t) {
  sync.setVersion(['fixtures/component.json', 'fixtures/package.json'], '0.0.5');
  t.equal(getVersion('fixtures/component.json'), '0.0.5');
  t.equal(getVersion('fixtures/package.json'), '0.0.5');
  sync.setVersion(['fixtures/component.json', 'fixtures/package.json'], '0.0.1');
  t.equal(getVersion('fixtures/component.json'), '0.0.1');
  t.equal(getVersion('fixtures/package.json'), '0.0.1');

  sync.setVersion(['fixtures/complete/topojson.js'], '0.0.11');
  t.equal(getVersion('fixtures/complete/topojson.js'), '0.0.11', 'topojson.js parsed correctly.');
  sync.setVersion(['fixtures/complete/topojson.js'], '0.0.10');

  t.end();
});

test('commiting files and creating tag', function(t) {
  options = {cwd: 'tmp'};
  t.plan(3);

  exec('./git-test', function (error, stdout, sterr) {
    sync.setVersion(['tmp/package.json', 'tmp/component.json'], '0.0.2');
    sync.commitSourcesAndCreateTag(['package.json', 'component.json'], '0.0.2' ,function () {

      exec('git status -s', options, function(error, stdout, stderr) {
        files = stdout.split('\n');
        noStagedOrUnstagedFiles = true;
        files.forEach(function(file){
          if (file.match('component.json') || file.match('package.json')) {
            noStagedOrUnstagedFiles = false;
          }
        });
        t.ok(noStagedOrUnstagedFiles, 'no staged or unstaged files')
      });

      exec('git log -1 --pretty=%B', options, function(error, stdout, stderr) {
        commit = stdout.replace(/\n/g,'');
        t.equal(commit, 'v0.0.2', 'commit correctly created');
      });

      exec('git describe --abbrev=0 --tags', options, function(error, stdout, stderr) {
        tag = stdout.replace(/\n/g,'');
        t.equal(tag, 'v0.0.2', 'tag correctly created');
      });
    }, options);
  });
});
