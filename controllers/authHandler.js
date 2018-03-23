'use strict';
var session,userObj,loginUsername;
exports.checkLoginStatus=function(req,res){
	if (req.session&&req.session.user){
			var data={
				loginUser:{
					username:req.session.user.username
			}};
			return res.status(200).send(data);
		}
	  else
	    	return res.sendStatus(401);
};

exports.authCheck=function(req, res, next) {
	  if (req.session&&req.session.user)
	    return next();
	  else
	    return res.sendStatus(401);
};
exports.login=function(req, res) {
	session=req.session;
	loginUsername=req.body.username;
	userObj=undefined;
	//find username from userList
	for (var i = 0; i < userList.length; i++) {
	    if (userList[i].username === loginUsername) {
	      userObj = userList[i];
	      break;
	    }
	}
	if (userObj&&userObj.password===req.body.password){
		session.user = userObj;
		res.status(200).send({loginUser:{username:loginUsername}});
	} else{
		res.status(401).send({message:"incorrect username or password!"});
	}
};
exports.logout=function(req, res) {
	req.session.user=undefined;
	req.session.destroy();
  	res.send("logout success!");
};


const userList = [
	{
		username:"yadong",
		password:"yadong"
	},
	{
		username:"ali",
		password:"ali"
	},{
		username:"devin",
		password:"devin"
	},
]