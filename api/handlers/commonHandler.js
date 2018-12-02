'use strict';

const dbCommonSvc=require('../dbservices/dbCommonSvc')
var Promise = require('Promise').default

exports.getPerformanceReport=function(req,res){
	(async function () {
		try {
			var report = await dbCommonSvc.getPerformanceReporterList(req.params.param);
			return res.status(200).send(report);
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};
