USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetLotReleaseTable]    Script Date: 24-Sep-18 3:44:27 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_GetLotReleaseTable] 
(
		@sSubCOnPORefNo		Varchar(20) = NULL,
		@sFullScanCode		Varchar(60) = NULL
)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@sOpenSubConPORefNo	Varchar(20)=''
	DECLARE	@sErrorMessages	Varchar(300)=''

	IF (@sSubCOnPORefNo is NULL)
	   BEGIN
		SELECT @sSubCOnPORefNo = h.SubconPORefNo 
		FROM dbo.BX_SubconShipments s, bx_subconPOHeader h
		WHERE s.FullScanCode=@sFullScanCode and
		      ISNULL(h.IsComplete,'') = '' and  
			  h.SubconPORefNo=s.subConPo
		IF (@sSubCOnPORefNo is NULL OR @sSubCOnPORefNo='')
			BEGIN
				SET @sErrorMessages = 'Error : Subcon PO cannot be found!' ;
				--THROW 51000, @sErrorMessages, 1;
				RAISERROR (@sErrorMessages,16,1 ); 
			END
	   END

  SELECT 
			D.SubConPoRefNo,
			D.WorkOrder,
			w.batchno,
			w.itemCode as materialCode,
			count(case when S.ShipToTarget='SGW' then 1 else null end) AS totalBITQty,
			count(case when S.ShipToTarget='SGW' then 1 else null end) -
			ISNULL((select sum(qty) from BX_QuarShptPlan where workorder=D.WorkOrder and SubconPORefNo=@sSubconPORefNo),0)
			as bitPlanQty,  
			count(case when S.ShipToTarget='SGW' and StatusID=6 then 1 else null end) as scannedBITQty, 
			count(case when S.ShipToTarget='SGQ' and (StatusID=5 or StatusID=6) then 1 else null end) as qaPlanQty,
			count(case when S.ShipToTarget='SGQ' and StatusID=6 then 1 else null end) as scannedQaQty,
			ISNULL((select sum (qty) from dbo.BX_QuarShptPlan where workorder=d.WorkOrder),0) as quarShptPlanQty,
			ISNULL((SELECT count(serialNo) FROM  dbo.BX_SubconShipments WHERE workorder=d.WorkOrder and StatusID=7),0) AS scannedQuarQty,
			d.lotReleaseOn,	
			d.lotReleaseBy		
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
				Left Outer Join WorkOrders w on w.Project = d.WorkOrder 
				left outer join BX_SubconShipments S on S.workorder=D.WorkOrder
		where D.SubConPoRefNo = @sSubconPORefNo
		Group by  D.SubConPoRefNo,D.WorkOrder,w.batchno,w.itemCode,d.lotReleaseOn,d.lotReleaseBy
END

--   select
--   d.subconPORefNo,
--   ISNULL(p.qsNo,(SELECT qsNo FROM dbo.BX_QuarShptHeader WHERE SubconPORefNo='B20180043' and  prepackConfirmOn IS NULL)) AS qsNo,
--   d.workOrder AS workOrder,
--   ISNULL(p.qty,0) AS planQty,
--   w.batchNo AS batchNo,
--   w.itemCode AS materialCode,
--   h.planBy AS planBy,
--   h.planOn AS planOn,
--   h.prepackConfirmOn AS prepackConfirmOn,
--   h.linkedDONumber AS linkedDONumber,
--   count(case when S.ShipToTarget='SGW' then 1 else null end) AS totalBITQty,
--  -- dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) AS totalBITQty,
--   --dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',6,NULL,NULL) AS scannedBITQty,
--   count(case when S.ShipToTarget='SGW' and StatusID=6 then 1 else null end) as scannedBITQty,
--   ISNULL((SELECT count(serialNo) FROM  dbo.BX_SubconShipments WHERE qsNo=p.qsNo AND workorder=d.WorkOrder),0) AS scannedQuarQty,
--   --dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) - 
--   count(case when S.ShipToTarget='SGW' then 1 else null end) - 
--           ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=d.SubconPORefNo AND workorder=d.WorkOrder),0) AS availbleBITQty
--   FROM dbo.BX_SubConDetails d 
--       LEFT OUTER JOIN dbo.BX_QuarShptPlan p ON d.workorder=p.workorder
--       LEFT OUTER JOIN dbo.WorkOrders w ON d.WorkOrder=w.Project
--       LEFT OUTER JOIN dbo.BX_QuarShptHeader h ON p.qsNo=h.qsNo
-- 	  left outer join BX_SubconShipments S on S.workorder=D.WorkOrder
--   WHERE d.SubconPORefNo='B20180043' 
--   group BY D.SubConPoRefNo,D.WorkOrder,p.qsNo,p.qty,w.batchno,w.Itemcode,h.planBy,h.planOn,h.prepackConfirmOn,h.linkedDONumber
