USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_CountingIM]    Script Date: 10-Oct-18 5:17:59 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_CountingIM](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[docNo] [varchar](12) NOT NULL,
	[fiscalYear] [char](4) NOT NULL,
	[itemNo] [char](6) NULL,
	[MaterialCode] [varchar](18) NULL,
	[BatchNo] [varchar](20) NULL,
	[plant] [varchar](10) NULL,
 CONSTRAINT [PK_BX_CountingIM] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


