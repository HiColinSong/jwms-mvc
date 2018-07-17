USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckAndCompleteSubCOnReceipt]    Script Date: 13-Jul-18 10:18:54 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO








-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_CheckAndCompleteSubCOnReceipt]
		@sSubCOnPORefNo		Varchar(20)
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
	
	DECLARE	@nReturnValue		Int
	DECLARE	@nUpdatedCHWCount	Int = 0
	DECLARE	@sErrorMessages		Varchar(300) = ''
	DECLARE	@sSAPSTORefNo		Varchar(20) = ''

	DECLARE @sOpenSubConPORefNo	varchar(20) 
	-- DECLARE @sSubConPORefNo	varchar(20) = '2100180606'
	DECLARE	@sSubConPOStatus	char(1)

	BEGIN TRY

		SELECT	@sSubConPOStatus = ISNULL(IsComplete,'')
		FROM	BX_SubConPOHeader 
		where SubconPORefNo = @sSubCOnPORefNo

		IF @sSubConPOStatus <> ''
			BEGIN
				SET @sErrorMessages = 'Error : This SubCon PO is already Processed/Completed ' ;
				THROW 51000, @sErrorMessages, 1;
			END

		SELECT	
			@nPlanCHWQty = sum(ISNULL(BESAQty,0)) ,
			@nPlanSGWQty = sum(ISNULL(BITQty,0)) ,
			@nPlanSGQQty = sum(ISNULL(QAQty,0)) 
		FROM	BX_SubConDetails 
		WHERE	SubConPoRefNo = @sSubCOnPORefNo
		GROUP by subconPORefNo

		Select	 -- * 
			@sOpenSubConPORefNo = D.SubConPoRefNo,
			--@nPlanSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 5 THEN 1 ELSE 0 END ), 
			--@nPlanCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 5 THEN 1 ELSE 0 END ), 

			@nRcptSGWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGW' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptSGQQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'SGQ' AND StatusID = 6 THEN 1 ELSE 0 END ), 
			@nRcptCHWQty = SUM(CASE WHEN ISNULL(S.ShiptoTarget,'') = 'CHW' AND StatusID = 6 THEN 1 ELSE 0 END )
		from [BX_SubConDetails]  D 
				Left Outer Join bx_subconPOHeader H on H.[SubconPORefNo] = d.[SubconPORefNo] 
				Left Outer Join BX_SubconShipments S on S.workorder = D.workOrder 
					 AND StatusID In (6)
		where D.SubConPoRefNo = @sSubCOnPORefNo
		Group by  D.SubConPoRefNo

		-- Check if any subcon Qty is assigned for BESA and No STO Assigned against Subcon PO
		IF @nPlanCHWQty > 0 
		BEGIN
			SELECT @sSAPSTORefNo = ISNULL(H.SAPSTORefNo ,'')
			FROM	BX_SubConDetails D 
					left Outer Join BX_SubConPOHeader H on H.SubconPORefNo = D.SubconPORefNo 
			where H.SubconPORefNo = @sSubCOnPORefNo


			IF @sSAPSTORefNo = ''
			BEGIN
				SET @sErrorMessages = 'Error : STO Number not Assigned Yet, Completion not Allowed' ;
				THROW 51000, @sErrorMessages, 1;
			END
		END

		IF @nPlanSGWQty+ @nPlanSGQQty <> @nRcptSGWQty+@nRcptSGQQty
		BEGIN
			SET @sErrorMessages = 'Error : Receiving for BIT & QA Samples still in Progress.... ' ;
			THROW 51000, @sErrorMessages, 1;
		END
		ELSE
		BEGIN
			-- Do Auto Receive for BESA Serial Nos 
				EXEC @nUpdatedCHWCount = BX_AutoRcptSubConSerialNos @sSubCOnPORefNo, 'CHW'   
		END

		Update BX_SubConPOHeader 
		set IsComplete = 'X'
		where SubconPORefNo = @sSubCOnPORefNo
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			THROW 51000, @sErrorMessages, 1;

	END CATCH

	-- If every Check is OK, return list of Serial Nos with relevant Documnet Ref.
	SELECT	S2.SubconPORefNo,ISNULL(H.SAPSTORefNo,'') as SAPSTORefNo, S2.WorkOrder,
		S1.SerialNo , W.batchno ,W.Itemcode,  S1.ShipToTarget,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN '2100' ELSE '3250' END as PlantCode ,
		CASE WHEN Left(S1.shiptoTarget,2) = 'SG' THEN S2.WorkOrder ELSE ISNULL(S2.WorkOrder,'') END as PostingDocument
	from	BX_SubconShipments S1	
			Left Outer Join StentsByFG F on F.stntserial = S1.SerialNo 
			Left Outer Join BX_SubConDetails S2 on S2.WorkOrder = s1.workorder 
			Left Outer Join BX_SubConPOHeader  H on  H.SubconPORefNo = S2.SubconPORefNo 
			Left Outer Join WorkOrders W on ltrim(Rtrim(W.Project)) = Ltrim(Rtrim(s1.workorder)) 
	where  S2.SubconPORefNo = @sSubCOnPORefNo


	-- Select @nReturnValue = CASE WHEN @nPlanSGWQty + @nPlanSGQQty = @nRcptSGWQty+@nRcptSGQQty THEN 0 ELSE -1 END   -- 0 Success, -1 : Error
END
