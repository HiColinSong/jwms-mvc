'use strict';
exports.formatDateTime=function(dateString){
	let d=(dateString)?new Date(dateString):new Date();
	let formatDate =  d.getFullYear()+("0"+(d.getMonth()+1)).slice(-2)+("0"+d.getDate()).slice(-2);
	let formatTime = ("0"+d.getHours()).slice(-2)+("0"+d.getMinutes()).slice(-2)+("0"+d.getSeconds()).slice(-2);
	return {date:formatDate,time:formatTime}
}

 exports.cleanObject = function (object){
 	for (let key in object) {
	    if (object.hasOwnProperty(key)) {
		        if (Array.isArray(object[key])&&object[key].length===0){
		        	object[key]=undefined;
		        }
		    }
		}
		return object;
 }
//  conver SAP Delivery Order into BX friendly DO, i.e. only output necessary fields with meaningful field name
 var sapFields = require('./sapFields.json');
 exports.deliveryOrderConverter = function (deliveryOrder){
	 var _do = {plannedItems:[]};
	 var headerFields=sapFields.deliveryOrderHeaderFields;
	 var headerSTSFields=sapFields.deliveryOrderHeaderSTSFields;
	 var itemFields=sapFields.deliveryOrderItemFields;
	 var itemSTSFields=sapFields.deliveryOrderItemSTSFields;
	 var header,doItems,doItem;
	 if (deliveryOrder.ET_DELIVERY_HEADER&&deliveryOrder.ET_DELIVERY_HEADER.length>0){
		 header = deliveryOrder.ET_DELIVERY_HEADER[0];
	 	for (let key in headerFields) {
			_do[key]=header[headerFields[key]];
		 }
	 }
	 if (deliveryOrder.ET_DELIVERY_HEADER_STS&&deliveryOrder.ET_DELIVERY_HEADER_STS.length>0){
		 header = deliveryOrder.ET_DELIVERY_HEADER_STS[0];
	 	for (let key in headerSTSFields) {
			_do[key]=header[headerSTSFields[key]];
		 }
	 }
	 if (deliveryOrder.ET_DELIVERY_ITEM&&deliveryOrder.ET_DELIVERY_ITEM.length>0){
		 doItems = deliveryOrder.ET_DELIVERY_ITEM;
		 _do.totalPlannedQty=0;
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.plannedItems.push({});
			for (let key in itemFields) {
				_do.plannedItems[i][key]=doItem[itemFields[key]];
				// if (_do.plannedItems[i][key]&&(typeof _do.plannedItems[i][key] ==="string"))
				// 	 _do.plannedItems[i][key]=_do.plannedItems[i][key].replace(/^0+/, ''); //remove leading 0s
					
				if (_do.plannedItems[i][key]&&(key ==="DOQuantity")){
					_do.plannedItems[i][key]=parseInt(_do.plannedItems[i][key]);
					_do.totalPlannedQty+=_do.plannedItems[i][key];
				}
			}
		}
	 }
	 if (deliveryOrder.ET_DELIVERY_ITEM_STS&&deliveryOrder.ET_DELIVERY_ITEM_STS.length>0){
		 doItems = deliveryOrder.ET_DELIVERY_ITEM_STS;
		for (let i = 0; i < doItems.length; i++) {
			doItem = doItems[i];
			_do.plannedItems.push({});
			for (let key in itemSTSFields) {
				 _do.plannedItems[i][key]=doItem[itemSTSFields[key]];
			}
		}
	 }
	 //find enduser code
	 if (deliveryOrder.ET_DELIVERY_PARTNER&&deliveryOrder.ET_DELIVERY_PARTNER.length>0){
		doItems = deliveryOrder.ET_DELIVERY_PARTNER;
		for (let i = 0; i < doItems.length; i++) {
			if(doItems[i].PARVW==="ZE"){
				_do.endUser=doItems[i].KUNNR;
			}
		}
	 }
	 return _do;
 }
 exports.transferOrderConverter = function (transferOrder){
	 var _to = {plannedItems:[]};
	 var transferOrderFields=sapFields.transferOrderFields;
	 var headerFields=sapFields.transferOrderHeaderFields;
	 var itemFields=sapFields.transferOrderItemFields;
	 var header,items,item;
	 if (transferOrder){
	 	for (let key in transferOrderFields) {
			_to[key]=transferOrder[transferOrderFields[key]];
		 }
	 }
	 if (transferOrder.TOHEADERDATA&&transferOrder.TOHEADERDATA.length>0){
		 header = transferOrder.TOHEADERDATA[0];
	 	for (let key in headerFields) {
			_to[key]=header[headerFields[key]];
		 }
	 }
	 if (transferOrder.TOITEMDATA&&transferOrder.TOITEMDATA.length>0){
		 items = transferOrder.TOITEMDATA;
		for (let i = 0; i < items.length; i++) {
			item = items[i];
			_to.plannedItems.push({});
			for (let key in itemFields) {
				_to.plannedItems[i][key]=item[itemFields[key]];
				// if (_to.plannedItems[i][key]&&(typeof _to.plannedItems[i][key]==="string"))
				// 	_to.plannedItems[i][key]=_to.plannedItems[i][key].replace(/^0+/, '');//remove leading 0s
				if (_to.plannedItems[i][key]&&(key ==="TOQuantity"))
					_to.plannedItems[i][key]=parseInt(_to.plannedItems[i][key]);
			}
		}
	}
	return _to;
}
 exports.reservationConverter = function (doc){
	 var _resv = {plannedItems:[]};
	 var headerFields=sapFields.reservationHeaderFields;
	 var itemFields=sapFields.reservationItemFields;
	 var header,items,item;

	 if (doc.RESERVATION_HEADER){
		 header = doc.RESERVATION_HEADER;
	 	for (let key in headerFields) {
			_resv[key]=header[headerFields[key]];
		 }
	 }
	 if (doc.RESERVATION_ITEMS&&doc.RESERVATION_ITEMS.length>0){
		 let postedItem=undefined;
		 let nonPostedItem=undefined;
		 items = doc.RESERVATION_ITEMS;
		 items = doc.RESERVATION_ITEMS;
		 _resv.totalPlannedQty=0;
		for (let i = 0; i < items.length; i++) {
			item = items[i];
			_resv.plannedItems.push({});
			for (let key in itemFields) {
				_resv.plannedItems[i][key]=item[itemFields[key]];
				// if (_resv.plannedItems[i][key]&&(key ==="Quantity"))
				// 	_resv.plannedItems[i][key]=parseInt(_resv.plannedItems[i][key]);
			}
			_resv.totalPlannedQty+=_resv.plannedItems[i].Quantity;
			if (_resv.plannedItems[i].ResvStatus==='X')
				postedItem=true;
			if (!_resv.plannedItems[i].ResvStatus)
				nonPostedItem=true;
		}
		if (postedItem&&!nonPostedItem){
			_resv.postingStatus="Completed"
		} else if (postedItem){
			_resv.postingStatus="Partial"
		} else {
			_resv.postingStatus="NotStarted"
		}
	}
	return _resv;
}

//rebuild quarantine shipment plan for FE use
exports.rebuildQuarShptPlan = function (list){
	let setWorkOrder=function(plan){
			return {
				workOrder:plan.workOrder,
				batchNo:plan.batchNo,
				materialCode:plan.materialCode,
				planQty:plan.planQty,
				planBy:plan.planBy,
				planOn:plan.planOn,
				confirmedOn:plan.prepackConfirmOn,
				totalBITQty:plan.totalBITQty,
				scannedBITQty:plan.scannedBITQty,
				availbleBITQty:plan.availbleBITQty,
				scannedQuarQty:plan.scannedQuarQty,
			}
		};
	let addToCurrentPlan=function (wo,currentPlan){
			for (let i = 0; i < currentPlan.workOrders.length; i++) {
				const cwo = currentPlan.workOrders[i];
				if (wo.workOrder===cwo.workOrder){ //found the wo in currentPlan, return
					return;
				}
			}
			//the wo is missed in current plan, need to add to current plan with planQty 0,
			let temp={}
			Object.assign(temp,wo);
			temp.planBy=null;
			temp.planOn=null;
			temp.confirmedOn=null;
			temp.prepackConfirmOn=undefined;
			temp.planQty=0;
			temp.scannedQuarQty=0;
			currentPlan.workOrders.push(temp)
			return;
		};

	let previousPlans=[];
	let currentPlan;
	let quarShptNumber;
	let temp;
	if (list.length>0){
		for (let i = 0; i < list.length;i++) {
			if (list[i].prepackConfirmOn){ //previous plan
				if (quarShptNumber&&quarShptNumber===list[i].qsNo){ //same qsNo, only append new workorders
					previousPlans[previousPlans.length-1].workOrders.push(setWorkOrder(list[i]))
				} else  { //new qsNo
					temp=setWorkOrder(list[i]);
					previousPlans.push({
						qsNo:list[i].qsNo,
						subconPORefNo:list[i].subconPORefNo,
						workOrders:[temp]
					})
					quarShptNumber=list[i].qsNo;
				} 
			} else { //current plan
				currentPlan=currentPlan||{
					qsNo:list[i].qsNo,
					subconPORefNo:list[i].subconPORefNo,
					workOrders:[]
				}
				currentPlan.workOrders.push(setWorkOrder(list[i]))
			}
		} //end of for loop
	}
	if (!currentPlan.qsNo){
		// let previousQsnCount=previousPlans.length;
		// currentPlan.qsNo=currentPlan.subconPORefNo+((previousQsnCount>9)?(previousQsnCount+1):"0"+(previousQsnCount+1));
		let runningNumber=parseInt(previousPlans[previousPlans.length-1].qsNo.slice(-2))+1;
		currentPlan.qsNo=currentPlan.subconPORefNo+((runningNumber>9)?(runningNumber):"0"+runningNumber);
	}
	//loop over previousPlans to find the workorders missed in currentplan
	for (let i = 0; i < previousPlans.length; i++) {
		const pplan = previousPlans[i];
		for (let j = 0; j < pplan.workOrders.length; j++) {
			const wo = pplan.workOrders[j];
			addToCurrentPlan(wo,currentPlan);
		}
	}
	currentPlan.workOrders=this.arraySort(currentPlan.workOrders,"workOrder");
	return {previousPlans:previousPlans,currentPlan:currentPlan}
}
//rebuild Lot Release Table for FE use
exports.rebuildLotReleaseTable = function (list){
	let lotReleaseTable=[];
	let woNo,temp;

	//the list is sorted by the workorder
	if (list.length>0){
		for (let i = 0; i < list.length;i++) {
			const wo=list[i];
			if (wo.workOrder!==woNo){ //new workorder
				lotReleaseTable.push(wo);
				woNo=wo.workOrder;
			} else { //record with same workOrder number as the last one
				temp=lotReleaseTable[lotReleaseTable.length-1] //last wo
				temp.quarShptPlanQty+=wo.quarShptPlanQty;
				temp.scannedQuarQty+=wo.scannedQuarQty;
			}
		} //end of for loop
	}
	
	return lotReleaseTable;
}

exports.buildPrepackOrder = function(list){
	let orders=[];
	let _qsNo;//hold the qsNo for previous item
		for (let i = 0; i < list.length; i++) {
			const wo = list[i];
			if (wo.qsNo&&wo.planQty>0){
				if (wo.qsNo!==_qsNo){
					orders.push({
						qsNo:wo.qsNo,
						prepackConfirmOn:wo.prepackConfirmOn,
						subconPORefNo:wo.subconPORefNo,
						linkedDONumber:wo.linkedDONumber
					})
					_qsNo=wo.qsNo;
				}
				if (orders.length>0){
					orders[orders.length-1].plannedItems=orders[orders.length-1].plannedItems||[];
					orders[orders.length-1].plannedItems.push({
						"qsNo": wo.qsNo,
						"MaterialCode": wo.materialCode,
						"BatchNo": wo.batchNo,
						"DOItemNumber": wo.workOrder,
						"workOrder": wo.workOrder,
						"DOQuantity": wo.planQty,
						"ScanQty": 0
					})
				}
			}
		}
		if (orders.length===0){
			throw new Error("There is no quarantine shipment plan for the subcon PO!");
		}
	return orders;
}
 //for DO order items, remove the item that misses BatchNo or MaterialCode or DOQuantity is 0
exports.removeIncompleteItem = function (items){
	if (items.length>0){
		for (let i = 0; i < items.length;) {
			if (!items[i].BatchNo||!items[i].MaterialCode||!items[i].DOQuantity===0){
				items.splice(i,1);
			} else {
				i++;
			}
		}
	}
}
 //for DO order items, remove the item that misses BatchNo or MaterialCode or DOQuantity is 0
exports.trimValues = function (list){
	if (list.length>0){
		for (let i = 0; i < list.length; i++) {
			for (let key in list[i]) {
				if (list[i][key]&&typeof list[i][key] ==="string")
				list[i][key]=list[i][key].trim();
			 }
		}
	}
}

//get SNUpdate Params
exports.getTransParams = function(order,TRANS,bxUser){
	const HUList = order.HUList;
	const scannedItems = order.scannedItems;
	var args = {IT_BX_STOCK:[]};
	if (HUList&&HUList.length>0){
		for (let i = 0; i < HUList.length; i++) {
			const hu = HUList[i];
			for (let j = 0; j < hu.scannedItems.length; j++) {
				const item = hu.scannedItems[j];
				if (item.SerialNo){
					args.IT_BX_STOCK.push({
						TRANS:TRANS,
						WERKS:order.plannedItems[0].Plant,
						MATNR:item.MaterialCode,
						CHARG: item.BatchNo,
						SERIAL:item.SerialNo,
						DOCNO: (TRANS==='PGI'||TRANS==='PGIX')?order.DONumber:item.HUNumber,
						ENDCUST:order.ShipToCustomer,
						BXDATE:this.formatDateTime().date,//real time 
						BXTIME:this.formatDateTime().time,//real time
						BXUSER:bxUser//should be BX login User
					});
				}
			}
		}
	} else if (scannedItems){
		for (let j = 0; j < scannedItems.length; j++) {
			const item = scannedItems[j];
			if (item.SerialNo){
				args.IT_BX_STOCK.push({
					TRANS:TRANS,
					WERKS:order.plannedItems[0].Plant,
					MATNR:item.MaterialCode,
					CHARG: item.BatchNo,
					SERIAL:item.SerialNo,
					DOCNO: order.DONumber||order.ResvNo||order.orderNo,
					ENDCUST:order.ShipToCustomer,
					BXDATE:this.formatDateTime().date,
					BXTIME:this.formatDateTime().time,
					BXUSER:bxUser
				});
			}
		}
	}
	return args
}

//access control
var accessControl = require('./accessControl.json');
exports.checkAccess=function(role,targetUrl){
	if (!accessControl[role]) return true;
	let access=true;
	if (accessControl[role]["allowedUrls"]){
		access=false; 
	}
	let accessUrls = accessControl[role]["allowedUrls"]||accessControl[role]["bannedUrls"]
	for (let i = 0; i < accessUrls.length; i++) {
		const accessUrl = accessUrls[i];
		if (targetUrl.toLowerCase().match(accessUrl.toLowerCase())){
			access=!access;
			break;
		}
	}
	return access;
}

exports.arraySort=function(array,sortKey,order='asc'){
	let sorted=[];
	if (array&&array.length>0){
		sorted=array.sort(compare(sortKey,order))
	}
	return sorted;
}

function compare(key, order) {
	return function(a, b) {
	  if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
		// property doesn't exist on either object
		  return 0; 
	  }
  
	  const varA = (typeof a[key] === 'string') ? 
		a[key].toUpperCase() : a[key];
	  const varB = (typeof b[key] === 'string') ? 
		b[key].toUpperCase() : b[key];
  
	  let comparison = 0;
	  if (varA > varB) {
		comparison = 1;
	  } else if (varA < varB) {
		comparison = -1;
	  }
	  return (
		(order == 'desc') ? (comparison * -1) : comparison
	  );
	};
  }
