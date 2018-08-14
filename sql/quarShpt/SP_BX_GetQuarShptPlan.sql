USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetQuarShptPlan]    Script Date: 8/12/2018 1:11:02 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_GetQuarShptPlan] 
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
  d.subconPORefNo,
  ISNULL(p.qsNo,(SELECT qsNo FROM dbo.BX_QuarShptHeader WHERE SubconPORefNo=@sSubconPORefNo and  prepackConfirmOn IS NULL)) AS qsNo,
  d.workOrder AS workOrder,
  ISNULL(p.qty,0) AS planQty,
  w.batchNo AS batchNo,
  w.itemCode AS materialCode,
  h.planBy AS planBy,
  h.planOn AS planOn,
  h.prepackConfirmOn AS prepackConfirmOn,
  h.linkedDONumber AS linkedDONumber,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) AS totalBITQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',6,NULL,NULL) AS scannedBITQty,
  ISNULL((SELECT count(serialNo) FROM  dbo.BX_SubconShipments WHERE qsNo=p.qsNo AND workorder=d.WorkOrder),0) AS scannedQuarQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) - 
          ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=d.SubconPORefNo AND workorder=d.WorkOrder),0) AS availbleBITQty
  FROM dbo.BX_SubConDetails d 
      LEFT OUTER JOIN dbo.BX_QuarShptPlan p ON d.workorder=p.workorder
      LEFT OUTER JOIN dbo.WorkOrders w ON d.WorkOrder=w.Project
      LEFT OUTER JOIN dbo.BX_QuarShptHeader h ON p.qsNo=h.qsNo
  WHERE d.SubconPORefNo=@sSubconPORefNo 
  ORDER BY qsNo,WorkOrder
END
