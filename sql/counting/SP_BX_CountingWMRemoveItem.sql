USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CountingWMRemoveItem]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE PROCEDURE [dbo].[BX_CountingWMRemoveItem] 
(
    @id int,
	@docNo varchar(12),
	@verNo char(2),
	@warehouse char(3)
)
AS
BEGIN
   DECLARE @countingWmId int
   SELECT @countingWmId=countingWmId FROM dbo.BX_CountingWM_Scan WHERE id=@id
   if @countingWmId IS NOT NULL
        DELETE FROM dbo.BX_CountingWM_Scan WHERE id=@id
        
   --delete the item is extra and  has 0 scan count
   IF EXISTS(
            SELECT id FROM BX_CountingWM WHERE id=@countingWmId AND storageBin IS NULL --extra item
        ) AND NOT EXISTS (
            SELECT id FROM BX_CountingWM_Scan WHERE countingWmId=@countingWmId
        )
       DELETE FROM dbo.BX_CountingWM WHERE id=@countingWmId
   
   --get refrenshed counts 
   EXEC dbo.BX_CountingWMRefreshCounts @docNo=@docNo,@verNo=@verNo,@warehouse=@warehouse
END

