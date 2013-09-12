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

SplunkappGenerator.prototype.askFor = function askFor() {
  var cb = this.async();

  var prompts = [/*{
    type: 'confirm',
    name: 'someOption',
    message: 'Would you like to enable this option?',
    default: true
  }*/];

  this.prompt(prompts, function (props) {
    //this.someOption = props.someOption;

    cb();
  }.bind(this));
};

SplunkappGenerator.prototype.app = function app() {
  // NOTE: Both of these are required by the Yeoman toolchain
  this.copy('_package.json', 'package.json');
  this.copy('_bower.json', 'bower.json');
  
  this.template('plain.txt', 'plain.txt');
  this.template('substituted.txt', 'substituted.txt');
};

SplunkappGenerator.prototype.projectfiles = function projectfiles() {
  // No project files
};
