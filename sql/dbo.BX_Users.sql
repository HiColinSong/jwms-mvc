USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_UserProfile]    Script Date: 28-Apr-18 11:07:17 PM ******/
DROP TABLE [dbo].[BX_UserProfile]
GO

/****** Object:  Table [dbo].[BX_UserProfile]    Script Date: 28-Apr-18 11:07:17 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_UserProfile](
	[UserID] [varchar](20) NOT NULL,
	[DefaultWH] [varchar](3) NULL,
	[Domain] [varchar](20) NULL,
	[UserRole] [varchar](20) NULL,
	[isActive] [char](1) NULL,
 CONSTRAINT [PK_BX_UserProfile] PRIMARY KEY CLUSTERED 
(
	[UserID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


