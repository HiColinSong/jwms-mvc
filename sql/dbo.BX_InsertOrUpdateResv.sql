USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateResv]    Script Date: 01-Jun-18 11:50:45 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_InsertOrUpdateResv] 
(
	@Warehouse varchar(6),
	@ResvOrder varchar(12),
	@ResvOrderDate varchar(10),
	@ResvCreaedBy varchar(20),
	@Plant varchar(4)=NULL,
	@PostingStatus char(1),
    @ResvItemNumberList varchar(3500),
    @MaterialCodeList varchar(8000),
    @BatchNumberList varchar(5500),
    @VendorBatchList varchar(8000),
    @ResvQuantityList varchar(2000)
)
AS
--insert or update for table SAP_RESVHeader
BEGIN
	IF EXISTS (SELECT ResvOrder from dbo.SAP_RESVHeader where ResvOrder = @ResvOrder and Warehouse = @Warehouse)
		BEGIN
			UPDATE dbo.SAP_RESVHeader 
				SET ResvOrderDate = Convert(datetime,@ResvOrderDate),
					ResvCreaedBy = @ResvCreaedBy,
					Plant = @Plant,
					PostingStatus  = @PostingStatus
			WHERE	ResvOrder = @ResvOrder AND
					Warehouse = @Warehouse
		END
	ELSE
		INSERT INTO dbo.SAP_RESVHeader(Warehouse,ResvOrder,ResvOrderDate,ResvCreaedBy,Plant,PostingStatus)
			VALUES (@Warehouse,@ResvOrder,Convert(datetime,@ResvOrderDate),@ResvCreaedBy,@Plant,@PostingStatus)

--insert  table SAP_RESVDetail
DECLARE 
    @nth int,
    @ResvItemNumber varchar (6),
    @MaterialCode varchar (18),
    @BatchNumber varchar (10),
    @VendorBatch varchar (20),
    @ResvQuantity varchar (22)


SET @nth=1
    while 1=1
    BEGIN
        SET @ResvItemNumber = (select dbo.nth_occur(@ResvItemNumberList,',',@nth));
        IF LEN(ISNULL(@ResvItemNumber, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@MaterialCodeList,',',@nth));
        SET @BatchNumber = (select dbo.nth_occur(@BatchNumberList,',',@nth));
        SET @VendorBatch = (select dbo.nth_occur(@VendorBatchList,',',@nth));
        SET @ResvQuantity = (select dbo.nth_occur(@ResvQuantityList,',',@nth));

		--delete old records and insert new one
		DELETE FROM dbo.SAP_RESVDetail WHERE Warehouse = @Warehouse AND ResvOrder = @ResvOrder and ResvItemNumber=@ResvItemNumber

        INSERT INTO dbo.SAP_RESVDetail(Warehouse,ResvOrder,ResvItemNumber,MaterialCode,BatchNumber,VendorBatch,ResvQuantity)
         VALUES (@Warehouse,@ResvOrder,@ResvItemNumber,@MaterialCode,@BatchNumber,@VendorBatch, CAST(@ResvQuantity AS NUMERIC(18,4)))

		SET @nth=@nth+1
        continue;
    END
	SELECT * FROM dbo.BX_ResvHeader WHERE ResvNumber=@ResvOrder
	SELECT * FROM dbo.BX_ResvDetails where ResvNumber=@ResvOrder
    PRINT 'insert or update of ResvHeader and ResvDetail done!'
	END
