module.exports = function(grunt) {
    var _ = require('underscore');
    var fs = require('fs');
    var inquirer = require('inquirer');
    var path = require('path');
    
    // TODO: Extract to separate file for easier editing
    var VIEW_TEMPLATE_TEMPLATE = 
        '{% extends "splunkdj:<%= baseTemplateName %>.html" %}\n' +
        '\n' +
        '{% load splunkmvc %}\n' +
        '\n' +
        '{% block title %}<%= title %>{% endblock title %}\n' +
        '\n' +
        '{% block css %}\n' +
        '    <style>\n' +
        '        /* Insert CSS here */\n' +
        '    </style>\n' +
        '{% endblock css %}\n' +
        '\n' +
        '{% block content %}\n' +
        '    <div>\n' +
        '        <!-- Insert HTML here -->\n' +
        '    </div>\n' +
        '{% endblock content %}\n' +
        '\n' +
        '{% block js %}\n' +
        '    <script>\n' +
        '        // Insert JavaScript here\n' +
        '    </script>\n' +
        '{% endblock js %}\n' +
        '';
    
    grunt.registerTask('splunk', 'Manipulate Web Framework apps.', function() {
        var args = arguments;   // allow use of command arguments in callbacks
        
        if (args.length <= 1) {
            printHelp();
            return false;
        } else if (args[0] === 'view') {
            if (args[1] === 'create' && (args.length <= 3)) {
                var done = this.async();
                
                var viewName;
                askForViewNameIfMissing('View name:', args[2], function(inputViewName) {
                    viewName = inputViewName;
                    askForBaseTemplateName();
                });
                
                function askForBaseTemplateName() {
                    inquirer.prompt({
                        // NOTE: Using this type instead of 'list' because
                        //       probably easier to automate externally.
                        type: 'rawlist',
                        name: 'baseTemplateName',
                        message: 'Which base template should be used:',
                        choices: [
                            {
                                name: 'Navigation bar, header, and footer.',
                                value: 'base_with_app_bar'
                            }, {
                                name: 'Header and footer.',
                                value: 'base_with_account_bar'
                            }, {
                                name: 'Blank page.',
                                value: 'base_with_basic_styles'
                            }
                        ],
                        default: 'base_with_app_bar'
                    }, function(response) {
                        // Spacer between questions and task output
                        grunt.log.writeln('');
                        
                        createView(viewName, response.baseTemplateName, done);
                    });
                };
            } else if (args[1] === 'delete') {
                var done = this.async();
                
                askForViewNameIfMissing('View name:', args[2], function(viewName) {
                    deleteView(viewName, done);
                });
            } else if (args[1] === 'rename') {
                var done = this.async();
                
                askForViewNameIfMissing('Old view name:', args[2], function(oldViewName) {
                    askForViewNameIfMissing('New view name:', args[3], function(newViewName) {
                        renameView(oldViewName, newViewName, done);
                    });
                });
            } else {
                grunt.log.error('Unrecognized command for "view" object: ' + args[1]);
                printHelp();
                return false;
            }
        } else if (args[0] === 'app') {
            // TODO: implement
            grunt.log.error('Not yet implemented.');
            return false;
        } else {
            grunt.log.error('Unrecognized object type: ' + args[0]);
            printHelp();
            return false;
        }
    });

    /**
     * @param prompt    Message to prompt the user with.
     * @param viewName  Default view name, or undefined.
     * @param callback  Function that takes (viewName).
     */
    function askForViewNameIfMissing(prompt, viewName, callback) {
        if (viewName === undefined) {
            inquirer.prompt({
                type: 'input',
                name: 'viewName',
                message: prompt,
                validate: function(input) { return input.length > 0; }
            }, function(response) {
                callback(response.viewName);
            });
        } else {
            callback(viewName);
        }
    }

    // === Commands ===
    
    function printHelp() {
        var helpLines = [
            'Syntax: grunt splunk:<object>:<command>',
            '',
            '    splunk:app:delete - Delete the current app.',
            '    splunk:app:rename:<newapp> - Rename the current app to <newapp>.',
            '    splunk:view:create:<viewname> - Creates a new view <viewname>.',
            '    splunk:view:delete:<viewname> - Deletes the view <viewname>.',
            '    splunk:view:rename:<oldview>:<newview> - Renames the view <oldview> to <newview>.',
            ''
        ];
        _.each(helpLines, function(line) {
            grunt.log.writeln(line);
        });
    }
    
    function createView(viewName, baseTemplateName, done) {
        var templateFilePath = getTemplateFilePathForView(viewName);
        // TODO: What if server is not on localhost?
        // TODO: What if server is not on port 8000?
        // TODO: What about non-English localizations?
        var viewUrl = 'http://localhost:8000/dj/en-us/' + 
            getCurrentAppName() + '/' + viewName + '/';
        
        if (fs.existsSync(templateFilePath)) {
            grunt.log.error('View "' + viewName + '" already exists.');
            done(false);
            return;
        }
        
        // TODO: Ensure view's default URL route does not collide
        //       with a preexisting custom URL route.
        
        fs.writeFileSync(templateFilePath, _.template(VIEW_TEMPLATE_TEMPLATE, {
            baseTemplateName: baseTemplateName,
            title: capitalizeFirstLetter(viewName)
        }));
        
        grunt.log.writeln('View "' + viewName + '" created:');
        grunt.log.writeln('* View Template: ' + path.resolve(templateFilePath));
        grunt.log.writeln('* View URL:      ' + viewUrl);
        
        done();
    }
    
    function deleteView(viewName, done) {
        var templateFilePath = getTemplateFilePathForView(viewName);
        
        if (!fs.existsSync(templateFilePath)) {
            grunt.log.error('View "' + viewName + '" not found.');
            done(false);
            return;
        }
        
        // TODO: Check whether the specified view has a custom URL route.
        //       If so then ask the user to remove it manually.
        //       (This is probably too hard to do reliably automatically.)
        
        // TODO: Check whether the specified view has a custom view function.
        //       If so then ask the user to remove it manually.
        //       (This is probably too hard to do reliably automatically.)
        
        fs.unlinkSync(templateFilePath);
        
        done();
    }
    
    function renameView(oldViewName, newViewName, done) {
        var oldTemplateFilePath = getTemplateFilePathForView(oldViewName);
        var newTemplateFilePath = getTemplateFilePathForView(newViewName);
        
        if (!fs.existsSync(oldTemplateFilePath)) {
            grunt.log.error('View "' + oldViewName + '" not found.');
            done(false);
            return;
        }
        
        if (fs.existsSync(newTemplateFilePath)) {
            grunt.log.error('View "' + newViewName + '" already exists.');
            done(false);
            return;
        }
        
        // TODO: Check whether the specified view has a custom URL route.
        //       If so then ask the user to update it manually.
        //       (This is probably too hard to do reliably automatically.)
        
        // TODO: Check whether the specified view has a custom view function.
        //       If so then ask the user to update it manually.
        //       (This is probably too hard to do reliably automatically.)
        
        fs.renameSync(oldTemplateFilePath, newTemplateFilePath);
        
        done();
    }
    
    // === Utility ===
    
    function getCurrentAppName() {
        return path.basename(process.cwd());
    }
    
    function capitalizeFirstLetter(s) {
        return (s.length >= 1)
            ? s.charAt(0).toUpperCase() + s.slice(1)
            : s;
    }
    
    function getTemplateFilePathForView(viewName) {
        return path.join(
            'django', getCurrentAppName(), 'templates',
            viewName + '.html');
    }
};