'use strict';

const dbCommonSvc=require('../dbservices/dbBudgetAndIncomeReportSvc')
var Promise = require('Promise').default

exports.getBudgetAndIncomeReport=function(req,res){
	(async function () {
		try {			
            //let report = await dbCommonSvc.getBudgetAndIncomeReporterList(req.body.date);
            let report ={};
			let BudgetAndIncomeData = await dbCommonSvc.getBudgetAndIncomeData(req.body.date,req.body.FHospName,req.body.ProductTypeName);			
			report.BudgetAndIncomeData = BudgetAndIncomeData.recordset;
			return res.status(200).send(report);
            /* 
            如果既显示明细表，也显示汇总表的化可以合成
			let BudgetAndIncomeDetailData = await dbCommonSvc.getBudgetAndInvoiceData(req.body.date);
			let report = {"BudgetAndIncomeData":BudgetAndIncomeData.recordset,"BudgetAndIncomeDetailData":BudgetAndIncomeDetailData.recordset};
			 */
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};