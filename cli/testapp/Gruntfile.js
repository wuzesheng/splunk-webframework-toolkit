module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        splunk: {
            options: {
                splunkd: {
                    username: 'admin',
                    password: 'weak',
                    scheme: 'https',
                    host: 'localhost',
                    port: '8089',
                    version: '5.0'
                }
            }
        }
    });
    
    // Load the 'splunk' task
    grunt.loadNpmTasks('grunt-splunk');
};