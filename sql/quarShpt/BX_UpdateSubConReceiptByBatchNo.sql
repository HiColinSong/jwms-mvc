USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateSubConReceiptByBatchNo]    Script Date: 03-Sep-18 5:14:46 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


-- =============================================
-- Author:		<Ashruf Ali>
-- Create date: <Create Date,,>
-- Description:	<Description,,>
-- =============================================
ALTER PROCEDURE [dbo].[BX_UpdateSubConReceiptByBatchNo] 
		@sFullScanCode		Varchar(100),
		@sReturnToTarget	Varchar(3),
		@sQACategory		Varchar(20),
		@sLogonUser			Varchar(30),
		@nReceivedQty		Int ,
		@nUpdatedCount		Int OUTPUT,
		@sErrorMessages		nVarchar(1000)  OUTPUT
AS
BEGIN

	SET NOCOUNT ON;

	BEGIN TRY
		DECLARE @sBatchNo				Varchar(20) = ''
		DECLARE	@nAvailableQty			Int = 0 

		SET	@sBatchNo =		CASE	WHEN	Left(Right(@sFullScanCode,11),2) = '10'  THEN	Right(@sFullScanCode,9) 
									WHEN	Left(Right(@sFullScanCode,12),2) = '10'  THEN	Right(@sFullScanCode,10)
									ELSE '' 
							END

		SELECT	@nAvailableQty = Count(SerialNo)
		FROM	BX_SubconShipments S
					Left Outer Join WorkOrders W on W.Project = S.workorder 
					Left Outer Join SAP_EANCodes E on E.EANCode = SUBSTRING(@sFullScanCode,3,14)
		WHERE	W.batchno = @sBatchNo
					AND E.MaterialCode = W.Itemcode
					-- AND	S.ShipToTarget = @sReturnToTarget
					AND S.StatusID = 5


		SET @sErrorMessages = ''
		SET	@nUpdatedCount = 0

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
									Left Outer Join SAP_EANCodes E on E.EANCode = SUBSTRING(@sFullScanCode,3,14)
						WHERE	W.batchno = @sBatchNo
									AND E.MaterialCode = W.Itemcode
									-- AND	S1.ShipToTarget = @sReturnToTarget
									AND S1.StatusID = 5
						Order by S1.SerialNo

						)
					SELECT @nUpdatedCount = @@ROWCOUNT 
					IF @nUpdatedCount <> @nReceivedQty 
					BEGIN
						SET @sErrorMessages = N'Error : Not Enough Qty available for assignments ' ;
						THROW 51000, @sErrorMessages, 1;
					END
			END
		ELSE
			BEGIN
				SET @nUpdatedCount = 0
				SET @sErrorMessages = N'Error : Not Enough Qty available for assignments ' ;
				THROW 51000, @sErrorMessages, 1;
			END
	END TRY
	BEGIN CATCH
			SET @nUpdatedCount = 0
			SET @sErrorMessages = ERROR_MESSAGE() ;
	END CATCH
END
