USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SubconBitAndQAScanByBatchNo]    Script Date: 9/9/2018 1:44:04 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_SubconBitAndQAScanByBatchNo] 
		@sFullScanCode		Varchar(100),
		@sEANCode			Varchar(20),
		@sBatchNo			Varchar(20),
		@sSubConPo			Varchar(12),
		@sReturnToTarget	Varchar(3),
		@sQACategory		Varchar(20),
		@sLogonUser			Varchar(30),
		@sScanType			char(1)='1', --1 scan, --2 undo scan, --3:take from other (Store/QA)
		@nReceivedQty		Int
AS
BEGIN
	SET NOCOUNT ON;
	BEGIN TRY
		DECLARE 	@nUpdatedCount			Int = 0,
					@nAvailableQty			Int = 0,
					@nQuraShptReservedQty	Int = 0, --how many unscanned quaratine shipment qty that should be reserved from subcon scan/unscan/takeFromQA
					@sScanFromTarget		Varchar(3),
					@sErrorMessages			nVarchar(1000)
		SET @nQuraShptReservedQty = (SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=@sSubConPo AND batchNo=@sBatchNo)-
									(SELECT count(serialNo) 
										FROM BX_SubconShipments s 
											 LEFT OUTER JOIN WorkOrders w on w.Project=s.workorder
									 WHERE s.subConPo=@sSubConPo AND w.batchNo=@sBatchNo AND s.StatusID=7)
		IF (@sScanType='1')
			BEGIN
				SET @sScanFromTarget = @sReturnToTarget
				SET @nAvailableQty = ( --availabltyQty is unscanned qty minus qurantine shipment planned Qty (for SGW)
							SELECT Count(SerialNo)
							FROM	BX_SubconShipments S
										Left Outer Join WorkOrders W on W.Project = S.workorder 
										-- Left Outer Join SAP_EANCodes E on E.EANCode = @sEANCode
							WHERE	W.batchno = @sBatchNo
										-- AND E.MaterialCode = W.Itemcode
										AND	S.ShipToTarget = @sReturnToTarget
										AND S.StatusID = 5
					) - (
						CASE WHEN @sScanFromTarget = 'SGW' 
							THEN  @nQuraShptReservedQty
							ELSE 0 
						END
					)
					--select @nAvailableQty
				IF @nReceivedQty <= ISNULL(@nAvailableQty,0)
					BEGIN
							Update	S 
							SET		S.StatusID = 6 ,   -- Received from SubCOn
									S.ReceivedON = Getdate(),
									S.ShipToTarget = @sReturnToTarget,
									S.QASampleCategory = ISNULL(@sQACategory,'') ,
									S.ReceivedBy = @sLogonUser
							FROM	BX_SubconShipments S
							WHERE	S.SerialNo IN (
										SELECT TOP (@nReceivedQty)  S1.SerialNo 
											FROM	BX_SubconShipments S1
											Left Outer Join WorkOrders W on W.Project = S1.workorder 
											-- Left Outer Join SAP_EANCodes E on E.EANCode = SUBSTRING(@sFullScanCode,3,14)
								WHERE	W.batchno = @sBatchNo
											-- AND E.MaterialCode = W.Itemcode
											AND	S1.ShipToTarget = @sReturnToTarget
											AND S1.StatusID = 5
								Order by S1.SerialNo
								)
								SET @nUpdatedCount = @@ROWCOUNT		
					END
				ELSE
					BEGIN
					--select 'error' as error
						SET @nUpdatedCount = 0
						SET @sErrorMessages = 'Error : Not Enough Qty available ('+CONVERT(varchar(5),@nAvailableQty)+') for assignments' ;
						RAISERROR (@sErrorMessages,16,1); 
					END	
			END
		ELSE IF (@sScanType='2') --undo scan
			BEGIN
				Update	S 
					SET		S.StatusID = 5 ,   -- Received from SubCOn
							S.ReceivedON = NULL,
							S.QASampleCategory = '',
							S.ReceivedBy = NULL
					FROM	BX_SubconShipments S,WorkOrders w
					WHERE	w.batchNo=@sBatchNo AND
							w.Project = S.workorder AND
							--S.QASampleCategory = ISNULL(@sQACategory,'') AND 
							S.ShipToTarget = @sReturnToTarget AND
							S.StatusID = 6  --exclude quantine shipment items
					SET @nUpdatedCount = @@ROWCOUNT
					IF  @@ROWCOUNT=0 
					BEGIN
						SET @sErrorMessages = N'Error : No Item found ' ;
						THROW 51000, @sErrorMessages, 1;
					END					
					
			END
		ELSE IF (@sScanType='3')
			BEGIN
				SET @sScanFromTarget = CASE WHEN @sReturnToTarget = 'SGW' THEN 'SGQ' ELSE 'SGW' END
				SET @nAvailableQty = ( --availabltyQty is unscanned qty minus qurantine shipment planned Qty (for SGW)
							SELECT Count(SerialNo)
							FROM	BX_SubconShipments S
										Left Outer Join WorkOrders W on W.Project = S.workorder 
										-- Left Outer Join SAP_EANCodes E on E.EANCode = @sEANCode
							WHERE	W.batchno = @sBatchNo
										-- AND E.MaterialCode = W.Itemcode
										AND	S.ShipToTarget = @sScanFromTarget
										AND S.StatusID = 5
					) - (
						CASE WHEN @sScanFromTarget = 'SGW' 
							THEN  @nQuraShptReservedQty
							ELSE 0 
						END
					)
					--select @nAvailableQty
				IF @nReceivedQty <= ISNULL(@nAvailableQty,0)
					BEGIN
					Update	TOP (@nReceivedQty) S 
					SET		S.StatusID = 6 ,   -- Received from SubCOn
							S.ReceivedON = Getdate(),
							S.ShipToTarget = @sReturnToTarget,
							S.QASampleCategory = ISNULL(@sQACategory,'') ,
							S.ReceivedBy = @sLogonUser
					FROM	BX_SubconShipments S,WorkOrders w
					WHERE	w.batchNo=@sBatchNo AND
							w.Project = S.workorder AND
							--S.QASampleCategory = ISNULL(@sQACategory,'') AND 
							S.ShipToTarget = @sScanFromTarget AND
							S.StatusID = 5  --only for unscanned items
					END
				ELSE 
					BEGIN
					--select 'error' as error
						SET @nUpdatedCount = 0
						SET @sErrorMessages = 'Error : Not Enough Qty available ('+CONVERT(varchar(5),@nAvailableQty)+') for assignments' ;
						RAISERROR (@sErrorMessages,16,1); 
					END	

					
			END


	END TRY
	BEGIN CATCH
		DECLARE @ErrorMessage NVARCHAR(4000);
			DECLARE @ErrorSeverity INT;
			DECLARE @ErrorState INT;

			SELECT 
				@ErrorMessage = ERROR_MESSAGE(),
				@ErrorSeverity = ERROR_SEVERITY(),
				@ErrorState = ERROR_STATE();

			-- Use RAISERROR inside the CATCH block to return error
			-- information about the original error that caused
			-- execution to jump to the CATCH block.
			RAISERROR (@ErrorMessage, -- Message text.
					@ErrorSeverity, -- Severity.
					@ErrorState -- State.
					);
	END CATCH
END
