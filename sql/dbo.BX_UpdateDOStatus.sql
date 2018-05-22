USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateDOStatus]    Script Date: 22-May-18 12:57:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[BX_UpdateDOStatus] 
(
	@DONumber varchar(12),
	@DOStatus char(1)=NULL,
    @PackStart varchar(22)=NULL,
    @PackComplete varchar(22)=NULL,
	@PackStatus char(1)=NULL,
	@Push2SAPStatus char(1)=NULL,
	@SAPRefNo nvarchar(20)=NULL
)
AS
/**
This SP will update status in SAP_DOHeader and BX_PackHeader status 
when completing packing ,packing reversal or RGA
   
*/
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY
        IF (@DOStatus IS NOT NULL)
			UPDATE dbo.SAP_DOHeader 
				SET DOStatus  = @DOStatus
			WHERE	DONumber = @DONumber
        
        IF (@PackStart IS NOT NULL) OR 
           (@PackComplete IS NOT NULL) OR 
           (@PackStatus IS NOT NULL) OR 
           (@Push2SAPStatus IS NOT NULL) OR 
           (@SAPRefNo IS NOT NULL) 
           BEGIN
                UPDATE dbo.BX_PackHeader 
                    SET PackStart  = IIF(@PackStart IS NULL,PackStart,Convert(datetime,@PackStart)),
                        PackComplete  = IIF(@PackComplete IS NULL,PackComplete,Convert(datetime,@PackComplete)),
                        PackStatus  = IIF(@PackStatus IS NULL,PackStatus,@PackStatus),
                        Push2SAPStatus  = IIF(@Push2SAPStatus IS NULL,Push2SAPStatus,@Push2SAPStatus),
                        SAPRefNo  = IIF(@SAPRefNo IS NULL,SAPRefNo,@SAPRefNo)
                WHERE	DONumber = @DONumber
                IF @@ROWCOUNT=0
                    INSERT INTO dbo.BX_PackHeader 
                        VALUES(@DONumber,
                            Convert(datetime,@PackStart),
                            Convert(datetime,@PackComplete),
                            @PackStatus,
                            @Push2SAPStatus,
                            @SAPRefNo)
            END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
END;

