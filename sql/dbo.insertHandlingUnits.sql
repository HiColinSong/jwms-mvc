USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertHandlingUnits]    Script Date: 22-Apr-18 5:13:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[InsertHandlingUnits] 
(
	@DONumber varchar(12),
	@HUNumberList varchar(max),
    @PackMaterial varchar(18),
    @CreatedBy varchar(20),
    @CreatedOn varchar(10)
)
AS
--insert or update for table BX_PackHUnits
DECLARE 
    @nth int,
    @HUNumber varchar (20)

SET @nth=1
    while 1=1
    BEGIN
        SET @HUNumber = (select dbo.nth_occur(@HUNumberList,',',@nth));
        IF LEN(ISNULL(@HUNumber, '')) = 0 break;

        IF NOT EXISTS (SELECT HUNumber from dbo.BX_PackHUnits where HUNumber = @HUNumber)
            INSERT INTO dbo.BX_PackHUnits(DONumber,HUNumber,PackMaterial,CreatedBy,CreatedOn)
                VALUES (@DONumber,@HUNumber,@PackMaterial,@CreatedBy,Convert(datetime,@CreatedOn))

		SET @nth=@nth+1
        continue;
    END
    Print 'insert  BX_PackHUnits done!'