USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertHandlingUnits]    Script Date: 22-May-18 12:35:25 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[InsertHandlingUnits] 
(
	@DONumber varchar(12),
	@NumToCreate int,
    @PackMaterial varchar(18),
    @CreatedBy varchar(20),
    @BUnit varchar(10),
    @CreatedOn varchar(22)
)
AS
--insert or update for table BX_PackHUnits
DECLARE 
    @nth int,
    @LatestHUNumber bigint,
    @HUNumber bigint,
    @Prefix char(1)
    select @Prefix=Prefix,@LatestHUNumber=LatestHUNumber from dbo.BX_LatestPackHUnits where BUnit=@BUnit
    SET @HUNumber = CAST(@Prefix+SUBSTRING(@CreatedOn,3,6)+'00000' AS bigint);
    IF (@HUNumber<=@LatestHUNumber)
      SET @HUNumber = @LatestHUNumber+1;

SET @nth=1
    while 1=1
    BEGIN
 --       IF NOT EXISTS (SELECT HUNumber from dbo.BX_PackHUnits where HUNumber = @HUNumber)
            INSERT INTO dbo.BX_PackHUnits(DONumber,HUNumber,PackMaterial,CreatedBy,CreatedOn)
                VALUES (@DONumber,@HUNumber,@PackMaterial,@CreatedBy,Convert(datetime,@CreatedOn))
        IF (@nth=@NumToCreate) break;
		SET @nth=@nth+1
		SET @HUNumber=@HUNumber+1

        continue;
    END
    UPDATE dbo.BX_LatestPackHUnits SET LatestHUNumber=@HUNumber WHERE BUnit=@BUnit

	SELECT * FROM dbo.BX_PackHUnits where DONumber = @DONumber
    --Print 'insert  BX_PackHUnits done!'