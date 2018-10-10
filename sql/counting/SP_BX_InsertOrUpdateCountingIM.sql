USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateCountingIM]    Script Date: 09-Oct-18 5:24:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_InsertOrUpdateCountingIM] 
(
	@docNo varchar(12),
	@fiscalYear char(4),
    @itemNoList varchar (8000),
    @materialList varchar(8000),
    @batchList varchar(8000),
	@plantList varchar(8000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
--insert or update for table BX_CountingW
DECLARE 
    @nth int,
    @itemNo varchar (20),
    @MaterialCode varchar(18),
    @BatchNo varchar(20),
	@plant varchar(10)

SET @nth=1
    while 1=1
    BEGIN
        SET @itemNo = (select dbo.nth_occur(@itemNoList,',',@nth));
        IF LEN(ISNULL(@itemNo, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@materialList,',',@nth));
        SET @BatchNo = (select dbo.nth_occur(@batchList,',',@nth));
        SET @plant = (select dbo.nth_occur(@plantList,',',@nth));

		IF NOT EXISTS (
            SELECT id FROM dbo.BX_CountingIM 
            WHERE docNo = @docNo  AND
                fiscalYear=@fiscalYear AND
                itemNo=@itemNo AND
                MaterialCode=@MaterialCode AND
                BatchNo=@BatchNo AND
                plant=@plant 
        )

        INSERT INTO dbo.BX_CountingIM (docNo,fiscalYear,itemNo,MaterialCode,BatchNo,plant)
         VALUES (@docNo,@fiscalYear,@itemNo,@MaterialCode,@BatchNo,@plant)

		SET @nth=@nth+1
        continue;
    END

    SELECT s.id,c.id as countingImId,c.docNo,c.fiscalYear,c.itemNo,c.MaterialCode,c.BatchNo,c.plant,
    s.qty as ScanQty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingIM c, dbo.BX_CountingIM_Scan s 
    WHERE c.docNo = @docNo and c.fiscalYear = @fiscalYear
    AND c.id=s.countingImId

	END
