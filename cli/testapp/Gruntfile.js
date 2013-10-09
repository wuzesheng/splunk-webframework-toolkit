module.exports = function(grunt) {
  var _ = require('underscore');
  
  // A very basic default task.
  grunt.registerTask('spl', 'Manipulate splunk apps.', function(arg1, arg2) {
    if (arguments.length === 0) {
      grunt.log.writeln(this.name + ", no args");
    } else {
      grunt.log.writeln(this.name + ", " + arg1 + " " + arg2);
    }
    
    if (_) {
      grunt.log.writeln('got underscore');
    }
  });
};