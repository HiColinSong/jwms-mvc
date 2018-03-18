'use strict';

 var orders = {
 	to:{
		toNo:"to123456",
		doNo:"do123456",
		customer:"c123456",
		customerName:"Andrew"
	},
	do:{
		doNo:"do234567",
		customer:"c234567",
		customerName:"Brian"
	},
	po:{
	 	poNo:"po345678",
		vendor:"v345678",
		vendorName:"Colin"
	 },
	 wo:{
		"woNo":"wo112233",
		"material":"m123456",
		"batchNo":"btn123456",
		"batchQuantity":19,
		"balanceQuantity":12
	}
 }
  var item ={
	  	serialNo:"180701",
		batchNo:"45678901",
		material:"1809-1234"
	  };


exports.getOrder=function(orderNo,type){
	var order = orders[type];
	if (order){
		order[type+"No"]=orderNo;
	}
	return order;
};

exports.getItem=function(serialNo){
	item.serialNo=serialNo;
	return item;
};

