USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetLotReleaseTable]    Script Date: 8/12/2018 1:11:02 AM ******/
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
  d.subconPORefNo,
  d.workOrder AS workOrder,
  w.batchNo AS batchNo,
  w.itemCode AS materialCode,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) AS totalBITQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',0,NULL,NULL) - 
          ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=d.SubconPORefNo AND workorder=d.WorkOrder),0) AS bitPlanQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGW',6,NULL,NULL) AS scannedBITQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGQ',0,NULL,NULL) AS qaPlanQty,
  dbo.BX_FnGetSerialCountByWorkOrder(d.WorkOrder ,'SGQ',6,NULL,NULL) AS scannedQaQty,
  ISNULL(p.qty,0) AS quarShptPlanQty,
  ISNULL((SELECT count(serialNo) FROM  dbo.BX_SubconShipments WHERE qsNo=p.qsNo AND workorder=d.WorkOrder),0) AS scannedQuarQty,
  d.lotReleaseOn,
  d.lotReleaseBy
  FROM dbo.BX_SubConDetails d 
      LEFT OUTER JOIN dbo.BX_QuarShptPlan p ON d.workorder=p.workorder
      LEFT OUTER JOIN dbo.WorkOrders w ON d.WorkOrder=w.Project
  WHERE d.SubconPORefNo=@sSubconPORefNo 
  ORDER BY WorkOrder
END
