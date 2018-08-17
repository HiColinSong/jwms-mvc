USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckAndCompleteWorkordersReceipt]    Script Date: 13-Jul-18 10:18:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO



-- =============================================
-- Author:		<Ya Dong Zhu>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_CheckAndCompleteWorkordersReceipt]
		@sSubCOnPORefNo		Varchar(20),
		@workOrderList 		varchar(8000),
		@confirmOn 			varchar(20),
		@confirmBy 			varchar(20)
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@nPlanSGWQty	Int
	DECLARE	@nPlanSGQQty	Int
	DECLARE	@nPlanCHWQty	Int
	DECLARE	@nPlanQRSQty	Int -- quarantine shipment 
	DECLARE	@nPendingScanQty	Int -- quarantine shipment 

	DECLARE	@nRcptSGWQty	Int = 0
	DECLARE	@nRcptSGQQty	Int = 0
	DECLARE	@nRcptCHWQty	Int = 0
	DECLARE	@nRcptQRSQty	Int = 0
	
	-- DECLARE	@nReturnValue		Int
	-- DECLARE	@nUpdatedCHWCount	Int = 0
	DECLARE	@sErrorMessages		NVARCHAR(4000) = ''
	-- DECLARE	@sSAPSTORefNo		Varchar(20) = ''

	-- DECLARE @sOpenSubConPORefNo	varchar(20) 
	-- DECLARE @sSubConPORefNo	varchar(20) = '2100180606'
	DECLARE	@sSubConPOStatus	char(1)
	-- DECLARE	@sWorkOrderStatus	char(1)

	DECLARE @temp_item TABLE
			(
				SubconPORefNo varchar(20),
				WorkOrder varchar(20),
				SerialNo varchar(10) NULL,
				BatchNo varchar(20)  NULL,
				MaterialCode varchar(18)  NULL,
				ShipToTarget varchar(3)  NULL,
				PlantCode VARCHAR(4)  NULL,
				PostingDocument VARCHAR(20)  NULL,
				ErrorMsg NVARCHAR(4000) NULL
			);

	BEGIN TRY
		--check if the subcon PO is completed
		SELECT	@sSubConPOStatus = ISNULL(IsComplete,'')
		FROM	BX_SubConPOHeader 
		where SubconPORefNo = @sSubCOnPORefNo

		IF @sSubConPOStatus <> ''
			BEGIN
				SET @sErrorMessages = 'Error : This SubCon PO is already Processed/Completed ' ;
				THROW 51000, @sErrorMessages, 1;
			END

		--process each individual workOrder
		DECLARE 
            @nth int,
            @workorder varchar (20)

        SET @nth=1
            while 1=1
            BEGIN
				SET @workorder = (select dbo.nth_occur(@workorderList,',',@nth));
                IF LEN(ISNULL(@workorder, '')) = 0 break;
				SELECT	
					@nPlanCHWQty = ISNULL(BESAQty,0),
					@nPlanSGWQty = ISNULL(BITQty,0),
					@nPlanSGQQty = ISNULL(QAQty,0)
					FROM	BX_SubConDetails 
					WHERE	SubConPoRefNo = @sSubCOnPORefNo AND
							WorkOrder=@workorder

				--check if there is any unconfirmed quarantine shipment workorder:
				IF EXISTS (
					select qsNo from BX_QuarShptHeader where prepackConfirmOn is NULL and 
					qsNo in (select qsNo from BX_QuarShptPlan where workorder=@workorder))
				BEGIN
					SET @sErrorMessages = 'Error : Quarantine Shipment for workOrder ('+@workorder+') has not been confirmed' ;
						THROW 51000, @sErrorMessages, 1;
				END

				SELECT 
					-- @nRcptSGWQty = dbo.BX_FnGetSerialCountByWorkOrder(@workorder ,'SGW',6,NULL,NULL),
					-- @nRcptSGQQty = dbo.BX_FnGetSerialCountByWorkOrder(@workorder ,'SGQ',6,NULL,NULL),
					-- @nRcptCHWQty = dbo.BX_FnGetSerialCountByWorkOrder(@workorder ,'CHW',6,NULL,NULL),
					-- @nRcptQRSQty = dbo.BX_FnGetSerialCountByWorkOrder(@workorder ,'SGW',7,NULL,NULL),
					@nPendingScanQty = dbo.BX_FnGetSerialCountByWorkOrder(@workorder ,'SGW',5,NULL,NULL)

					-- IF @nPlanSGWQty+ @nPlanSGQQty <> @nRcptSGWQty+@nRcptSGQQty+@nRcptQRSQty
					-- 	BEGIN
					-- 		SET @sErrorMessages = 'Warning : Receiving for BIT & QA Samples in workOrder ('+@workorder+') does not match plan quantity' ;
					-- 		--THROW 51000, @sErrorMessages, 1;
					-- 		INSERT INTO @temp_item (SubconPORefNo,WorkOrder,ErrorMsg)
					-- 		VALUES (@sSubCOnPORefNo,@workorder,@sErrorMessages)
					-- 	END
					IF @nPendingScanQty>0
						BEGIN
							SET @sErrorMessages = 'Error : Receiving for BIT & QA Samples in workOrder ('+@workorder+') has not completed';
							THROW 51000, @sErrorMessages, 1;
						END
					ELSE
						BEGIN
							 UPDATE dbo.BX_SubconShipments 
							 SET StatusID = 6
							 WHERE subConPo=@sSubCOnPORefNo AND workorder=@workorder AND ShipToTarget ='CHW'
							 --(@@RowCount)
							 --update workorder logRelease status
							 UPDATE dbo.BX_SubConDetails 
							 SET lotReleaseOn=Convert(datetime,@confirmOn),
							 	 lotReleaseBy=@confirmBy
							 WHERE SubconPORefNo=@sSubCOnPORefNo AND WorkOrder=@workorder

							 --check if all the workorders are released, update BX_SubConPOHeader
							 IF NOT EXISTS (
								 	select workOrder from dbo.BX_SubConDetails 
									WHERE SubconPORefNo=@sSubCOnPORefNo AND 
										   lotReleaseOn IS NULL
								)
								BEGIN
									Update BX_SubConPOHeader 
									set IsComplete = 'X'
									where SubconPORefNo = @sSubCOnPORefNo
								END
							--insert return result into temp table
								INSERT INTO @temp_item 
								SELECT 
									@sSubCOnPORefNo,
									s.workOrder,
									s.SerialNo,
									w.batchno,
									w.Itemcode,
									s.ShipToTarget,
									CASE WHEN Left(s.ShipToTarget,2) = 'SG' THEN '2100' ELSE '3250' END as PlantCode,
									CASE WHEN Left(s.ShipToTarget,2) = 'SG' THEN s.workOrder ELSE ISNULL(s.workOrder,'') END as PostingDocument,
									''
								FROM BX_SubconShipments s	
									Left Outer Join WorkOrders w on ltrim(Rtrim(w.Project)) = Ltrim(Rtrim(s.workorder)) 
								WHERE s.subConPo = @sSubCOnPORefNo AND s.workOrder=@workorder AND s.qsNo IS NULL
							END					
				SET @nth=@nth+1
        		continue;
			END --end of While Loop
	END TRY
	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			THROW 51000, @sErrorMessages, 1;
	END CATCH

	-- If every Check is OK, return list of Serial Nos with relevant Documnet Ref.
	SELECT * FROM @temp_item
END
