USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetQuarShptPlan]    Script Date: 8/9/2018 8:17:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[BX_GetQuarShptPlan] 
(
    @SubconPORefNo varchar(20)
)
AS

SELECT 
    p.qsNo, 
    p.workorder,
    w.batchno,
    p.qty,
    dbo.BX_FnGetSerialCountByWorkOrder(p.workorder ,'SGW',0) as totalBITQty,
    dbo.BX_FnGetSerialCountByWorkOrder(p.workorder ,'SGW',5) as availableBITQty
FROM 
    dbo.BX_QuarShptPlan p,  
    dbo.BX_QuarShptHeader h,
    dbo. dbo.WorkOrders w
WHERE p.SubconPORefNo=@SubconPORefNo AND
      p.workorder=w.project AND 
      p.qsNo=h.qsNo AND
       h.prepackConfirmOn is not Null
GROUP BY p.qsNo

SELECT 
    p.qsNo, 
    p.SubconPORefNo, 
    p.workorder,
    w.batchno,
    p.qty,
    w.itemCode as mateiral,
    dbo.BX_FnGetSerialCountByWorkOrder(p.workorder ,'SGW',7,p.qsNo) as scannedQuarQty,
    h.planBy,
    h.planOn,
    h.prepackCoinfirmOn,
    h.linkedDONumber
FROM 
    dbo.BX_QuarShptPlan p,  
    dbo.BX_QuarShptHeader h,
    dbo. dbo.WorkOrders w
WHERE p.SubconPORefNo=@SubconPORefNo AND
      p.workorder=w.project AND 
      p.qsNo=h.qsNo
GROUP BY p.qsNo
      



