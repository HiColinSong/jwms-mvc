USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetIMEntryCount]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_GetIMEntryCount] 
(
	@docNo varchar(12),
	@fiscalYear char(4)
)
AS
BEGIN
   SELECT c.itemNo,
          c.MaterialCode,
          c.BatchNo,
          ISNULL(sum(s.qty),0) AS entryCount 
    FROM BX_CountingIM c LEFT OUTER JOIN BX_CountingIM_Scan s ON s.countingImId=c.id
    WHERE docNo=@docNo AND fiscalYear=@fiscalYear
    GROUP BY c.itemNo,c.MaterialCode,c.BatchNo
END

