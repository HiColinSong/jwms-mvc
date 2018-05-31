'use strict';
const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const dbResvSvc =require('../dbservices/dbReservationSvc');
var resvDoc,promise;
exports.getResvDoc=function(req,res){
	(async function () {
		try {
			var sapDoc = await sapSvc.getReservationDoc(req.body.resvNo);
			var resvDoc = util.reservationConverter(sapDoc);
			//check status 
			if (resvDoc&&resvDoc.ResvNo){

				//insertOrUpdateDo, PackStart will be set if the HU List is empty, or ignore
				// var params={
				// 	TransferOrder:order.TONumber,
				// 	Warehouse:order.Warehouse,
				// 	TOCreationDate:order.TOCreationDate,
				// 	TOCreationUser:order.TOCreationUser,
				// 	DONumber:order.DONumber,
				// 	Plant:order.plannedItems[0].Plant,
				// 	ShipToCustomer:order.ShipToCustomer,
				// 	PickConfirmStatus:order.PickConfirmStatus||0
				// }
				// var TOItemNumberList=[];
				// var MaterialCodeList=[];
				// var BatchNumberList=[];
				// var VendorBatchList=[];
				// var TOQuantityList=[];
				// for (let i=0;i<order.plannedItems.length;i++){
				// 	TOItemNumberList[i]=order.plannedItems[i].TOItemNumber;
				// 	MaterialCodeList[i]=order.plannedItems[i].MaterialCode;
				// 	BatchNumberList[i]=order.plannedItems[i].BatchNo;
				// 	VendorBatchList[i]=order.plannedItems[i].VendorBatch;
				// 	TOQuantityList[i]=order.plannedItems[i].TOQuantity||1;
				// }
				// params.TOItemNumberList = TOItemNumberList.join(',');
				// params.MaterialCodeList = MaterialCodeList.join(',');
				// params.BatchNumberList = BatchNumberList.join(',');
				// params.VendorBatchList = VendorBatchList.join(',');
				// params.TOQuantityList = TOQuantityList.join(',');
				// let ret=await dbPickingSvc.InsertOrUpdateTO(params);
				// ret = ret.recordset;
				// if (ret.length>0){
				// 	order.PickStart = ret[0].PickStart;
				// 	order.PickComplete = ret[0].PickComplete||undefined;
				// 	order.PickStatus = ret[0].PickStatus||undefined;
				// 	order.Push2SAPStatus = ret[0].Push2SAPStatus||undefined;
				// 	order.SAPRefNo = ret[0].SAPRefNo||undefined;
				// }
	
				return res.status(200).send(resvDoc);
			} else {
				return res.status(200).send({error:true,message:"The Reservation "+req.body.resvNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		var info=req.body,params={};
		params.ResvNo=info.orderNo;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		// params.DOItemNumber=info.itemNumber;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.PostBy=req.session.user.UserID;
		params.PostOn=info.scannedOn;
		params.Status = info.Status
		params.FullScanCode = info.FullScanCode;

		try {
			var scannedItems = await dbResvSvc.InsertScanItem(params);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.removeItem=function(req,res){
	(async function () {
		try {
			await dbResvSvc.deleteItemByKey(req.body.RowKey);
			var scannedItems = await dbResvSvc.getScannedItems(req.body.orderNo);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.confirmReservation=function(req,res){
	(async function () {
		try {
			// if (req.body.order.pgiStatus==="C"){
			// 	throw new Error("The document has been PGR!");
			// }
			var ret = await sapSvc.pgrUpdate(req.body.order.DONumber,req.body.currentDate,req.session.user.DefaultWH);

			var args = util.getTransParams(req.body.order,"RGA");
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);

			var info={
				DONumber:req.body.orderNo,
				DOStatus:'C',
			}
			await dbCommonSvc.UpdateDOStatus(info);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
};

exports.reversationReversal=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			var order = util.deliveryOrderConverter(sapOrder);
			
			if (!order.DONumber){
				throw new Error("The RGA "+req.body.orderNo+" doesn't exist.");
			}
			
			if (order.pgiStatus!=="C"){
				throw new Error("The Document hasn't been PGR yet.");
			}
			var ret = await sapSvc.pgrReversal(req.body.orderNo,order.DeliveryType,req.body.currentDate);
			//update the SN in sap
			var scannedItems = await dbRtgReceiptSvc.getScannedItems(req.body.orderNo);
			order.scannedItems = scannedItems.recordset;
			util.trimValues(order.scannedItems);
			var args = util.getTransParams(order,"RGAX");
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
}

