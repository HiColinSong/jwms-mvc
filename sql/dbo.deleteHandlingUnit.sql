USE [BIOTRACK]
GO

/****** Object:  StoredProcedure [dbo].[DeleteHandlingUnit]    Script Date: 27-Apr-18 11:43:33 AM ******/
DROP PROCEDURE [dbo].[DeleteHandlingUnit]
GO

/****** Object:  StoredProcedure [dbo].[DeleteHandlingUnit]    Script Date: 27-Apr-18 11:43:33 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


CREATE PROCEDURE [dbo].[DeleteHandlingUnit] 
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
    BEGIN TRY  
        IF EXISTS (select * from dbo.BX_PackDetails where DONumber=@DONumber and HUNumber=@HUNumber)
            -- RAISERROR with severity 11-19 will cause execution to   
            -- jump to the CATCH block.  
            RAISERROR ('Error: Handling Unit is not empty!', -- Message text.  
                    16, -- Severity.  
                    1 -- State.  
                    );  

		DELETE FROM dbo.BX_PackHUnits where HUNumber=@HUNumber
    END TRY  
    BEGIN CATCH  
        DECLARE @ErrorMessage NVARCHAR(4000);  
        DECLARE @ErrorSeverity INT;  
        DECLARE @ErrorState INT;  

        SELECT   
            @ErrorMessage = ERROR_MESSAGE(),  
            @ErrorSeverity = ERROR_SEVERITY(),  
            @ErrorState = ERROR_STATE();  

        -- Use RAISERROR inside the CATCH block to return error  
        -- information about the original error that caused  
        -- execution to jump to the CATCH block.  
        RAISERROR (@ErrorMessage, -- Message text.  
                @ErrorSeverity, -- Severity.  
                @ErrorState -- State.  
                );  
    END CATCH; 
	--return freshed items detail
	SELECT * FROM dbo.BX_PackHUnits where DONumber=@DONumber

END

GO


