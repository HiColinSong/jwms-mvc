USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[SPUpdateSubConReturns]    Script Date: 18-Jul-18 3:59:49 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO





-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[SPUpdateSubConReturns]
		@sFullScanCode			Varchar(60),
		@sReturnToTarget		Varchar(3),   -- SGW - BIT Warehouse, CHW - BESA Warehouse, SGQ - BIT QA
		@sLogonUser				Varchar(20),
		@sQACategory			Varchar(12) = NULL,
		@sOverWritePreviousScan	Varchar(1) = '',    -- X to overwrite existing values with new scanned values
		@dCurrDate				datetime=NULL
AS
BEGIN
	-- SET NOCOUNT ON added to prevent extra result sets from
	-- interfering with SELECT statements.
	SET NOCOUNT ON;
	DECLARE	@sSerialNo			Varchar(10)
	DECLARE	@sWorkOrder			Varchar(20)
	DECLARE	@sSubConPo			Varchar(12)
	DECLARE	@sShipToTarget		Varchar(12)
	DECLARE	@sSAPSTONumber		Varchar(12)
	DECLARE	@sStatusCode		Varchar(12)
	DECLARE @sCurrentQACategory	Varchar(12)


	DECLARE	@sErrorMessages	Varchar(300)
	DECLARE	@nErrorCount	Int

	SET		@nErrorCount = 0
	SET		@sErrorMessages = ''
	BEGIN TRY
		Select	@sSerialNo = SerialNo,
				@sWorkOrder = WorkOrder,
				@sSubConPO = SubConPO,
				@sSAPSTONumber = SAPSTONumber ,
				@sShipToTarget = ShipToTarget ,
				@sCurrentQACategory = QAsampleCategory ,
				@sStatusCode = StatusID 
		From	BX_SubConShipments
		where	FullScanCode = @sFullScanCode
				-- AND StatusID = 5
		IF IsNULL(@sSerialNo,'') = ''
			BEGIN
				SET @sErrorMessages = 'Error : Serial No does not exist in SubCon Operations' ;
				THROW 51000, @sErrorMessages, 1;
			END
		ELSE
			BEGIN
                IF @sOverWritePreviousScan = 'X' OR (@sStatusCode = 5 AND @sShipToTarget =   @sReturnToTarget)
                    BEGIN
                        Update Bx_SubConShipments 
                            SET StatusID = 6 ,   -- Received from SubCOn
                                ReceivedON = Getdate(),
                                ShipToTarget = @sReturnToTarget,
                                QASampleCategory = ISNULL(@sQACategory,'') ,
                                ReceivedBy = @sLogonUser
                        WHERE	FullScanCode = @sFullScanCode 
                    END
                ELSE  -- @sOverWritePreviousScan <> 'X'
                    BEGIN
                        IF @sStatusCode <> 5
                            BEGIN
                                IF @sCurrentQACategory = @sQACategory AND @sShipToTarget =   @sReturnToTarget 
                                    BEGIN
                                        SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') ;
                                        THROW 51000, @sErrorMessages, 1;
                                    END
                                ELSE
                                    BEGIN
                                        SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') + ' / ' +  ISNULL(@sCurrentQACategory,'');
                                        THROW 55500, @sErrorMessages, 1;
                                    END
                            END
                        ELSE  -- @sStatusCode = 5 AND ISNULL(@sReturnToTarget,'') <> ISNULL(@sShipToTarget,'') 
                            BEGIN
								SET @sErrorMessages = 'Error : This Serial No assigned for ' + ISNULL(@sShipToTarget,'') ;
								THROW 51000, @sErrorMessages, 1;
							END
                    END
/*
				IF @sStatusCode <> 5  AND @sOverWritePreviousScan <> 'X'
					BEGIN
						IF @sCurrentQACategory = @sQACategory AND @sShipToTarget =   @sReturnToTarget 
							BEGIN
								SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') ;
								THROW 51000, @sErrorMessages, 1;
							END
						ELSE
							BEGIN
								SET @sErrorMessages = 'Error : Serial No already Scanned for ' + ISNULL(@sShipToTarget,'') + ' / ' +  ISNULL(@sCurrentQACategory,'');
								THROW 55500, @sErrorMessages, 1;
							END
					END
				ELSE
					BEGIN
						IF @sStatusCode = 5 AND ISNULL(@sReturnToTarget,'') <> ISNULL(@sShipToTarget,'')   
							BEGIN
								SET @sErrorMessages = 'Error : This Serial No assigned for ' + ISNULL(@sShipToTarget,'') ;
								THROW 51000, @sErrorMessages, 1;
							END
						ELSE
							BEGIN
								Update Bx_SubConShipments 
									SET StatusID = 6 ,   -- Received from SubCOn
										ReceivedON = Getdate(),
										QASampleCategory = ISNULL(@sQACategory,'') ,
										ReceivedBy = @sLogonUser
								WHERE	FullScanCode = @sFullScanCode 
							END
					END
*/
			END
	END TRY

	BEGIN CATCH
			DECLARE @sTriggerAlert  Int = 0 ;
			THROW 51000, @sErrorMessages, 1;
	END CATCH
	SELECT @sSerialNo as SerialNo,@sWorkOrder as workOrder,@sSubConPo as subConPO,@sSAPSTONumber  as SAPSTONumber
END

