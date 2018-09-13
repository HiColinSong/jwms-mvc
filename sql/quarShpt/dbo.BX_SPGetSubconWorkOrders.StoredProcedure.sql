USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SPGetSubconWorkOrders]    Script Date: 9/9/2018 9:39:23 PM ******/
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

		--SELECT	
		--	@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
		--	@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
		--	@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		--FROM	BX_SubConDetails 
		--WHERE	SubConPoRefNo = @sSubCOnPORefNo
		--GROUP by subconPORefNo

		Select	 -- * 
			-- @sOpenSubConPORefNo = 
			w.batchno,
			D.SubConPoRefNo,
			D.WorkOrder,
			FullScanCode = (select top (1) FullScanCode from dbo.BX_SubconShipments where workorder=D.WorkOrder),
			-- @nPlanCHWQty = 
			--sum(ISNULL(D.BESAQty,0))  as nPlanCHWQty,
			-- @nPlanSGWQty =  
			--sum(ISNULL(D.BITQty,0)) as nPlanSGWQty ,
			-- @nPlanSGQQty = 
			--sum(ISNULL(D.QAQty,0)) as nPlanSGQQty ,

			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',5,6,NULL) as nPlanCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',0,NULL,NULL)-
			ISNULL((select sum(qty) from BX_QuarShptPlan where workorder=D.WorkOrder and SubconPORefNo=@sSubCOnPORefNo),0)
			as nPlanSGWQty, --BIT Receipt quantity is total BIT quantity minus all quarantine planned quantity
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',5,6,NULL) as nPlanSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',5,NULL,NULL) as nPendingCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',5,NULL,NULL) as nPendingSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',5,NULL,NULL) as nPendingSGQQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'CHW',6,NULL,NULL) as nRcptCHWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGW',6,NULL,NULL) as nRcptSGWQty,
			dbo.BX_FnGetSerialCountByWorkOrder(D.WorkOrder ,'SGQ',6,NULL,NULL) as nRcptSGQQty
			
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
				Left Outer Join WorkOrders w on w.Project = d.WorkOrder 
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo,D.WorkOrder,w.batchno

END
