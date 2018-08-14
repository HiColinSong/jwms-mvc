select *  from BX_SubconShipments where subConPo='B20180041'
select * from BX_SubConPOHeader
select * from BX_SubConDetails where SubconPORefNo='B20180041'
select * from BX_QuarShptHeader
select * from BX_QuarShptPlan
select * from BX_QuarShpt_PrepackHUnits

update BX_SubconShipments set StatusID=5, qsNo=Null,HUNumber=NULL where subConPo='B20180041'
delete from BX_QuarShpt_PrepackHUnits
delete from BX_QuarShptPlan

commit

select  workorder,count (workorder) as count from BX_SubconShipments where subConPo='B20180041'  group by workorder order by workorder
select * from BX_SubConDetails where SubconPORefNo='B20180041' order by WorkOrder