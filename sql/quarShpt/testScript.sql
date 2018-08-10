 --did it by checking SET IMPLICIT_TRANSACTIONS check-box from Options. To navigate to Options Select Tools>Options>Query Execution>SQL Server>ANSI in your Microsoft SQL Server Management Studio.
EXECUTE [dbo].[BX_InserOrUpdateQuarShptPlan] 
	@qsNo ='B2018004101',
	@planOn ='2018-08-10:13:33:00',
	@planBy ='yd.zhu',
    @SubconPORefNo ='B20180041',
    @workorderList ='210000066596,210000078391,210000081717',
    @batchNoList ='W18070115,W18070116,W18070117',
    @qtyList='100,150,200'

EXECUTE [dbo].[BX_InserOrUpdateQuarShptPlan] 
	@qsNo ='B2018004102',
	@planOn ='2018-08-10 19:33:00',
	@planBy ='yd.zhu',
    @SubconPORefNo ='B20180041',
    @workorderList ='210000066596,210000078391,210000081717',
    @batchNoList ='W18070115,W18070116,W18070117',
    @qtyList='92,61,40'


select * from BX_SubconShipments where subConPo='B20180041' and workorder='210000066596' and ShipToTarget='SGW'
update top (100) BX_SubconShipments set StatusID='7',qsNO='B2018004101'
where subConPo='B20180041' and workorder='210000066596' and ShipToTarget='SGW'
commit 

EXECUTE [dbo].[BX_InserOrUpdateQuarShptPlan] 
	@qsNo ='B2018004102',
	@planOn ='2018-08-10 19:33:00',
	@planBy ='yd.zhu',
    @SubconPORefNo ='B20180041',
    @workorderList ='210000066596,210000078391,210000081717',
    @batchNoList ='W18070115,W18070116,W18070117',
    @qtyList='84,61,42'

select 
 d.subconPORefNo,
 ISNULL(p.qsNo,(select qsNo from dbo.BX_QuarShptHeader  where prepackConfirmOn IS NULL)) as qsNo,
 d.workOrder as WorkOrder,
 ISNULL(p.qty,0) as planQty,
 w.batchNo as BatchNo,
 w.itemCode as mateiral,
 h.planBy as PlanBy,
 h.planOn as PlanOn,
 h.prepackConfirmOn as prepackConfirmOn,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL)
    ELSE NULL
  END AS TotalBITQty,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN ISNULL((select count(serialNo) from  dbo.BX_SubconShipments where qsNo=p.qsNo and workorder=d.WorkOrder),0)
    ELSE NULL
  END AS scannedQuarQty,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) - 
         ISNULL((select sum(qty) from BX_QuarShptPlan where SubconPORefNo=d.SubconPORefNo and workorder=d.WorkOrder),0)
    ELSE NULL
  END AS availbleBITQty
from dbo.BX_SubConDetails d 
     left outer JOIN dbo.BX_QuarShptPlan p on d.workorder=p.workorder
     left outer JOIN dbo.WorkOrders w on d.WorkOrder=w.Project
     left outer JOIN dbo.BX_QuarShptHeader h on p.qsNo=h.qsNo
where d.SubconPORefNo='B20180041' 
order by qsNo,WorkOrder