USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_CountingWM]    Script Date: 09-Oct-18 4:29:24 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_CountingWM](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[docNo] [varchar](12) NOT NULL,
	[warehouse] [char](3) NOT NULL,
	[itemNo] [char](6) NULL,
	[storeageBin] [varchar](20) NULL,
	[storageLoc] [varchar](20) NULL,
	[material] [varchar](18) NULL,
	[batch] [varchar](20) NULL,
	[plant] [varchar](10) NULL,
 CONSTRAINT [PK_BX_CountingWM] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


