USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateTO]    Script Date: 07-May-18 9:15:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_InsertOrUpdateTO] 
(
	@TransferOrder varchar(12),
	@Warehouse varchar(6),
	@TOCreationDate varchar(10),
	@TOCreationUser varchar(20),
	@Plant varchar(4),
	@DONumber varchar(12),
	@ShipToCustomer varchar(12)=NULL,
	@PickConfirmStatus char(1)=0,
    @TOItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @TOQuantityList varchar(2000)
)
AS
--insert or update for table SAP_TOHeader
BEGIN
	IF EXISTS (SELECT TransferOrder from dbo.SAP_TOHeader where TransferOrder = @TransferOrder )
		BEGIN
			UPDATE dbo.SAP_TOHeader 
				SET TOCreationDate	 = Convert(datetime,@TOCreationDate) ,
					TOCreationUser = @TOCreationUser ,
					DoNumber = @DONumber,
					Plant = @Plant ,
					ShipToCustomer	 = @ShipToCustomer ,
					PickConfirmStatus  = @PickConfirmStatus
			WHERE	TransferOrder = @TransferOrder
		END
	ELSE
		INSERT INTO dbo.SAP_TOHeader(TransferOrder,Warehouse,TOCreationDate,TOCreationUser,DONumber,Plant,ShipToCustomer,PickConfirmStatus)
			VALUES (@TransferOrder,@Warehouse,Convert(datetime,@TOCreationDate),@TOCreationUser,@DONumber,@Plant,@ShipToCustomer,@PickConfirmStatus)

--insert or update for table SAP_TODetail
DECLARE 
    @nth int,
    @TOItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @TOQuantity varchar (22)

SET @nth=1
    while 1=1
    BEGIN
        SET @TOItemNumber = (select dbo.nth_occur(@TOItemNumberList,',',@nth));
        IF LEN(ISNULL(@TOItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @TOQuantity = (select dbo.nth_occur(@TOQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_TODetail WHERE TransferOrder = @TransferOrder and TOItemNumber=@TOItemNumber

        INSERT INTO dbo.SAP_TODetail(TransferOrder,Warehouse,TOItemNumber,MaterialCode,BatchNumber,VendorBatch,TOQuantity)
            VALUES (@TransferOrder,@Warehouse,@TOItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@TOQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END

    PRINT 'insert or update of TOHeader and TODetail done!'
	END
