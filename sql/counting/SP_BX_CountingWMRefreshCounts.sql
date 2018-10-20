USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingWMRefreshCounts]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_CountingWMRefreshCounts] 
(
	@docNo varchar(12),
	@warehouse char(3),
	@verNo char(2)
)
AS
BEGIN
    --get Extra Items
    SELECT id,docNo,warehouse,MaterialCode,BatchNo 
    FROM dbo.BX_CountingWM 
    WHERE  docNo = @docNo AND verNo = @verNo AND warehouse=@warehouse AND storageBin IS NULL

   --get WM Entry count (sum of each entry)
   EXEC dbo.BX_GetWMEntryCount @docNo=@docNo,@verNo=@verNo,@warehouse=@warehouse 

   -- get all scanned items
   SELECT 
        s.id,
        c.id AS countingWmId,
        c.docNo,
        c.verNo,
        c.warehouse,
        c.storageBin,
        c.MaterialCode,
        c.BatchNo,
        s.qty AS ScanQty,
        s.fullScanCode,
        s.serialNo,
        s.countBy,
        s.countOn 
    FROM dbo.BX_CountingWM c, dbo.BX_CountingWM_Scan s 
    WHERE c.docNo = @docNo AND c.verNo = @verNo AND c.warehouse = @warehouse
    AND c.id=s.countingWmId
END

