USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_InserOrUpdateQuarShptPlan]    Script Date: 8/9/2018 8:17:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[BX_InserOrUpdateQuarShptPlan] 
(
	@qsNo varchar(22),
	@planOn varchar(10),
	@planBy varchar(20),
    @SubconPORefNo varchar(20),
    @workorderList varchar(8000),
    @batchNoList varchar(5500),
    @qtyList varchar(2000)
)
AS
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY

--insert or update for table BX_QuarShptHead
        BEGIN
            IF EXISTS (SELECT qsNo from dbo.BX_QuarShptHead where qsNo = @qsNo )
                BEGIN
                    UPDATE dbo.BX_QuarShptHead 
                        SET planOn = Convert(datetime,@planOn) ,
                            planBy = @planBy,
                            SubconPORefNo=@SubconPORefNo
                    WHERE	qsNo = @qsNo
                END
            ELSE
                INSERT INTO dbo.BX_QuarShptHead (qsNo,planOn,planBy,SubconPORefNo)
                    VALUES (@qsNo,Convert(datetime,@planOn),@planBy,@SubconPORefNo)


        --insert or update for table BX_QuarShptPlan
        DECLARE 
            @nth int,
            @workorder varchar (20),
            @batchNo varchar (12),
            @availableQty NUMERIC(20,0),
            @qty varchar (22),
            @errMsg NVARCHAR(4000)

        SET @nth=1
            while 1=1
            BEGIN
                SET @workorder = (select dbo.nth_occur(@workorderList,',',@nth));
                IF LEN(ISNULL(@workorder, '')) = 0 break;
                SET @batchNo = (select dbo.nth_occur(@batchNoList,',',@nth));
                SET @qty = (select dbo.nth_occur(@qtyList,',',@nth));
                SET @qty = CAST(@qty AS NUMERIC(18,0));
                
                -- check if the qty is greater than the available qty
                SET @availableQty=( select dbo.BX_FnGetSerialCountByWorkOrder(@workorder,'SGW',5))
                IF(@availableQty<@qty)
                    BEGIN
                        SELECT @errorMsg=CONCAT('Error:Planned quantity exceeds the available quantity for workorder: ', @workorder);
                        RAISERROR (@errorMsg,16,1 );
                    END 
                --delete old records and insert new one
                DELETE FROM dbo.BX_QuarShptPlan WHERE qsNo = @qsNo and workorder=@workorder and  batchNo=@batchNo 

                INSERT INTO dbo.BX_QuarShptPlan(qsNo,workorder,SubconPORefNo,batchNo,qty)
                VALUES (@qsNo,@workorder,@SubconPORefNo,@batchNo, CAST(@qty AS NUMERIC(18,0)))

                SET @nth=@nth+1
                continue;
            END

            END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
        
        DECLARE @ErrorMessage NVARCHAR(4000);  
        DECLARE @ErrorSeverity INT;  
        DECLARE @ErrorState INT;  

        SELECT   
            @ErrorMessage = ERROR_MESSAGE(),  
            @ErrorSeverity = ERROR_SEVERITY(),  
            @ErrorState = ERROR_STATE();  

        RAISERROR (@ErrorMessage, -- Message text.  
                @ErrorSeverity, -- Severity.  
                @ErrorState -- State.  
                );  
    END CATCH
    COMMIT TRANSACTION 
END;