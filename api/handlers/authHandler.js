'use strict';
var session,fullUsername;
var ActiveDirectory = require('activedirectory');
exports.checkLoginStatus=function(req,res){

	if (req.session&&req.session.user){
			var data={loginUser:req.session.user};
			return res.status(200).send(data);
		}
	  else
	    return res.sendStatus(200).send({status:"Not Loggedin!"});
};

exports.authCheck=function(req, res, next) {
	if (req.session&&req.session.user){
			next();
	} else {
	    return res.sendStatus(401);
	}
};


exports.login=function(req, res) {
	req.session.user ={userName:req.body.username}
	res.status(200).send({loginUser:req.session.user});
};
exports.logout=function(req, res) {
	req.session.user=undefined;
	req.session.destroy();
  	return res.status(200).send({loginStatus:"logout"});
};
