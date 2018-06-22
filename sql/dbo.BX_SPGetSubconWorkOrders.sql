USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubconWorkOrders]    Script Date: 17-Jun-18 2:44:19 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO








-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_SPGetSubconWorkOrders]
		@sSubCOnPORefNo		Varchar(20) = NULL,
		@sFullScanCode		Varchar(60) = NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;

	DECLARE	@nPlanSGWQty	Int
	DECLARE	@nPlanSGQQty	Int
	DECLARE	@nPlanCHWQty	Int

	DECLARE	@nRcptSGWQty	Int = 0
	DECLARE	@nRcptSGQQty	Int = 0
	DECLARE	@nRcptCHWQty	Int = 0
	DECLARE	@sOpenSubConPORefNo	Varchar(20)=''
	DECLARE	@sErrorMessages	Varchar(300)=''

	IF (@sSubCOnPORefNo is NULL)
	   BEGIN
		SELECT @sSubCOnPORefNo = subConPo 
		FROM dbo.BX_SubconShipments
		WHERE FullScanCode=@sFullScanCode
		IF (@sSubCOnPORefNo is NULL)
			BEGIN
				SET @sErrorMessages = 'Error : Subcon PO cannot be found!' ;
				THROW 51000, @sErrorMessages, 1;
			END
	   END

	

		--SELECT	
		--	@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
		--	@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
		--	@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		--FROM	BX_SubConDetails 
		--WHERE	SubConPoRefNo = @sSubCOnPORefNo
		--GROUP by subconPORefNo

		Select	 -- * 
			-- @sOpenSubConPORefNo = 
			D.SubConPoRefNo,
			D.WorkOrder,
			-- @nPlanCHWQty = 
			--sum(ISNULL(D.BESAQty,0))  as nPlanCHWQty,
			-- @nPlanSGWQty =  
			--sum(ISNULL(D.BITQty,0)) as nPlanSGWQty ,
			-- @nPlanSGQQty = 
			--sum(ISNULL(D.QAQty,0)) as nPlanSGQQty ,

			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',NULL) as nPlanCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',NULL) as nPlanSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',NULL) as nPlanSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',5) as nPendingCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',5) as nPendingSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',5) as nPendingSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',6) as nRcptCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',6) as nRcptSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',6) as nRcptSGQQty
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo,D.WorkOrder 

END
