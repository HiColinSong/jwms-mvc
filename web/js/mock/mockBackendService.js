/*bx - services.js - Yadong Zhu 2018*/
(function(angular) {
	'use strict';
	if (!String.prototype.startsWith) {
	  String.prototype.startsWith = function(searchString, position) {
	    position = position || 0;
	    return this.indexOf(searchString, position) === position;
	  };
	}
	angular.module('bx.mockBackend')
		.service('mockBackendService', ['$httpBackend','apiValues','mockResponseService',
			function($httpBackend,apiValues,mockRespSvc) {
				var urlParams = apiValues.pattern.split("/");
				return {
					useRealBackend:function(){
						$httpBackend.whenGET(/.+/).passThrough();
						$httpBackend.whenPOST(/(.+)/).passThrough()
					},
					useMockBackend:function(){
						$httpBackend.whenGET(/partials\/(.+)\.html/).passThrough();


						var urlPattern,method,paramName,paramValue,mockResponse,urlRegex;
						for (var actionName in apiValues.actions){
							method=apiValues.actions[actionName].method.toUpperCase();
							mockResponse = mockRespSvc[actionName];
							if (mockResponse){ //only apply mock backend when mockResponse is present
								urlPattern="";
								for(var i in urlParams){
									if (urlParams[i].startsWith(':')){
										paramName=urlParams[i].replace(":","").replace(".json","");
										paramValue=apiValues.actions[actionName]['params'][paramName];
										if (paramValue&&paramValue.startsWith("@")){//replace id placeholder with pattern
											urlPattern+="/[a-zA-Z0-9]+";
										} else if (paramValue){
											urlPattern+="/"+apiValues.actions[actionName]['params'][paramName];
										}
									}  else {
										urlPattern+=""+urlParams[i];
									}
								}
								urlPattern+=".json";
								console.log("mock urls="+urlPattern);
								//escape the pattern characters
								urlPattern=urlPattern.replace(/\//g, "\\/").replace(/\./g, "\\.");
								urlRegex = new RegExp(urlPattern, "g")
								$httpBackend.when(method,urlRegex).respond(mockResponse);
								$httpBackend.when(method,urlRegex).respond(mockResponse);//make it twice so that the subsecquent call won't fail
								//$httpBackend.when(method,urlRegex).respond(function(){
                                //
								//});

							}
						}

						//urlPattern="bxbean/administrator/home.json";
						//urlPattern=urlPattern.replace(/\//g, "\\/").replace(/\./g, "\\.");
						//urlRegex = new RegExp(urlPattern, "g")
						//$httpBackend.when("GET",urlRegex).respond(mockRespSvc.getHomeJson);
						$httpBackend.whenGET(/.+/).passThrough();
						$httpBackend.whenPOST(/(.+)/).passThrough();
					}

				}
			}
		])
		.service("mockResponseService",['dummyJson','utilSvc','localStorageService','constants',
			function(dummyJson,utilSvc,cacheSvc,constants){
			var status = function(data){
				var sts=undefined;
				if (cacheSvc.get("loginUser")){
					sts=200;
					if (data)
						data.loginUser=cacheSvc.get("loginUser");
				} else {
					sts=401;
				}
				return sts;
			}
			return {
					getSubconPurchaseOrder:function(method,pattern){
						var list = dummyJson.orderList;
						var a1=pattern.split("/");
						var orderNo=a1[a1.length-1].split(".")[0];
						var data=utilSvc.findItemById(orderNo,list,"orderNo");
						return [status(),data];
					},
					getOrderForPacking:function(method,pattern){
						var list = dummyJson.orderList;
						var a1=pattern.split("/");
						var orderNo=a1[a1.length-1].split(".")[0];
						var data=utilSvc.findItemById(orderNo,list,"orderNo");
						if (data&&data.HUList){
							data.HUList=dummyJson.HUList;
						}
						return [status(),data];
					},
					getRtgDeliveryOrder:function(method,pattern){
						var list = dummyJson.orderList;
						var a1=pattern.split("/");
						var orderNo=a1[a1.length-1].split(".")[0];
						var data=utilSvc.findItemById(orderNo,list,"orderNo");
						return [status(),data];
					},
					getOrderForPicking:function(method,pattern){
						var list = dummyJson.orderList;
						var a1=pattern.split("/");
						var orderNo=a1[a1.length-1].split(".")[0];
						var data=utilSvc.findItemById(orderNo,list,"orderNo");
						if (!data){ //if not found as orderNo, try doNo
							data=utilSvc.findItemById(orderNo,list,"doNo")
						}
						return [status(),data];
					},
					addItemToSpo:function(method,pattern){
						var data={};
						if (status()===200){
							var spolist = dummyJson.orderList;
							var a1=pattern.split("/");
							var categoryId=a1[a1.length-3];
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var spo=utilSvc.findItemById(orderNo,spolist,"orderNo");
							if (spo){
								spo.categoryId=categoryId;
							}
							var item = utilSvc.findItemById(sno,dummyJson.itemList,"serialNo")
							if (item){
								spo.items=spo.items||[];
								spo.items.push(item);
							}
							data=spo;
						}
						return [status(),data];
					},
					addItemToRtgDo:function(method,pattern){
						var data={};
						if (status()===200){
							var polist = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var po=utilSvc.findItemById(orderNo,polist,"orderNo");
							
							var item = utilSvc.findItemById(sno,dummyJson.itemList,"serialNo")
							if (item){
								po.items=po.items||[];
								po.items.push(item);
							}
							data=po;
						}
						return [status(),data];
					},
					removeItemFromSpo:function(method,pattern){
						var data={};
						if (status()===200){
							var spolist = dummyJson.orderList;
							var a1=pattern.split("/");
							var categoryId=a1[a1.length-3];
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var spo=utilSvc.findItemById(orderNo,spolist,"orderNo");
							if (spo){
								spo.categoryId=categoryId;
							}
							utilSvc.removeItemById(sno,spo.items,"serialNo")
							data=spo;
						}
						return [status(),data];
					},
					removeItemFromRtgDo:function(method,pattern){
						var data={};
						if (status()===200){
							var polist = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var po=utilSvc.findItemById(orderNo,polist,"orderNo");
							
							utilSvc.removeItemById(sno,po.items,"serialNo")
							data=po;
						}
						return [status(),data];
					},
					removeHu:function(method,pattern){
						var list = dummyJson.orderList;
						var a1=pattern.split("/");
						var orderNo=a1[a1.length-2];
						var HUcode=a1[a1.length-1].split(".")[0];
						utilSvc.removeItemById(HUcode,list[0].HUList,"barcode")
						var data=list[0];
						return [status(),data];
					},
					removeHuItem:function(method,pattern){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-3];
							var HUcode=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var hu=utilSvc.findItemById(HUcode,list[0].HUList,"barcode");
							utilSvc.removeItemById(sno,hu.items,"serialNo")
							data=list[0];
						}
						return [status(),data];
					},
					createHu:function(method,pattern,p1,p2,p3){
						var data={newHU:[]};
						if (status()===200){
							var info=JSON.parse(p1);
							var date;
							for (var i=0;i<info.newHuNo;i++){
								date=new Date();
								data.newHU.push({
									material:info.material,
									id:(date.getTime()+i.toString()),
									items:[]
								})
							}
						}
						return [status(),data];
					},
					addItemToHu:function(method,pattern){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-3];
							var HUcode=a1[a1.length-2];
							// var categoryId=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var hu=utilSvc.findItemById(HUcode,list[0].HUList,"barcode");
							var item = utilSvc.findItemById(sno,dummyJson.itemList,"serialNo")
							hu.items=hu.items||[];
							if (item){
								// item.category=utilSvc.findItemById(categoryId,constants.categories,"id")["display"];
								hu.items.push(item);
							}
							data=list[0];
						}
						return [status(),data];
					},
					addItemforPicking:function(method,pattern){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var order=utilSvc.findItemById(orderNo,list,"orderNo");
							if (!order){
								order=utilSvc.findItemById(orderNo,list,"doNo");
							}

							var item = utilSvc.findItemById(sno,dummyJson.itemList,"serialNo")

							if (item){
								order.items=order.items||[];
								order.items.push(item);
							}
							data=order;
						}
						return [status(),data];
					},
					removePickingItem:function(method,pattern){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-2];
							var sno=a1[a1.length-1].split(".")[0];
							var order=utilSvc.findItemById(orderNo,list,"orderNo");
							if (!order){
								order=utilSvc.findItemById(orderNo,list,"doNo");
							}

							utilSvc.removeItemById(sno,order.items,"serialNo");
							data=order;
						}
						return [status(),data];
					},
					checkLoginStatus:function(method,pattern){
						var data={};
						status(data);
						return [200,data];
					},
					login:function(method,pattern,p1,p2,p3){
						var user={},status=undefined;
						var list=dummyJson.userList;
						var login=JSON.parse(p1);
						var username=login.username;
						var password=login.password;
						user=utilSvc.findItemById(username,list,"username");
						if (user&&user.password===password){
							status=200;
							cacheSvc.set("loginUser",user)
						} else {
							status=403;
							user=undefined
						}
						return [status,{loginUser:user}];
					},
					logout:function(){
						cacheSvc.remove("loginUser");
						return [200,{loginStatus:"logout"}];
					},

					setPickingStatus:function(method,pattern){
						var data={};

						if (status()===200){
							var a1=pattern.split("/");
							var orderNo=a1[a1.length-2];
							var pickingStatus=a1[a1.length-1].split(".")[0]; //start,comlete,confirm,reset
							
							var list = dummyJson.orderList;
							 data=utilSvc.findItemById(orderNo,list,"orderNo");
							if (!data){ //if not found as orderNo, try doNo
								data=utilSvc.findItemById(orderNo,list,"doNo")
							}	

							if (pickingStatus!=='reset'){
								data.pickingStatus=pickingStatus;
							} else {
								data.pickingStatus=undefined;
							}
						}
						return [status(),data];
					},
					//confirm operation: confirm SP Order receits, picking ,packing etc.
					confirmOperation:function(method,pattern,p1,p2,p3){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var type=a1[a1.length-2];
							var order=JSON.parse(p1);
							if (order.orderNo){
								var originalOrder=utilSvc.findItemById(order.orderNo,list,"orderNo");
								if (originalOrder)
									originalOrder.status="invalid";
							}
							data.type="success";
							data.resetPath="/"+type;
							if (type.toLowerCase()==="sporeceipts"){
								data.message="The Subcon Order "+order.orderNo+" is receipted!";
							} else if(type.toLowerCase()==="rtgreceipts"){
								data.message="The Delivery Order "+order.orderNo+" is receipted!";
							} else if(type.toLowerCase()==="picking"){
								data.message="The picking of transfer Order "+order.orderNo+" is confirmed!";
							} else if(type.toLowerCase()==="packing"){
								data.message="The packing of delivery order "+order.orderNo+" is confirmed!";
							}
						}
						return [status(),data];
					},
					checkOrderStatus:function(method,pattern,p1,p2,p3){
						var data={};
						if (status()===200){
							var list = dummyJson.orderList;
							var a1=pattern.split("/");
							var type=a1[a1.length-2];
							var orderNo=a1[a1.length-1].split(".")[0];
							var order=utilSvc.findItemById(orderNo,list,"orderNo");
							 if (order&&(!order.status||order.status==='valid')){
							 	data.status = "valid";
							 } else {
							 	data.status = "invalid";
							 }
							 //mimic status change during the operation
							 if (order.orderNo==="o234567"){
							 	data.status="invalid";
							 }
						}
						return [status(),data];
					},
					findMaterialByEAN:function(method,pattern,p1,p2,p3){
						var data={};
						if (status()===200){
							var eanCodeList = dummyJson.EANCode;
							var a1=pattern.split("/");
							var type=a1[a1.length-2];
							var eanCode=a1[a1.length-1].split(".")[0];
							data.material=eanCodeList[eanCode];
							data.material=data.material||"9999-8888"
							
						}
						return [status(),data];
					}
			}
		}]);
}(window.angular));