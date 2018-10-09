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
	@itemNo char(6),
    @storageBinList varchar (8000),
    @storageLocList varchar (8000),
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
    @storageBin varchar (20),
    @storageLoc varchar (20),
    @material varchar(18),
    @batch varchar(20),
	@plant varchar(10)

SET @nth=1
    while 1=1
    BEGIN
        SET @storageBin = (select dbo.nth_occur(@storageBinList,',',@nth));
        IF LEN(ISNULL(@storageBin, '')) = 0 break;
        SET @storageLoc = (select dbo.nth_occur(@storageLocList,',',@nth));
        SET @material = (select dbo.nth_occur(@materialList,',',@nth));
        SET @batch = (select dbo.nth_occur(@batchList,',',@nth));
        SET @plant = (select dbo.nth_occur(@plantList,',',@nth));

		IF NOT EXISTS (
            SELECT id FROM dbo.BX_CountingWM 
            WHERE docNo = @docNo  AND
                warehouse=@warehouse AND
                storageBin=@storageBin AND
                storageLoc=@storageLoc AND
                material=@material AND
                batch=@batch AND
                plant=@plant 
        )

        INSERT INTO dbo.BX_CountingWM (docNo,warehouse,itemNo,storageBin,storageLoc,material,batch,plant)
         VALUES (@docNo,@warehouse,@itemNo,@storageBin,@storageLoc,@material,@batch,@plant)

		SET @nth=@nth+1
        continue;
    END

    SELECT c.*,s.qty,s.fullScanCode,s.serialNo,s.countBy,s.countOn from dbo.BX_CountingWM c, dbo.BX_CountingWM_Scan s 
    WHERE c.docNo = @docNo and c.warehouse = @warehouse
    AND c.id=s.countingWmId

	END
