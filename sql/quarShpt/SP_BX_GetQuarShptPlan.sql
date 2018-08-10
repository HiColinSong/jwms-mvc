USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetQuarShptPlan]    Script Date: 8/9/2018 8:17:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_GetQuarShptPlan] 
(
    @sSubconPORefNo varchar(20)
)
AS


SELECT 
 d.subconPORefNo,
 ISNULL(p.qsNo,(SELECT qsNo FROM dbo.BX_QuarShptHeader WHERE prepackConfirmOn IS NULL)) AS qsNo,
 d.workOrder AS WorkOrder,
 ISNULL(p.qty,0) AS planQty,
 w.batchNo AS BatchNo,
 w.itemCode AS mateiral,
 h.planBy AS PlanBy,
 h.planOn AS PlanOn,
 h.prepackConfirmOn AS prepackConfirmOn,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL)
    ELSE NULL
  END AS TotalBITQty,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN ISNULL((SELECT count(serialNo) FROM  dbo.BX_SubconShipments WHERE qsNo=p.qsNo AND workorder=d.WorkOrder),0)
    ELSE NULL
  END AS scannedQuarQty,
   CASE 
    WHEN prepackConfirmOn IS NULL 
    THEN dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) - 
         ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=d.SubconPORefNo AND workorder=d.WorkOrder),0)
    ELSE NULL
  END AS availbleBITQty
FROM dbo.BX_SubConDetails d 
     LEFT OUTER JOIN dbo.BX_QuarShptPlan p ON d.workorder=p.workorder
     LEFT OUTER JOIN dbo.WorkOrders w ON d.WorkOrder=w.Project
     LEFT OUTER JOIN dbo.BX_QuarShptHeader h ON p.qsNo=h.qsNo
WHERE d.SubconPORefNo=@sSubconPORefNo 
ORDER BY qsNo,WorkOrder


