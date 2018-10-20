USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertOrUpdateCountingWM]    Script Date: 20-Oct-18 8:11:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_InsertOrUpdateCountingWM] 
(
	@docNo varchar(12),
	@verNo char(2),
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
    @storageBin varchar(20),
    @MaterialCode varchar(18),
    @BatchNo varchar(20),
    @id int

SET @nth=1
    while 1=1
    BEGIN
        SET @storageBin = (select dbo.nth_occur(@storageBinList,',',@nth));
        IF LEN(ISNULL(@storageBin, '')) = 0 break;
        SET @MaterialCode= (select dbo.nth_occur(@materialList,',',@nth));
        SET @BatchNo = (select dbo.nth_occur(@batchList,',',@nth));

        UPDATE dbo.BX_CountingWM 
        SET storageBin=@storageBin
        WHERE docNo = @docNo  AND
            verNO=@verNO AND
            warehouse=@warehouse AND
            (storageBin=@storageBin OR storageBin IS NULL) AND -- for those not in the counting sheet previously
            MaterialCode=@MaterialCode AND
            BatchNo=@BatchNo 

		IF @@ROWCOUNT=0
            INSERT INTO dbo.BX_CountingWM (docNo,verNo,warehouse,storageBin,MaterialCode,BatchNo)
            VALUES (@docNo,@verNo,@warehouse,@storageBin,@MaterialCode,@BatchNo)

		SET @nth=@nth+1
        continue;
    END
    EXEC dbo.BX_CountingWMRefreshCounts @docNo=@docNo,@verNo=@verNo,@warehouse=@warehouse

	END
