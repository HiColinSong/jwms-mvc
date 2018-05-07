USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[DeleteHandlingUnit]    Script Date: 08-May-18 12:12:14 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[DeleteHandlingUnit] 
(
	@DONumber varchar(12),
	@HUNumber varchar(20)
)
AS
/**delete for table BX_PackHUnits
    do the following check
    1. Check if there is any scanned item in this HU
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;
    BEGIN TRY  
        DELETE from dbo.BX_PackDetails where DONumber=@DONumber and HUNumber=@HUNumber
		DELETE FROM dbo.BX_PackHUnits where HUNumber=@HUNumber;
    END TRY  
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
	--return freshed items detail
	SELECT * FROM dbo.BX_PackHUnits where DONumber=@DONumber
    --SELECT * from dbo.BX_PackDetails where DONumber=@DONumber and HUNumber=@HUNumber
END

