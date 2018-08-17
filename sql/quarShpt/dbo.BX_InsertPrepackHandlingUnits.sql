USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InsertPrepackHandlingUnits]    Script Date: 8/13/2018 11:16:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[BX_InsertPrepackHandlingUnits] 
(
	@qsNo varchar(22),
	@NumToCreate int,
    @PackMaterial varchar(18),
    @CreatedBy varchar(20),
    @BUnit varchar(10),
    @CreatedOn varchar(22)
)
AS
--insert or update for table BX_QuarShpt_PrepackHUnits
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
 --       IF NOT EXISTS (SELECT HUNumber from dbo.BX_QuarShpt_PrepackHUnits where HUNumber = @HUNumber)
            INSERT INTO dbo.BX_QuarShpt_PrepackHUnits(qsNo,HUNumber,PackMaterial,CreatedBy,CreatedOn)
                VALUES (@qsNo,@HUNumber,@PackMaterial,@CreatedBy,Convert(datetime,@CreatedOn))
        IF (@nth=@NumToCreate) break;
		SET @nth=@nth+1
		SET @HUNumber=@HUNumber+1

        continue;
    END
    UPDATE dbo.BX_LatestPackHUnits SET LatestHUNumber=@HUNumber WHERE BUnit=@BUnit

	SELECT * FROM dbo.BX_QuarShpt_PrepackHUnits where qsNo = @qsNo
    --Print 'insert  BX_QuarShpt_PrepackHUnits done!'