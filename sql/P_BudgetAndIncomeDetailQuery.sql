--exec P_BudgetAndIncomeDetailQuery '2019','1'
--2019/1/6
--Colin Demo for report
Create PROC P_BudgetAndIncomeDetailQuery(
@Year int =2019,
@Month int=1
)
As
Select 
'东北大区'	FBigAreaName,
'张利怀'	FBigAreaMgr,
'小区1'	FAreaName,
'李雪莹'	FMgrName,
'张明'		FSalerName	,
'N.01.1111' FHospNumOk,	
'N.01.1111A' FHospNum,
'某*************医院'FHospNameOk,
'A类'	FHospLevelName,

	
	'01.1010'		FCustNum,
	'北京奕信康'		FCustNameShort,
	'北京******公司'		FCustNameOk	,
	'支架系统'		ProductTypeName,
		1	CSPrice,
	2		BARebate,
	3		TTBoot,
	4		CSTotalPrice1,
	5		Spromotion,
		6	STotalPrice1,	
		111	BTBGift	,
		222	BNHDAward	,
		333	Ssample	,
	444		ODActivity	,
		55	ActTotalPrice	,
	666		ActSaleQty	,
	777		ActTotalIncome	,
	888		Aprice	,
	999		Aamout	,
	10000		ATotalIncome
