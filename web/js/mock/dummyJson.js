/*bx - services.js - Yadong Zhu 2015*/
(function() {
	'use strict';
	angular.module('bx.mockBackend')
		.value("dummyJson",{
			userList:[
				{
					id:1,
					username:"yadong",
					password:"yadong",
					warehouseNo:"Z01"

				},
				{
					id:2,
					username:"ali",
					password:"ali",
					warehouseNo:"Z02"
				},
				{
					id:3,
					username:"devin",
					password:"devin",
					warehouseNo:"Z03"
				}
			],
			deliveryOrderList:[
				{
					"items": [
						{
							"DONumber": "0800379646",
							"MaterialCode": "BMXP-2208",
							"BatchNo": "W16120224",
							"VendorBatch": "W16120224",
							"DOItemNumber": "900001",
							"DOQuantity": 25,
							"ProductHierarchy": "100110011002100003",
							"EANCode": "8888893016139"
						},
						{
							"DONumber": "0800379646",
							"MaterialCode": "BMXP-2736",
							"BatchNo": "W16110620",
							"VendorBatch": "W16110620",
							"DOItemNumber": "900002",
							"DOQuantity": 13,
							"ProductHierarchy": "100110011002100003",
							"EANCode": "8888893016344"
						},
						{
							"DONumber": "0800379646",
							"MaterialCode": "BMXP-3533",
							"BatchNo": "W16110607",
							"VendorBatch": "W16110607",
							"DOItemNumber": "900003",
							"DOQuantity": 12,
							"ProductHierarchy": "100110011002100003",
							"EANCode": "8888893016498"
						}
					],
					"DONumber": "0800379646",
					"DOCreationUser": "S.CHAN",
					"DOCreationDate": "20170103",
					"ShipToCustomer": "0000032501",
					"plant": "3250",
					"warehouseNo": "Z01"
				}
			]
			,
			orderList:[
					{
						"orderNo":"o123456",
						"material":"m123456",
						"batchNo":"btc123456",
						"batchQuantity":19,
						"customer":"c123456",
						"customerName":"Andrew",
						"vendor":"v123456",
						"vendorName":"Colin",
						"doNo":"do123456",
						"HUList":"load",
						"createdBy":"Yadong",
						"shipFrom":"Biosensors BESA",
						"deliveryQty":50,
						"plannedGoodIssueDate":1520484931603,
						"actualTODate":1520484931603
					},
					{
						"orderNo":"o234567",
						"material":"m234567",
						"batchNo":"btc234567",
						"batchQuantity":19,
						"customer":"c234567",
						"customerName":"Andrew",
						"vendor":"v234567",
						"vendorName":"Colin",
						"doNo":"do234567",
						"createdBy":"Yadong",
						"shipFrom":"Biosensors BESA",
						"deliveryQty":80,
						"plannedGoodIssueDate":1520484931603,
						"ActualTODate":1520484931603
					}
			],
			
			HUList:[
						{
							id:"hu1",
							material:"hu123456",
							items:[
								{
									serialNo:"180101",
									batchNo:"12345678",
									category:"QA Sample",
									material:"1801-9999"
								},
								{
									serialNo:"180102",
									batchNo:"12345678",
									category:"BIT",
									material:"1802-9999"
								},
								{
									serialNo:"180201",
									batchNo:"12345678",
									category:"BESA",
									material:"1803-9999"
								},
								{
									serialNo:"180202",
									batchNo:"12345678",
									category:"QA Sample",
									material:"1804-9999"
								}
							]
						},
						{
							id:"hu2",
							material:"hu234567",
							items:[
								{
									serialNo:"180301",
									batchNo:"23456789",
									category:"BESA",
									material:"1805-9999"
								},
								{
									serialNo:"180302",
									batchNo:"23456789",
									category:"QA Sample",
									material:"1806-9999"
								},
								{
									serialNo:"180401",
									batchNo:"23456789",
									category:"BIT",
									material:"1807-9999"
								},
								{
									serialNo:"180402",
									batchNo:"23456789",
									category:"QA Sample",
									material:"1808-9999"
								}
							]
						},
						{
							id:"hu3",
							material:"hu345678",
							items:[
								{
									serialNo:"180501",
									batchNo:"34567890",
									category:"QA Sample",
									material:"1809-9999"
								},
								{
									serialNo:"180502",
									batchNo:"34567890",
									category:"BESA",
									material:"1810-9999"
								},
								{
									serialNo:"180601",
									batchNo:"34567890",
									category:"QA Sample",
									material:"1811-9999"
								},
								{
									serialNo:"180602",
									batchNo:"34567890",
									category:"BIT",
									material:"1812-9999"
								}
							]
						}
					],
			
			itemList:[
				{
					serialNo:"180903",
					batchNo:"67890123",
					material:"1809-1357",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"180904",
					batchNo:"67890123",
					material:"1810-1357",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"181003",
					batchNo:"67890123",
					material:"1811-1357",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"181004",
					batchNo:"67890123",
					material:"1812-1357",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"180905",
					batchNo:"78901234",
					material:"1809-2468",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"180906",
					batchNo:"78901234",
					material:"1810-2468",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"181005",
					batchNo:"78901234",
					material:"1811-2468",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				},
				{
					serialNo:"1810046",
					batchNo:"78901234",
					material:"1812-2468",
					receiptBy:"Andrew",
					receivedOn:1520484931603
				}
			],
			EANCode:{
				"08888893016399":"1812-2468",
				"08888893016400":"1812-2469",
				"08888893016401":"1812-2470"
			}
		})
}());