'use strict';

const util = require('../config/util');
const sapSvc =require('../dbservices/sapService');
const sqlSvc =require('../dbservices/sqlService');
const dbRtgReceiptSvc =require('../dbservices/dbRtgReceiptSvc');
const dbCommonSvc=require('../dbservices/dbCommonSvc');
const logger = require("../config/logger"); 
var Promise = require('Promise').default;
var order,promise;
exports.getOrder=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			var order = util.deliveryOrderConverter(sapOrder);
			//find customer name
			if (order.ShipToCustomer){
				var customer = await sapSvc.getCustomerDetail(order.ShipToCustomer);
				order.ShipToCustomerName=customer.CUSTOMERADDRESS.NAME;
			}
			//todo: check status 
			
			if (order&&order.DONumber){
				util.removeIncompleteItem(order.plannedItems);
				// if (order.confirmStatus!=="A"&&order.confirmStatus){
				// 	throw new Error("Invalid Order Status. Order Status is "+order.confirmStatus);
				// }
	
				//insertOrUpdateDo, PackStart will be set if the HU List is empty, or ignore
				var params={
					DONumber:order.DONumber,
					DOCreationDate:order.DOCreationDate,
					DOCreationUser:order.DOCreationUser,
					Plant:order.ShippingPoint,
					ShipToCustomer:order.ShipToCustomer,
					DOStatus:order.DOStatus,
					type:'rtgreceipts',
				}
				var DOItemNumberList=[];
				var MaterialCodeList=[];
				var BatchNumberList=[];
				var VendorBatchList=[];
				var DOQuantityList=[];
				for (let i=0;i<order.plannedItems.length;i++){
					DOItemNumberList[i]=order.plannedItems[i].DOItemNumber;
					MaterialCodeList[i]=order.plannedItems[i].MaterialCode;
					BatchNumberList[i]=order.plannedItems[i].BatchNo;
					VendorBatchList[i]=order.plannedItems[i].VendorBatch;
					DOQuantityList[i]=order.plannedItems[i].DOQuantity.toString();
				}
				params.DOItemNumberList = DOItemNumberList.join(',');
				params.MaterialCodeList = MaterialCodeList.join(',');
				params.BatchNumberList = BatchNumberList.join(',');
				params.VendorBatchList = VendorBatchList.join(',');
				params.DOQuantityList = DOQuantityList.join(',');
				var scannedItems=await dbRtgReceiptSvc.InsertOrUpdateDO(params);
				order.scannedItems=scannedItems.recordset;
				util.trimValues(order.scannedItems);
				return res.status(200).send(order);
			} else {
				return res.status(200).send({error:true,message:"The Delivery Order "+req.body.orderNo+" doesn't exist!"});
			}
		} catch (error) {
			return res.status(200).send({error:true,message:error.message});
		}
	})()
};

exports.addItem=function(req,res){
	(async function () {
		console.time("rgaInsert");
		var info=req.body,params={};
		params.DONumber=info.orderNo;
		params.EANCode=info.EANCode;
		params.MaterialCode=info.MaterialCode;
		params.BatchNo=info.BatchNo;
		// params.DOItemNumber=info.itemNumber;
		params.Qty = info.Qty||1;
		if (info.SerialNo){
			params.SerialNo=info.SerialNo;
			params.Qty = 1;
		} 
		params.ReceiptBy=req.session.user.UserID;
		params.ReceivedOn=info.scannedOn;
		params.Status = info.Status
		params.FullScanCode = info.FullScanCode;

		try {
			var scannedItems = await dbRtgReceiptSvc.InsertScanItem(params);
			// scannedItems=scannedItems.recordset;
			// util.trimValues(scannedItems);
			// return res.status(200).send(scannedItems);
			console.timeEnd("rgaInsert");
			return res.status(200).send([]);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};
exports.refreshScannedItems=function(req,res){
	(async function () {
		try {
			var scannedItems = await dbRtgReceiptSvc.getScannedItems(req.body.orderNo);
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
			await dbRtgReceiptSvc.deleteItemByKey(req.body.RowKey);
			var scannedItems = await dbRtgReceiptSvc.getScannedItems(req.body.orderNo);
			scannedItems=scannedItems.recordset;
			util.trimValues(scannedItems);
			return res.status(200).send(scannedItems);
		} catch (error) {
			return res.status(400).send([{error:true,message:error}]);
		}
	})()
};

exports.confirmRga=function(req,res){
	(async function () {
		try {
			var sapOrder = await sapSvc.getDeliveryOrder(req.body.orderNo);
			var order = util.deliveryOrderConverter(sapOrder);
			//find customer name
			if (order.ShipToCustomer){
				var customer = await sapSvc.getCustomerDetail(order.ShipToCustomer);
				order.ShipToCustomerName=customer.CUSTOMERADDRESS.NAME;
			}
			var scannedItems = await dbRtgReceiptSvc.getScannedItems(order.DONumber);
			order.scannedItems=scannedItems.recordset;
			util.trimValues(order.scannedItems);			
			
			if (order.pgiStatus==="C"){
				throw new Error("The document has been PGR!");
			}
			var ret = await sapSvc.pgrUpdate(order.DONumber,req.body.currentDate,req.session.user.DefaultWH);
			//if ret.PROT[0].MSGTY = 'E', throw error
			if (ret&&ret.PROT&&ret.PROT.length>0&&ret.PROT[0].MSGTY==='E'){
				let errMsg = "The PGR is failed!";
				logger.error({bapiName:"Z_WS_DELIVERY_UPDATE",result:ret,error:errMsg});
				throw new Error(errMsg);
			}
			


			var args = util.getTransParams(req.body.order,"RGA",req.session.user.UserID);
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

exports.rgaReversal=function(req,res){
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
			var args = util.getTransParams(order,"RGAX",req.session.user.UserID);
			if (args.IT_BX_STOCK.length>0)
				await sapSvc.serialNoUpdate(args);
			return res.status(200).send({confirm:"success"});
		} catch (error) {
			return res.status(400).send({error:true,message:error.message||error});
		}
	})()
}