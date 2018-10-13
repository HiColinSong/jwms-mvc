USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateCountingWM]    Script Date: 09-Oct-18 5:24:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_InsertOrUpdateCountingWM] 
(
	@docNo varchar(12),
	@warehouse char(3),
    @storageBinList varchar (8000),
    @materialList varchar(8000),
    @batchList varchar(8000)
)
AS
--insert or update for table SAP_DOHeader
BEGIN
--insert or update for table BX_CountingW
DECLARE 
    @nth int,
    @storageBin varchar (20),
    @material varchar(18),
    @batch varchar(20),
    @id int

SET @nth=1
    while 1=1
    BEGIN
        SET @storageBin = (select dbo.nth_occur(@storageBinList,',',@nth));
        IF LEN(ISNULL(@storageBin, '')) = 0 break;
        SET @material = (select dbo.nth_occur(@materialList,',',@nth));
        SET @batch = (select dbo.nth_occur(@batchList,',',@nth));

        UPDATE dbo.BX_CountingWM 
        SET storageBin=@storageBin
        WHERE docNo = @docNo  AND
            warehouse=@warehouse AND
            (storageBin=@storageBin OR storageBin IS NULL) AND -- for those not in the counting sheet previously
            material=@material AND
            batch=@batch 

		IF @@ROWCOUNT=0
            INSERT INTO dbo.BX_CountingWM (docNo,warehouse,storageBin,material,batch)
            VALUES (@docNo,@warehouse,@storageBin,@material,@batch)

		SET @nth=@nth+1
        continue;
    END

    SELECT id,
           docNo,
           warehouse,
           material as MaterialCode,
           batch as BatchNo
    FROM dbo.BX_CountingWM 
    WHERE docNo = @docNo  AND
          warehouse=@warehouse 
          AND storageBin IS NULL --extra items, not in counting sheet

    SELECT 
        s.id,
        c.id AS countingWmId,
        c.docNo,
        c.warehouse,
        c.storageBin,
        c.material AS MaterialCode,
        c.batch AS BatchNo,
        s.qty AS ScanQty,
        s.fullScanCode,
        s.serialNo,
        s.countBy,
        s.countOn 
    FROM dbo.BX_CountingWM c, dbo.BX_CountingWM_Scan s 
    WHERE c.docNo = @docNo AND c.warehouse = @warehouse
    AND c.id=s.countingWmId

	END
