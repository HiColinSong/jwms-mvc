USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_UpdateQuarShptStatus]    Script Date: 14-Aug-18 11:02:21 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


ALTER PROCEDURE [dbo].[BX_UpdateQuarShptStatus] 
(
	@qsNo varchar(22),
	@SubconPORefNo varchar(20),
	@planBy varchar(20)=NULL,
	@planOn varchar(22)=NULL,
	@linkedDONUmber varchar(12)=NULL,
	@prepackConfirmOn varchar(22)=NULL
)
AS
/**
This SP will update BX_QuarShptHeader status 
when completing quaratine shipment plan,SAP link or confirm
   
*/
BEGIN
        IF (@planBy IS NOT NULL) OR 
           (@planOn IS NOT NULL) OR 
           (@linkedDONUmber IS NOT NULL) OR 
           (@prepackConfirmOn IS NOT NULL) 
           BEGIN
                UPDATE dbo.BX_QuarShptHeader 
                     SET
					 planBy  =  ISNULL(@planBy,planBy) ,
                     planOn  = CASE WHEN ISNULL(@planOn,'') = '' THEN planOn ELSE Convert(datetime,@planOn) END,
					 linkedDONUmber  =  --if passed value 'nullValue' then change it to NULL
                     CASE 
                        WHEN ISNULL(@linkedDONUmber,'') = '' 
                        THEN linkedDONUmber 
                        ELSE 
                            CASE
                                WHEN  @linkedDONUmber = 'nullValue'
                                THEN  NULL
                                ELSE  @linkedDONUmber
                            END
                        END,
					 prepackConfirmOn  = CASE WHEN ISNULL(@prepackConfirmOn,'') = '' THEN prepackConfirmOn ELSE Convert(datetime,@prepackConfirmOn) END
                    
                WHERE qsNo = @qsNo
                IF @@ROWCOUNT=0
                    INSERT INTO dbo.BX_QuarShptHeader 
                        VALUES(@qsNo,
                            @SubconPORefNo,
                            @planBy,
                            Convert(datetime,@planOn),
                            @linkedDONUmber,
                            Convert(datetime,@prepackConfirmOn)
                            )

            END;
END;
