USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdatePackHeader]    Script Date: 24-Apr-18 3:35:02 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[InsertOrUpdatePackHeader] 
(
	@DONumber varchar(12),
	@DOCreationDate varchar(10),
	@DOCreationUser varchar(20),
	@Plant varchar(4),
	@ShipToCustomer varchar(12),
	@DOStatus char(1),
    @DOItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @DOQuantityList varchar(2000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
	IF EXISTS (SELECT DONumber from dbo.SAP_DOHeader where DONumber = @DONumber )
		BEGIN
			UPDATE dbo.SAP_DOHeader 
				SET DOCreationDate	 = Convert(datetime,@DOCreationDate) ,
					DOCreationUser = @DOCreationUser ,
					Plant = @Plant ,
					ShipToCustomer	 = @ShipToCustomer ,
					DOStatus  = @DOStatus
			WHERE	DONumber = @DONumber
		END
	ELSE
		INSERT INTO dbo.SAP_DOHeader(DONumber,DOCreationDate,DOCreationUser,Plant,ShipToCustomer,DOStatus)
			VALUES (@DONumber,Convert(datetime,@DOCreationDate),@DOCreationUser,@Plant,@ShipToCustomer,@DOStatus)

--insert or update for table SAP_DODetail
DECLARE 
    @nth int,
    @DOItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @DOQuantity varchar (22)
    --@uncompleted bit;

SET @nth=1
    --@uncompleted='true';
    while 1=1
    BEGIN
        SET @DOItemNumber = (select dbo.nth_occur(@DOItemNumberList,',',@nth));
        IF LEN(ISNULL(@DOItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @DOQuantity = (select dbo.nth_occur(@DOQuantityList,',',@nth));

        IF EXISTS (SELECT DONumber from dbo.SAP_DODetail where DONumber = @DONumber and DOItemNumber=@DOItemNumber)
            BEGIN
                UPDATE dbo.SAP_DODetail 
                    SET MaterialCode = @MaterialCode ,
                        BatchNumber = @BatchNumber ,
                        VendorBatch = @VendorBatch ,
                        DOQuantity	 = CAST(@DOQuantity AS NUMERIC(18,4)) 
                WHERE	DONumber = @DONumber and DOItemNumber=@DOItemNumber
            END
        ELSE
            INSERT INTO dbo.SAP_DODetail(DONumber,DOItemNumber,MaterialCode,BatchNumber,VendorBatch,DOQuantity)
                VALUES (@DONumber,@DOItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@DOQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END

    PRINT 'insert or update of DOHeader and DODetail done!'
	END
