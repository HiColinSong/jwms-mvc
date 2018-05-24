'use strict';
var session,fullUsername;
var ActiveDirectory = require('activedirectory');
const constants=require('./../config/const.json');
const dbConnInfo = require("../../db-config/.db-config.json");
const dbCommonSvc=require('../dbservices/dbCommonSvc');
exports.checkLoginStatus=function(req,res){
	if (req.session&&req.session.user){
			var data={loginUser:req.session.user};
			return res.status(200).send(data);
		}
	  else
	    return res.sendStatus(200).send({status:"Not Loggedin!"});
};

exports.authCheck=function(req, res, next) {
	  if (req.session&&req.session.user)
	   next();
	  else
	    return res.sendStatus(401);
};

exports.adminCheck=function(req, res, next) {
		if (req.session&&req.session.user&&
			 (req.session.user.UserRole==='superAdmin'||
			  req.session.user.UserRole==='admin'))
	   next();
	  else
	    return res.sendStatus(401);
};
exports.login=function(req, res) {
	session=req.session;
	fullUsername=req.body.domain+"\\"+req.body.username;

	//do user authentication against Active Directory via LDAP
	var ad = new ActiveDirectory(constants[req.body.domain.toLowerCase()+'LdapConfig']);
	console.log('call Active Directory Authentication!');

	ad.authenticate(fullUsername, req.body.password, function(err, auth) {
	  if (err) {
	    console.log('ERROR: '+JSON.stringify(err));
	    return res.status(403).send({message:"incorrect domain, username or password!"});
	  }
		
		(async function () {
			if (auth) {
				console.log('Authenticated!:'+ req.body.username);
				try {
					//get user profile from db
				var userProfile = await dbCommonSvc.getUserProfile(req.body.username);
				if (userProfile&&userProfile.recordset.length>0){
					session.user = userProfile.recordset[0];
					res.status(200).send({loginUser:userProfile.recordset[0]});
				} else{
					res.status(403).send({message:"You are not an authorized user."});
				}
			} catch (error) {
				return res.status(200).send({error:true,message:error});
			}
		}})()
	});
};
exports.logout=function(req, res) {
	req.session.user=undefined;
	req.session.destroy();
  	return res.status(200).send({loginStatus:"logout"});
};
exports.dbInfo=function(req, res) {
		let dbinfo={sapInfo:{},sqlSvrInfo:{}};
		Object.assign(dbinfo.sapInfo,dbConnInfo.sapConnParams);
		Object.assign(dbinfo.sqlSvrInfo,dbConnInfo.bxSqlConnParams);
		dbinfo.sapInfo.passwd=undefined;
		dbinfo.sqlSvrInfo.password=undefined;
  	return res.status(200).send(dbinfo);
};