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

----------------------------------------------------------------------------------------------------------------
--reset the  subcon: B20180041
delete from BX_QuarShptHeader where SubconPORefNo='B20180041'
delete from BX_QuarShptPlan where SubconPORefNo='B20180041'
delete from BX_QuarShpt_PrepackHUnits where qsNo like 'B20180041%'
update BX_SubConPOHeader set isComplete=NULL where subconPORefNo='B20180041'
update BX_SubConDetails set lotReleaseOn=NULL,lotReleaseBy=NULL where SubconPORefNo='B20180041'
update BX_SubconShipments set StatusID=5, qsNo=Null,HUNumber=NULL,ReceivedOn=NULL,ReceivedBy=NULL where subConPo='B20180041'


----------------------------------------------------------------------------------------------------------------
--auto scan for prepack 
01088888930162211720071110W18070116|21180619851
01088888930162211720071110W18070116|21180619852
01088888930162211720071110W18070116|21180619853
01088888930162211720071110W18070116|21180619854
01088888930162211720071110W18070116|21180619855
01088888930162211720071110W18070116|21180619856
01088888930162211720071110W18070116|21180619857
01088888930162211720071110W18070116|21180619858
01088888930162211720071110W18070116|21180619859
01088888930162211720071110W18070116|21180619860
01088888930162211720071110W18070116|21180619861

update top (10) BX_SubconShipments set StatusID=7,qsNo='B2018004101',HUNumber='118081600016' 
,ReceivedOn=Convert(datetime,'2018-08-16 12:12:12'),ReceivedBy='yd.zhu'
where workorder='210000078391' and subConPo='B20180041' and StatusID=5 and ShipToTarget='SGW'

update top (20) BX_SubconShipments set StatusID=7,qsNo='B2018004101',HUNumber='118081600017'
,ReceivedOn=Convert(datetime,'2018-08-16 12:12:12'),ReceivedBy='yd.zhu'
where workorder='210000084488' and subConPo='B20180041' and StatusID=5 and ShipToTarget='SGW'

update top (25) BX_SubconShipments set StatusID=7,qsNo='B2018004101',HUNumber='118081600018' 
,ReceivedOn=Convert(datetime,'2018-08-16 12:12:12'),ReceivedBy='yd.zhu'
where workorder='210000088885' and subConPo='B20180041' and StatusID=5 and ShipToTarget='SGW'

update top (15) BX_SubconShipments set StatusID=7,qsNo='B2018004101',HUNumber='118081600019' 
,ReceivedOn=Convert(datetime,'2018-08-16 12:12:12'),ReceivedBy='yd.zhu'
where workorder='210000089213' and subConPo='B20180041' and StatusID=5 and ShipToTarget='SGW'



-- auto san all the BIT receipt
update BX_SubconShipments 
set StatusID=6,ReceivedOn=Convert(datetime,'2018-08-16 12:12:12'),ReceivedBy='yd.zhu'
where subConPo='B20180041' and (ShipToTarget = 'SGW' or ShipToTarget = 'SGQ') and StatusID=5