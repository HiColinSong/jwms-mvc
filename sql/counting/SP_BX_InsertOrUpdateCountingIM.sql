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
    @batchList varchar(8000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
--insert or update for table BX_CountingW
DECLARE 
    @nth int,
    @itemNo varchar (20),
    @MaterialCode varchar(18),
    @BatchNo varchar(20)

SET @nth=1
    while 1=1
    BEGIN
        SET @itemNo = (select dbo.nth_occur(@itemNoList,',',@nth));
        IF LEN(ISNULL(@itemNo, '')) = 0 break;
        SET @MaterialCode = (select dbo.nth_occur(@materialList,',',@nth));
        SET @BatchNo = (select dbo.nth_occur(@batchList,',',@nth));

        UPDATE dbo.BX_CountingIM 
        SET itemNo=@itemNo
        WHERE docNo = @docNo  AND
              fiscalYear=@fiscalYear AND
              (itemNo=@itemNo OR itemNo IS NULL) AND -- for those not in the counting sheet previously
                MaterialCode=@MaterialCode AND
                BatchNo=@BatchNo

		IF @@ROWCOUNT=0

        INSERT INTO dbo.BX_CountingIM (docNo,fiscalYear,itemNo,MaterialCode,BatchNo)
         VALUES (@docNo,@fiscalYear,@itemNo,@MaterialCode,@BatchNo)

		SET @nth=@nth+1
        continue;
    END

    SELECT id,
           docNo,
           fiscalYear,
           MaterialCode,
           BatchNo
    FROM dbo.BX_CountingIM 
    WHERE docNo = @docNo  AND
          fiscalYear=@fiscalYear 
          AND itemNo IS NULL --extra items, not in counting sheet

    SELECT 
        s.id,
        c.id AS countingImId,
        c.docNo,
        c.fiscalYear,
        c.itemNo,
        c.MaterialCode,
        c.BatchNo,
        s.qty AS ScanQty,
        s.fullScanCode,
        s.serialNo,
        s.countBy,
        s.countOn 
    FROM dbo.BX_CountingIM c, dbo.BX_CountingIM_Scan s 
    WHERE c.docNo = @docNo AND c.fiscalYear = @fiscalYear
    AND c.id=s.countingImId
	END