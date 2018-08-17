USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_DeletePrepackHandlingUnit]    Script Date: 8/13/2018 11:16:30 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[BX_DeletePrepackHandlingUnit] 
(
	@qsNo varchar(22),
	@HUNumber varchar(20)
)
AS

BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;
    BEGIN TRY  
        --DELETE from dbo.BX_PackDetails where qsNo=@qsNo and HUNumber=@HUNumber
        UPDATE dbo.BX_SubconShipments 
        SET qsNO=NULL,HUNumber=NULL
        WHERE qsNo=@qsNo AND HUNumber=@HUNumber

		DELETE FROM dbo.BX_QuarShpt_PrepackHUnits where HUNumber=@HUNumber;
    END TRY  
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
	--return freshed items detail
	SELECT * FROM dbo.BX_QuarShpt_PrepackHUnits where qsNo=@qsNo
    --SELECT * from dbo.BX_PackDetails where qsNo=@qsNo and HUNumber=@HUNumber
END

