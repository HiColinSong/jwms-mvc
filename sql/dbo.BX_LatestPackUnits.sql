USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_LatestPackHUnits]    Script Date: 02-May-18 1:11:40 PM ******/
DROP TABLE [dbo].[BX_LatestPackHUnits]
GO

/****** Object:  Table [dbo].[BX_LatestPackHUnits]    Script Date: 02-May-18 1:11:40 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_LatestPackHUnits](
	[BUnit] [varchar](10) NOT NULL,
	[Prefix] [char](1) NOT NULL,
	[LatestHUNumber] [bigint] NULL,
 CONSTRAINT [PK_BX_LatestPackHUnits] PRIMARY KEY CLUSTERED 
(
	[BUnit] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

Insert into dbo.BX_LatestPackHUnits values ('BITSG','1',118050200000)
Insert into dbo.BX_LatestPackHUnits values ('BBV','2',218050200000)
Insert into dbo.BX_LatestPackHUnits values ('JWMS','3',318050200000)