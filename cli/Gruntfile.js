module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        splunk: {
            options: {
                appContainer: true
            }
        }
    });
    
    // Load the 'splunk' task
    grunt.loadNpmTasks('grunt-splunk');
};