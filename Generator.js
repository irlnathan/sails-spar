/**
 * Module dependencies
 */

var util = require('util');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
_.defaults = require('merge-defaults');
_.str = require('underscore.string');


/**
 * sails-generate-spar
 *
 * Usage:
 * `sails generate spar`
 *
 * @description Generates a spar
 * @help See http://links.sailsjs.org/docs/generators
 */

module.exports = {

  /**
   * `before()` is run before executing any of the `targets`
   * defined below.
   *
   * This is where we can validate user input, configure default
   * scope variables, get extra dependencies, and so on.
   *
   * @param  {Object} scope
   * @param  {Function} cb    [callback]
   */

  before: function (scope, cb) {

    // scope.args are the raw command line arguments.
    //
    // e.g. if someone runs:
    // $ sails generate spar user find create update
    // then `scope.args` would be `['user', 'find', 'create', 'update']`
    if (!scope.args[0]) {
      return cb( new Error('Please provide a name for this spar.') );
    }

    // scope.rootPath is the base path for this generator
    //
    // e.g. if this generator specified the target:
    // './Foobar.md': { copy: 'Foobar.md' }
    //
    // And someone ran this generator from `/Users/dbowie/sailsStuff`,
    // then `/Users/dbowie/sailsStuff/Foobar.md` would be created.
    if (!scope.rootPath) {
      return cb( INVALID_SCOPE_VARIABLE('rootPath') );
    }

    // Attach defaults
    _.defaults(scope, {
      id: _.str.capitalize(scope.args[0]),

      modelControllerName: scope.args[0],

      actions: [],

      attributes: scope.args.slice(1)
    });

    //Get the optional modelAttributeNames and validate them
    var attributes = scope.attributes;
    var invalidAttributes = [];

    attributes = _.map(attributes, function(attribute, i) {

      var parts = attribute.split(':');

      if (parts[1] === undefined) parts[1] = 'string';

      // Handle invalidAttributes
      if (!parts[1] || !parts[0]) {
        invalidAttributes.push(
          'Invalid attribute notation:   "' + attribute + '"');
        return;
      }
      return {
        name: parts[0],
        type: parts[1]
      };

    });

    _.defaults(scope, {
      modelAttributes: attributes
    });

    console.log("These are the scope.modelAttributes: ", scope.modelAttributes);


    // Read in the action.template located in spar/templates

    var ACTION_TEMPLATE = path.resolve(__dirname, './templates/action.template');
    ACTION_TEMPLATE = fs.readFileSync(ACTION_TEMPLATE, 'utf8');

    var compliledActions = _.template(ACTION_TEMPLATE, {

        id: scope.id,
        modelControllerName: scope.modelControllerName
    })

    scope.actionFns = [compliledActions]

    // When finished, we trigger a callback with no error
    // to begin generating files/folders as specified by
    // the `targets` below.
    cb();
  },



  /**
   * The files/folders to generate.
   * @type {Object}
   */

  targets: {

    // Usage:
    // './path/to/destination.foo': { someHelper: opts }

    // Build up the model and controller files
    './': ['model', 'controller'],

    './views/:id/new.ejs': {template: 'new.template' },

    './views/:id/show.ejs': {template: 'show.template' }

  },


  /**
   * The absolute path to the `templates` for this generator
   * (for use with the `template` helper)
   *
   * @type {String}
   */
  templatesDirectory: require('path').resolve(__dirname, './templates')
};





/**
 * INVALID_SCOPE_VARIABLE()
 *
 * Helper method to put together a nice error about a missing or invalid
 * scope variable. We should always validate any required scope variables
 * to avoid inadvertently smashing someone's filesystem.
 *
 * @param {String} varname [the name of the missing/invalid scope variable]
 * @param {String} details [optional - additional details to display on the console]
 * @param {String} message [optional - override for the default message]
 * @return {Error}
 * @api private
 */

function INVALID_SCOPE_VARIABLE (varname, details, message) {
  var DEFAULT_MESSAGE =
  'Issue encountered in generator "spar":\n'+
  'Missing required scope variable: `%s`"\n' +
  'If you are the author of `sails-generate-spar`, please resolve this '+
  'issue and publish a new patch release.';

  message = (message || DEFAULT_MESSAGE) + (details ? '\n'+details : '');
  message = util.inspect(message, varname);

  return new Error(message);
}
