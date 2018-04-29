USE [BIOTRACK]
GO
/****** Object:  StoredProcedure [dbo].[InsertOrUpdateDO]    Script Date: 24-Apr-18 5:52:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[BX_InsertOrUpdateUserProfile] 
(
	@UserID varchar(20),
	@DefaultWH varchar(3),
	@Domain varchar(20),
	@UserRole varchar(20) = 'normal',--could be "admin" or "superAdmin"
	@isActive char(1)
)
AS
--insert or update for table BX_UserProfile
BEGIN
	IF EXISTS (SELECT UserID from dbo.BX_UserProfile where UserID = @UserID )
		BEGIN
			UPDATE dbo.BX_UserProfile 
				SET DefaultWH = @DefaultWH,
					Domain = @Domain,
					UserRole = @UserRole,
					isActive  = @isActive
			WHERE	UserID = @UserID
		END
	ELSE
		INSERT INTO dbo.BX_UserProfile
			VALUES (@UserID,@DefaultWH,@Domain,@UserRole,@isActive)

	SELECT * FROM dbo.BX_UserProfile where UserID = @UserID 
END
