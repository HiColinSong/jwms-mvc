USE [BIOTRACK]
GO

/****** Object:  UserDefinedFunction [dbo].[nth_occur]    Script Date: 22-Apr-18 12:42:43 PM ******/
DROP FUNCTION [dbo].[nth_occur]
GO

/****** Object:  UserDefinedFunction [dbo].[nth_occur]    Script Date: 22-Apr-18 12:42:43 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO


--create a new function to find the Nth occurence,
--with the option to choose things other than a comma as the separator (for example a hyphen)
CREATE FUNCTION [dbo].[nth_occur](@str VARCHAR(8000), @separator VARCHAR(255) = ',', @nth INT)
RETURNS varchar(255)
AS
BEGIN

-- Declare variables and place-holders
DECLARE @found INT = @nth,
@word VARCHAR(8000),
@text VARCHAR(100),
@end int;

-- Start an infinite loop that will only end when the Nth word is found
WHILE 1=1
BEGIN
IF @found = 1
BEGIN
SET @end = CHARINDEX(@separator, @str)
IF @end IS NULL or @end = 0
BEGIN
SET @end = LEN(@str)
END
SET @text = LEFT(@str,@end)
BREAK
END;
-- If the selected word is beyond the number of words, NULL is returned
IF CHARINDEX(@separator, @str) IS NULL or CHARINDEX(@separator, @str) = 0
BEGIN
SET @text = NULL;
BREAK;
END

-- Each iteration of the loop will remove the first word fromt the left
SET @str = RIGHT(@str, LEN(@str)-CHARINDEX(@separator, @str));
SET @found = @found - 1
END

RETURN REPLACE(@text,@separator,'');
END
GO


