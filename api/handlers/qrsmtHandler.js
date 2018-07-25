'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbSpoReceiptsSvc=require('../dbservices/dbSpoReceiptsSvc');
const dbPackingSvc =require('../dbservices/dbPackingSvc');
var workOrders = [
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000066596",
		"FullScanCode": "01088888930163751720071110W18070115|21180616861",
		"nPlanSGWQty": 192,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000078391",
		"FullScanCode": "01088888930162211720071110W18070116|21180619851",
		"nPlanSGWQty": 91,
		"nPlanQuarQty": 120,
		"nScanSGWQty": 2,
		"nScanQuarQty": 3,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000081717",
		"FullScanCode": "01088888930163201720071110W18070117|21180618971",
		"nPlanSGWQty": 241,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000081730",
		"FullScanCode": "01088888930163821720071110W18070118|21180619651",
		"nPlanSGWQty": 192,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000081744",
		"FullScanCode": "01088888930164671720071110W18070119|21180616681",
		"nPlanSGWQty": 173,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000084482",
		"FullScanCode": "01088888930162451720071110W18070120|21180617191",
		"nPlanSGWQty": 190,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000084488",
		"FullScanCode": "01088888930163441720071110W18070121|21180617941",
		"nPlanSGWQty": 234,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000087234",
		"FullScanCode": "01088888930162521720071110W18070122|21180617391",
		"nPlanSGWQty": 187,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000087239",
		"FullScanCode": "01088888930163371720071110W18070123|21180617591",
		"nPlanSGWQty": 93,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088876",
		"FullScanCode": "01088888930161841720071110W18070124|21180617061",
		"nPlanSGWQty": 122,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088879",
		"FullScanCode": "01088888930162691720071110W18070125|21180618741",
		"nPlanSGWQty": 223,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 19,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088884",
		"FullScanCode": "01088888930164051720071110W18070126|21180619221",
		"nPlanSGWQty": 193,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088885",
		"FullScanCode": "01088888930164121720071110W18070127|21180617691",
		"nPlanSGWQty": 240,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088886",
		"FullScanCode": "01088888930164291720071110W18070128|21180618491",
		"nPlanSGWQty": 242,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 62,
		"nScanQuarQty": 0
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000088887",
		"FullScanCode": "01088888930165041720071110W18070129|21180618191",
		"nPlanSGWQty": 141,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000089211",
		"FullScanCode": "01088888930165041720071110W18070130|21180618341",
		"nPlanSGWQty": 143,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	},
	{
		"SubConPoRefNo": "B20180041",
		"WorkOrder": "210000089213",
		"FullScanCode": "01088888930165421720071110W18070131|21180616591",
		"nPlanSGWQty": 85,
		"nPlanQuarQty": 0,
		"nScanSGWQty": 0,
		"nScanQuarQty": 0,
	}
	];

exports.getSubconWorkOrderForPlanner=function(req,res){
	(async function () {
		try {
			var data = {};
			// var list = await dbSpoReceiptsSvc.getSubconWorkOrders(req.body.orderNo);
			// data.workOrders = list.recordset;
			data.workOrders=workOrders;
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

exports.saveQuarShptPlan=function(req,res){
	(async function () {
		try {
			workOrders=req.body.workOrders;
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};

var prepackOrder={};
exports.getPrepackOrder=function(req,res){
	(async function () {
		try {
			prepackOrder.SubConPoRefNo=workOrders[0].SubConPoRefNo;
			prepackOrder.plannedItems=[];
			let j=0
			for (let i = 0; i < workOrders.length; i++) {
				const wo = workOrders[i];
				if (wo.nPlanQuarQty>0){
					prepackOrder.plannedItems[j++]={
						"orderNo": wo.SubConPoRefNo,
						"MaterialCode": wo.MaterialCode,
						"BatchNo": wo.BatchNo,
						"ItemNumber": "0".repeat(5-j.toString().length)+j.toString(),
						"Quantity": wo.nPlanQuarQty,
						"EANCode": wo.EANCode
					}
				}
				
			}
			// prepackOrder.HUList=[]

			return res.status(200).send(prepackOrder);
		} catch (error) {
			return res.status(400).send({error:true,message:error.message});
		}
	})()
};