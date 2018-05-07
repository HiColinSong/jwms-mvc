/**Passed in TONumber list, check if any of them not start picking
*/
USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[BX_CheckMultipleTOStatus]    Script Date: 07-May-18 2:52:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[BX_CheckMultipleTOStatus] 
(
	@TONumberList varchar(1200)
)
AS

DECLARE @TONumber char(12),@nth int=1
DECLARE @temp_TONumber TABLE
        (
            TONumber varchar(12)
        );
BEGIN
    while 1=1
    BEGIN
        SET @TONumber = (select dbo.nth_occur(@TONumberList,',',@nth));
        IF LEN(ISNULL(@TONumber, '')) = 0 break;

        IF NOT EXISTS (SELECT 1 FROM dbo.BX_PickHeader WHERE TONumber=@TONumber AND PickStart IS NOT NULL)
        INSERT INTO @temp_TONumber values(@TONumber);
        SET @nth=@nth+1;
    END            
	--return the TONumbers that don't have PickStart status
	SELECT TONumber FROM @temp_TONumber
END

