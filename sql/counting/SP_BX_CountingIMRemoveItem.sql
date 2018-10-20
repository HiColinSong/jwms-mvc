USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingIMRemoveItem]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_CountingIMRemoveItem] 
(
    @id int,
	@docNo varchar(12),
	@fiscalYear char(4)
)
AS
BEGIN
   DECLARE @countingImId int
   SELECT @countingImId=countingImId FROM dbo.BX_CountingIM_Scan WHERE id=@id
   if @countingImId IS NOT NULL
        DELETE FROM dbo.BX_CountingIM_Scan WHERE id=@id
        
   --delete extra item that has 0 scan count
   IF EXISTS(
            SELECT id FROM BX_CountingIM WHERE id=@countingImId AND itemNo IS NULL --extra item
        ) AND NOT EXISTS (
            SELECT id FROM BX_CountingIM_Scan WHERE countingImId=@countingImId
        )
       DELETE FROM dbo.BX_CountingIM WHERE id=@countingImId
   
   --get refrenshed counts 
   EXEC dbo.BX_CountingIMRefreshCounts @docNo=@docNo,@fiscalYear=@fiscalYear 
END

