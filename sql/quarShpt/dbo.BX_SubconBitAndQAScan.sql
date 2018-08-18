USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_SubconBitAndQAScan]    Script Date: 8/16/2018 10:28:16 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ya Dong Zhu>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_SubconBitAndQAScan]
		@sFullScanCode			Varchar(60),
		@sReturnToTarget		Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sLogonUser				Varchar(20),
		@sQACategory			Varchar(12) = NULL,
		@sReturnStatusCode  	Char(1) = '6',    -- X to overwrite existing values with new scanned values
		@sOverWritePreviousScan	Varchar(1) = ''    -- X to overwrite existing values with new scanned values
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sSerialNo			Varchar(10)
	DECLARE	@sWorkOrder			Varchar(20)
	DECLARE	@sSubConPo			Varchar(12)
	DECLARE	@sShipToTarget		Varchar(12)
	DECLARE	@sStatusCode		Varchar(12)
	DECLARE @sCurrentQACategory	Varchar(12)


	DECLARE	@sErrorMessages	Varchar(300)
	DECLARE	@nBitPlanQty	Int
	DECLARE	@nBitScanQty	Int

	SET		@sErrorMessages = ''
	BEGIN TRY

		Select	@sSerialNo = s.SerialNo,
				@sWorkOrder = s.WorkOrder,
				@sSubConPO = s.SubConPO,
				@sShipToTarget = s.ShipToTarget ,
				@sCurrentQACategory = s.QAsampleCategory ,
				@sStatusCode = s.StatusID 
		From	BX_SubConShipments s
				left outer join  BX_SubConDetails d on s.workorder=d.WorkOrder
		where	FullScanCode = @sFullScanCode and d.lotReleaseOn IS NULL
				-- AND StatusID = 5

		IF IsNULL(@sSerialNo,'') = ''
			BEGIN
				SET @sErrorMessages = 'Error : Serial No does not exist or the workorder is released' ;
				 RAISERROR (@sErrorMessages,16,1);
			END
		IF @sOverWritePreviousScan = 'X'
			BEGIN
				Update Bx_SubConShipments 
					SET StatusID = isNull(@sReturnStatusCode,6) ,   -- use 6 unless there is a passed-in statusCode
						ReceivedON = Getdate(),
						ShipToTarget = @sReturnToTarget,
						QASampleCategory = ISNULL(@sQACategory,'') ,
						ReceivedBy = @sLogonUser
				WHERE	FullScanCode = @sFullScanCode 
			END
		ELSE IF (@sReturnToTarget='SGW' AND @sShipToTarget='SGW' AND @sStatusCode=5) --Scan a BIT item
			BEGIN
				--check if plan qty is exceeded
				SET @nBitPlanQty = dbo.BX_FnGetSerialCountByWorkOrder(@sWorkOrder ,'SGW',0,NULL,NULL) - 
					ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=@sSubConPo AND workorder=@sWorkOrder),0)
				SET  @nBitScanQty = dbo.BX_FnGetSerialCountByWorkOrder(@sWorkOrder ,'SGW',6,NULL,NULL)
					IF @nBitScanQty>=@nBitPlanQty
						BEGIN
							SET @sErrorMessages = 'Error:Exceed the planned quantity!' ;
							 RAISERROR (@sErrorMessages,16,1);
						END
					ELSE 
						BEGIN
							Update Bx_SubConShipments 
								SET StatusID = 6 ,   -- Received from SubCOn
									ReceivedON = Getdate(),
									ShipToTarget = @sReturnToTarget,
									QASampleCategory = ISNULL(@sQACategory,'') ,
									ReceivedBy = @sLogonUser
							WHERE	FullScanCode = @sFullScanCode 
						END
			END
		ELSE IF (@sReturnToTarget='SGW' AND @sShipToTarget='SGW' AND @sStatusCode=6) --Scan a BIT item that is already scanned
			BEGIN
				SET @sErrorMessages = 'Warning :The item is already scanned, Are you sure to unscan it?' ;
				 RAISERROR (@sErrorMessages,14,1); --code 14 to represent unscan
			END
		ELSE IF (@sReturnToTarget='SGW' AND @sShipToTarget='SGW' AND @sStatusCode=7) --Scan a quarantine shipment item 
			BEGIN
				SET @sErrorMessages = 'Error :Item is already scanned for Quarantine Shipment' ;
				 RAISERROR (@sErrorMessages,16,1);
			END
		ELSE IF (@sReturnToTarget='SGW' AND @sShipToTarget='SGQ' AND @sStatusCode=5) --Scan a reserved QA Sample 
			BEGIN
				SET @sErrorMessages = 'Warning :Item is assigned to QA Sample, Are you sure move to BIT Warehouse?';
				RAISERROR (@sErrorMessages,15,1); --error code:5000, it is a wanning
			END
		ELSE IF (@sReturnToTarget='SGW' AND @sShipToTarget='SGQ' AND @sStatusCode=6) --Scan a QA Sample 
			BEGIN
				SET @sErrorMessages = 'Warning :Item is already scanned for QA Sample in category of ' +
					(select QASampleDesc from BX_QASampleCategory where QASampleID=@sCurrentQACategory)+
					', Are you sure move to BIT Store?';
				RAISERROR (@sErrorMessages,15,1); --error code:5000, it is a wanning
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGQ' AND @sStatusCode=5) --Scan a QA Sample 
			BEGIN
				Update Bx_SubConShipments 
					SET StatusID = 6 ,   -- Received from SubCOn
						ReceivedON = Getdate(),
						ShipToTarget = @sReturnToTarget,
						QASampleCategory = ISNULL(@sQACategory,'') ,
						ReceivedBy = @sLogonUser
				WHERE	FullScanCode = @sFullScanCode 
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGQ' AND @sStatusCode=6 AND @sQACategory=@sCurrentQACategory) --Scan a QA Sample with same category 
			BEGIN
				SET @sErrorMessages = 'Error :Item is already scanned' ;
				 RAISERROR (@sErrorMessages,16,1);
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGQ' AND @sStatusCode=6 AND @sQACategory<>@sCurrentQACategory) --Scan a QA Sample with same category 
			BEGIN
				SET @sErrorMessages = 'Warning :Item is already scanned for QA Sample in category of ' +
					(select QASampleDesc from BX_QASampleCategory where QASampleID=@sCurrentQACategory)+
					', Are you sure move to QA Sample in category of '+(select QASampleDesc from BX_QASampleCategory where QASampleID=@sQACategory)+'?'; 
				RAISERROR (@sErrorMessages,15,1);
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGW' AND @sStatusCode=5) --Scan a BIT ITem
			BEGIN
				--check if there are enough quantity reserved for quarantine shipment
				SET @nBitPlanQty = dbo.BX_FnGetSerialCountByWorkOrder(@sWorkOrder ,'SGW',0,NULL,NULL) - 
					ISNULL((SELECT sum(qty) FROM BX_QuarShptPlan WHERE SubconPORefNo=@sSubConPo AND workorder=@sWorkOrder),0)
				SET  @nBitScanQty = dbo.BX_FnGetSerialCountByWorkOrder(@sWorkOrder ,'SGW',6,NULL,NULL)
				IF @nBitScanQty>=@nBitPlanQty --if BIT is fully scanned, means all the unscanned items should go to Quaratine shipment
					BEGIN
						SET @sErrorMessages = 'Error:The item is reserved for Quarantine shipment!' ;
						 RAISERROR (@sErrorMessages,16,1);
					END
				ELSE 
					Update Bx_SubConShipments 
						SET StatusID = 6 ,   -- Received from SubCOn
							ReceivedON = Getdate(),
							ShipToTarget = @sReturnToTarget,
							QASampleCategory = ISNULL(@sQACategory,'') ,
							ReceivedBy = @sLogonUser
					WHERE	FullScanCode = @sFullScanCode 
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGW' AND @sStatusCode=6) --Scan a BIT Item 
			BEGIN
				SET @sErrorMessages = 'Warning :Item is already scanned for BIT Store, Are you sure move to QA Sample in category of '+
									 (select QASampleDesc from BX_QASampleCategory where QASampleID=@sQACategory)+'?'; 
				RAISERROR (@sErrorMessages,15,1);
			END
		ELSE IF (@sReturnToTarget='SGQ' AND @sShipToTarget='SGW' AND @sStatusCode=7) --Scan a BIT Item 
			BEGIN
				SET @sErrorMessages = 'Error :Item is already scanned for Quarantine Shipment ';
				 RAISERROR (@sErrorMessages,16,1);
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
	SELECT @sSerialNo as SerialNo,@sWorkOrder as workOrder,@sSubConPo as subConPO
END

