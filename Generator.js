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

      // $sails generate spar user  --> id returns User
      id: _.str.capitalize(scope.args[0]),

      // $sails generate spar user  --> modelControllerName returns user
      modelControllerName: scope.args[0],

      actions: [],

      // $sails generate spar user  name:string email:email --> scope.args.slice(1) returns ['name:string','email:email']
      attributes: scope.args.slice(1)
    });

    //Get the optional model attributes and validate them
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

    // Add the optional model attributes to the scope
    _.defaults(scope, {
      modelAttributes: attributes
    });

    // Pluck just the name values
    var modelAttributeNames = _.pluck(scope.modelAttributes, 'name');

    // Add the optional model attribute names to the scope
    _.defaults(scope, {
      modelAttributeNames: modelAttributeNames
    });   

    // This generates a template using the newFormFields.template located in spar/templates
    // combined with modelAttributeNames to produce form fields for the new view derived from the model attributes
    var NEW_FORM_FIELDS_TEMPLATE = path.resolve(__dirname, './templates/newFormFields.template');
    NEW_FORM_FIELDS_TEMPLATE = fs.readFileSync(NEW_FORM_FIELDS_TEMPLATE, 'utf8');

    var compiledNewFormFields = _.template(NEW_FORM_FIELDS_TEMPLATE, {
      modelAttributeNames: scope.modelAttributeNames,
      id: scope.id,
      modelControllerName: scope.modelControllerName
    })

    // Add the compiled new form fields to the scope
    _.defaults(scope, {
      compiledNewFormFields: compiledNewFormFields
    });     


    // This generates a template using the showFormFields.template located in spar/templates
    // combined with modelAttributeNames to produce form fields for the show view derived from the model attributes
    var SHOW_FORM_FIELDS_TEMPLATE = path.resolve(__dirname, './templates/showFormFields.template');
    SHOW_FORM_FIELDS_TEMPLATE = fs.readFileSync(SHOW_FORM_FIELDS_TEMPLATE, 'utf8');

    var compiledShowFormFields = _.template(SHOW_FORM_FIELDS_TEMPLATE, {
      modelAttributeNames: scope.modelAttributeNames,
      id: scope.id,
      modelControllerName: scope.modelControllerName
    })

    // This puts erb style delimeters 
    compiledShowFormFields = compiledShowFormFields.replace(/ERBstart/g, '<%=')
    compiledShowFormFields = compiledShowFormFields.replace(/ERBend/g, '%>')

    // Add the compiled show form fields to the scope
    _.defaults(scope, {
      compiledShowFormFields: compiledShowFormFields
    }); 

    // This generates a template using the showEditLink.template located in spar/templates
    var SHOW_EDIT_LINK_TEMPLATE = path.resolve(__dirname, './templates/showEditLink.template');
    SHOW_EDIT_LINK_TEMPLATE = fs.readFileSync(SHOW_EDIT_LINK_TEMPLATE, 'utf8');

    var compiledShowEditLink = _.template(SHOW_EDIT_LINK_TEMPLATE, {
      modelAttributeNames: scope.modelAttributeNames,
      id: scope.id,
      modelControllerName: scope.modelControllerName
    })

    // This puts erb style delimeters 
    compiledShowEditLink = compiledShowEditLink.replace(/ERBstart/g, '<%=')
    compiledShowEditLink = compiledShowEditLink.replace(/ERBend/g, '%>')

    _.defaults(scope, {
      compiledShowEditLink: compiledShowEditLink
    });

    // This generates the table index headings using indexTableHeadings.template located in spar/templates
    var INDEX_TABLE_HEADINGS_TEMPLATE = path.resolve(__dirname, './templates/indexTableHeadings.template');
    INDEX_TABLE_HEADINGS_TEMPLATE = fs.readFileSync(INDEX_TABLE_HEADINGS_TEMPLATE, 'utf8');

    var compiledIndexTableHeadings = _.template(INDEX_TABLE_HEADINGS_TEMPLATE, {
        modelAttributeNames: scope.modelAttributeNames,
        id: scope.id,
        modelControllerName: scope.modelControllerName
    })

    _.defaults(scope, {
        compiledIndexTableHeadings: compiledIndexTableHeadings
    });

    // This generates a template using the indexTableData.template located in spar/templates
    // combined with modelAttributeNames to create an index.ejs view
    var INDEX_TABLE_DATA_TEMPLATE = path.resolve(__dirname, './templates/indexTableData.template');
    INDEX_TABLE_DATA_TEMPLATE = fs.readFileSync(INDEX_TABLE_DATA_TEMPLATE, 'utf8');

    var compiledIndexTableData = _.template(INDEX_TABLE_DATA_TEMPLATE, {
        modelAttributeNames: scope.modelAttributeNames,
        id: scope.id,
        modelControllerName: scope.modelControllerName,
        compiledIndexTableHeadings: scope.compiledIndexTableHeadings
    })


    _.defaults(scope, {
        modelControllerNamePluralized: scope.modelControllerName + 's'
    }); 

    // This puts erb style delimeters 
    compiledIndexTableData = compiledIndexTableData.replace(/ERBstart/g, '<%=')
    compiledIndexTableData = compiledIndexTableData.replace(/ERBend/g, '%>')

    // Add the compiled show form fields to the scope
    _.defaults(scope, {
      compiledIndexTableData: compiledIndexTableData
    }); 

    // This generates the indexForEach template
    var INDEX_FOR_EACH_TEMPLATE = path.resolve(__dirname, './templates/indexForEach.template');
    INDEX_FOR_EACH_TEMPLATE = fs.readFileSync(INDEX_FOR_EACH_TEMPLATE, 'utf8');

    var compiledIndexForEach = _.template(INDEX_FOR_EACH_TEMPLATE, {
      compiledIndexTableData: compiledIndexTableData,
      modelControllerNamePluralized: scope.modelControllerNamePluralized,
      modelControllerName: scope.modelControllerName
    });

    // This puts erb style delimeters 
    compiledIndexForEach = compiledIndexForEach.replace(/ERBstart/g, '<%')
    compiledIndexForEach = compiledIndexForEach.replace(/ERBend/g, '%>')

    _.defaults(scope, {
      compiledIndexForEach: compiledIndexForEach
    });

    // This generates the editFormFields template
    var EDIT_FORM_FIELDS_TEMPLATE = path.resolve(__dirname, './templates/editFormFields.template');
    EDIT_FORM_FIELDS_TEMPLATE = fs.readFileSync(EDIT_FORM_FIELDS_TEMPLATE, 'utf8');

    var compiledEditFormFields = _.template(EDIT_FORM_FIELDS_TEMPLATE, {
      modelAttributeNames: scope.modelAttributeNames,
      modelControllerName: scope.modelControllerName
    });

    // This puts erb style delimeters 
    compiledEditFormFields = compiledEditFormFields.replace(/ERBstart/g, '<%=')
    compiledEditFormFields = compiledEditFormFields.replace(/ERBend/g, '%>')

    _.defaults(scope, {
      compiledEditFormFields: compiledEditFormFields
    });

    // This generates the editFormAction template
    var EDIT_FORM_ACTION_TEMPLATE = path.resolve(__dirname, './templates/editFormAction.template');
    EDIT_FORM_ACTION_TEMPLATE = fs.readFileSync(EDIT_FORM_ACTION_TEMPLATE, 'utf8');

    var compiledEditFormAction = _.template(EDIT_FORM_ACTION_TEMPLATE, {
      modelAttributeNames: scope.modelAttributeNames,
      modelControllerName: scope.modelControllerName
    });

    // This puts erb style delimeters 
    compiledEditFormAction = compiledEditFormAction.replace(/ERBstart/g, '<%=')
    compiledEditFormAction = compiledEditFormAction.replace(/ERBend/g, '%>')

    _.defaults(scope, {
      compiledEditFormAction: compiledEditFormAction
    });    

    // This generates a template using the actionParamObject.template located in spar/templates
    // to produce a the params to include.
    var ACTION_PARAM_OBJECT_TEMPLATE = path.resolve(__dirname, './templates/actionParamObject.template');
    ACTION_PARAM_OBJECT_TEMPLATE = fs.readFileSync(ACTION_PARAM_OBJECT_TEMPLATE, 'utf8');

    var compliledActionParamObject = _.template(ACTION_PARAM_OBJECT_TEMPLATE, {
        modelAttributeNames: scope.modelAttributeNames,
        id: scope.id,
        modelControllerName: scope.modelControllerName
    })  

    // This generates a template using the actionUpdateParamObject.template
    var ACTION_UPDATE_PARAM_OBJECT_TEMPLATE = path.resolve(__dirname, './templates/actionUpdateParamObject.template');
    ACTION_UPDATE_PARAM_OBJECT_TEMPLATE = fs.readFileSync(ACTION_UPDATE_PARAM_OBJECT_TEMPLATE, 'utf8');

    var compliledActionUpdateParamObject = _.template(ACTION_UPDATE_PARAM_OBJECT_TEMPLATE, {
        modelAttributeNames: scope.modelAttributeNames,
        id: scope.id,
        modelControllerName: scope.modelControllerName
    }) 

    
    // This generates a template using the action.template located in spar/templates
    // combined with CRUD actions to produce a controller.
    var ACTION_TEMPLATE = path.resolve(__dirname, './templates/action.template');
    ACTION_TEMPLATE = fs.readFileSync(ACTION_TEMPLATE, 'utf8');

    var compliledActions = _.template(ACTION_TEMPLATE, {
        compliledActionParamObject: compliledActionParamObject,
        compliledActionUpdateParamObject: compliledActionUpdateParamObject,
        id: scope.id,
        modelControllerName: scope.modelControllerName,
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

    './views/:id/show.ejs': {template: 'show.template' },

    './views/:id/index.ejs': {template: 'index.template' },

    './views/:id/edit.ejs': {template: 'edit.template' }    

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
