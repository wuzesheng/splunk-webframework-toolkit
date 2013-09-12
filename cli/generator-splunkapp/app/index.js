'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var SplunkappGenerator = module.exports = function SplunkappGenerator(args, options, config) {
  yeoman.generators.Base.apply(this, arguments);
  
  // Determine name of Splunk app being created
  this.argument('appname', { type: String, required: false });
  this.appname = this.appname || path.basename(process.cwd());

  this.on('end', function () {
    this.installDependencies({ skipInstall: options['skip-install'] });
  });

  this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(SplunkappGenerator, yeoman.generators.Base);

// === Tasks ===

SplunkappGenerator.prototype.app = function app() {
  // Install files required by Yeoman toolchain
  // TODO: Try to find a way to eliminate these files.
  //       Perhaps by eliminating the installDependencies step.
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  
  // Template-substitute and install Splunk app files...
  [
    'appserver/templates/redirect.tmpl',
    'bin/README',
    'default/app.conf',
    'default/data/ui/nav/default.xml',
    'default/data/ui/views/default.xml',
    'README'
  ].forEach(function(filePath) {
    this.template('splunkapp/' + filePath, filePath);
  }, this);
  
  // ...including app files whose file paths require substitution
  [
    '__init__.py',
    'templates/home.html',
    'templates/other.html',
    'templatetags/__init__.py',
    'tests.py',
    'urls.py',
    'views.py'
  ].forEach(function(filePath) {
    this.template(
      'splunkapp/' + 'django/APPNAME/' + filePath,
      'django/' + this.appname + '/' + filePath);
  }, this);
};
