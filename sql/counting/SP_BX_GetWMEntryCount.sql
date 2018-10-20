USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_GetWMEntryCount]    Script Date: 10-Oct-18 10:02:13 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_GetWMEntryCount] 
(
	@docNo varchar(12),
	@warehouse char(3),
	@verNo char(2)
)
AS
BEGIN
   SELECT c.storageBin,
          c.MaterialCode,
          c.BatchNo,
          ISNULL(sum(s.qty),0) AS entryCount 
    FROM BX_CountingWM c LEFT OUTER JOIN BX_CountingWM_Scan s ON s.countingWmId=c.id
    WHERE c.docNo=@docNo AND c.verNo=@verNo AND c.warehouse=@warehouse
    GROUP BY c.storageBin,c.MaterialCode,c.BatchNo
    ORDER BY c.storageBin DESC
END

