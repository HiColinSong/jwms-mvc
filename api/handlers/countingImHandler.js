'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbCountingSvc =require('../dbservices/dbCountingSvc');
exports.getPiDoc=function(req,res){
	(async function () {
		try {
			let sapDoc = await sapSvc.getCountingImDoc(req.body.docNo,req.body.fiscalYear);
			let piDoc = util.countingImDocConverter(sapDoc);
				// insert data to dbo.BX_CountingIM
				var params={
					docNo:piDoc.docNo,
					fiscalYear:piDoc.fiscalYear,
				}
				var itemNoList=[];
				var materialList=[];
				var batchList=[];
				for (let i=0;i<piDoc.items.length;i++){
					itemNoList[i]=piDoc.items[i].item;
					materialList[i]=piDoc.items[i].MaterialCode;
					batchList[i]=piDoc.items[i].BatchNo;
				}
				params.itemNoList = itemNoList.join(',');
				params.materialList = materialList.join(',');
				params.batchList = batchList.join(',');
				let ret=await dbCountingSvc.InsertOrUpdateCountingIM(params);
				ret = ret.recordsets;

				if (ret.length>0){
					piDoc.extraItems=ret[0];
				}
				if (ret.length>1){
					piDoc.entryCounts= ret[1];
				}
				if (ret.length>2){
					piDoc.scannedItems= ret[2];
					util.trimValues(piDoc.scannedItems);
				}
				return res.status(200).send(piDoc);				

		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		var info=req.body,params={};
		params.docNo=info.orderNo;
		params.fiscalYear=info.fiscalYear;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.countBy=req.session.user.UserID;
		params.countOn=info.scannedOn;
		params.FullScanCode = info.FullScanCode;

		try {
			await dbCountingSvc.InsertImScanItem(params)
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			// await dbCountingSvc.deleteIMItemById(req.body.itemId);
			let ret = await dbCountingSvc.deleteIMItemById(req.body.docNo,req.body.fiscalYear,req.body.itemId);
			ret = ret.recordsets;
			let extraItems = (ret.length>0)?ret[0]:[];
			let entryCounts = (ret.length>1)?ret[1]:[];
			let scannedItems =(ret.length>2)?ret[2]:[];
			util.trimValues(scannedItems);
			let data={scannedItems:scannedItems,extraItems:extraItems,entryCounts:entryCounts}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refresh=function(req,res){
	(async function () {
		try {
			let ret = await dbCountingSvc.CountingIMRefreshCounts(req.body.docNo,req.body.fiscalYear);
			ret = ret.recordsets;
			let extraItems = (ret.length>0)?ret[0]:[];
			let entryCounts = (ret.length>1)?ret[1]:[];
			let scannedItems =(ret.length>2)?ret[2]:[];
			util.trimValues(scannedItems);
			let data={scannedItems:scannedItems,extraItems:extraItems,entryCounts:entryCounts}
			return res.status(200).send(data);
		} catch (error) {
			return res.status(200).send([{error:true,message:error}]);
		}
	})()
};
exports.confirm=function(req,res){
	(async function () {
		try {
			let entryCounts=await dbCountingSvc.getIMEntryCount(req.body.docNo,req.body.fiscalYear);
			entryCounts=entryCounts.recordset;
			let extraItems=[];
			for (let i = 0; i < entryCounts.length; i++) {
				const ec = entryCounts[i];
				if (!ec.itemNo){
					extraItems.push(ec)
				}
			}
			if (extraItems.length>0){
				await sapSvc.countingIMExtraItems(req.body.docNo,req.body.fiscalYear,extraItems)
			}
			let sapDoc = await sapSvc.getCountingImDoc(req.body.docNo,req.body.fiscalYear);
			let piDoc = util.countingImDocConverter(sapDoc);
			entryCounts=await dbCountingSvc.getIMEntryCount(req.body.docNo,req.body.fiscalYear);
			entryCounts=entryCounts.recordset;
			util.trimValues(entryCounts)
			if (entryCounts.length>0&&piDoc.items&&piDoc.items.length>0){
				for (let i = 0; i < entryCounts.length; i++) {
					const ec = entryCounts[i];
					for (let j = 0; j < piDoc.items.length; j++) {
						const item = piDoc.items[j];
						if (ec.itemNo===item.item&&
						 	ec.MaterialCode===item.MaterialCode&&
						 	ec.BatchNo===item.BatchNo){
								item.ScanQty=ec.entryCount;
						}
					}
				}
			}
			
			let ret = await sapSvc.countingIM(piDoc,req.body.countDate);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};
