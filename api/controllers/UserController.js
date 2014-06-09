/**
 * UserController
 *
 * @description :: Server-side logic for managing Users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  'new': function(req,res){
    res.view();    
  },

  create: function(req, res) {

    // var userObj = {
    //   name: req.param('name'),
    //   title: req.param('title'),
    //   email: req.param('email'),
    //   password: req.param('password'),
    //   confirmation: req.param('confirmation')
    // }

    var paramObj = req.allParams();

    // Create a User with the params sent from 
    // the sign-up form --> new.ejs
    User.create(paramObj, function userCreated(err, user) {

      if (err) {

        // If error redirect back to sign-up page
        return res.redirect('/user/new');
      }

      // res.json(user);
      res.redirect('/user/show/' + user.id);

    });
  },

  show: function(req, res, next) {
    User.findOne(req.param('id'), function foundUser(err, user) {
      if (err) return next(err);
      if (!user) return next();

      // res.json(user);
      res.view({
        user: user
      });
    });
  }
 

};

