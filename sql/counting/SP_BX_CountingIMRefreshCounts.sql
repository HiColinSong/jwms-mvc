USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingIMRefreshCounts]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_CountingIMRefreshCounts] 
(
	@docNo varchar(12),
	@fiscalYear char(4)
)
AS
BEGIN
    --get Extra Items
    SELECT id,docNo,fiscalYear,MaterialCode,BatchNo 
    FROM dbo.BX_CountingIM 
    WHERE  docNo = @docNo AND fiscalYear=@fiscalYear AND itemNo IS NULL AND (isDeleted IS NULL OR isDeleted='')

   --get IM Entry count (sum of each entry)
   EXEC dbo.BX_GetIMEntryCount @docNo=@docNo,@fiscalYear=@fiscalYear 

   -- get all scanned items
   SELECT s.id,c.id as countingImId,
          c.docNo,
          c.fiscalYear,
          c.itemNo,
          c.MaterialCode,
          c.BatchNo,
          s.qty as ScanQty,
          s.fullScanCode,
          s.serialNo,
          s.countBy,
          s.countOn 
    FROM  dbo.BX_CountingIM_Scan s 
            LEFT OUTER JOIN dbo.BX_CountingIM c ON c.id=s.countingImId
    WHERE c.docNo = @docNo and c.fiscalYear = @fiscalYear and (c.isDeleted is NULL OR c.isDeleted='')
END

