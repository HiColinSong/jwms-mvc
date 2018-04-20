'use strict';
var session,userObj,loginUsername;
var ActiveDirectory = require('activedirectory');
const constants=require('./../config/const.json');
exports.checkLoginStatus=function(req,res){
	if (req.session&&req.session.user){
			var data={
				loginUser:{
					username:req.session.user
			}};
			return res.status(200).send(data);
		}
	  else
	    	return res.sendStatus(200);
};

exports.authCheck=function(req, res, next) {
	  if (req.session&&req.session.user)
	    return next();
	  else
	    return res.sendStatus(401);
};
exports.login=function(req, res) {
	session=req.session;
	loginUsername=req.body.domain+"\\"+req.body.username;
	userObj=undefined;

	//do user authentication against Active Directory via LDAP
	var ad = new ActiveDirectory(constants.bitLdapConfig);
	console.log('call Active Directory Authentication!');

	ad.authenticate(loginUsername, req.body.password, function(err, auth) {
	  if (err) {
	    console.log('ERROR: '+JSON.stringify(err));
	    return res.status(403).send({message:"incorrect username or password!"});
	  }
	  
	  if (auth) {
	    console.log('Authenticated!:'+ loginUsername);
		//find username from userList
		var userList=constants.authorizedUsers;
		for (var i = 0; i < userList.length; i++) {
		    if (userList[i].toLowerCase() === loginUsername.toLowerCase()) {
		      userObj = userList[i];
		      break;
		    }
		}
		if (userObj){
			session.user = userObj;
			res.status(200).send({loginUser:{username:loginUsername}});
		} else{
			res.status(403).send({message:"You are not authorized to use BX, please contact to IT department."});
		}
	  }
	  else {
	    console.log('Authentication failed!');
	    return res.status(403).send({message:"incorrect username or password!"});
	  }
	});



};
exports.logout=function(req, res) {
	req.session.user=undefined;
	req.session.destroy();
  	return res.status(200).send({loginStatus:"logout"});
};


// const userList = [
// 	{
// 		username:"yadong",
// 		password:"yadong"
// 	},
// 	{
// 		username:"ali",
// 		password:"ali"
// 	},{
// 		username:"devin",
// 		password:"devin"
// 	},
// ]