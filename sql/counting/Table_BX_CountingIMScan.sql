USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_CountingIM_Scan]    Script Date: 10-Oct-18 5:26:44 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_CountingIM_Scan](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[countingImId] [int] NOT NULL,
	[qty] [int] NULL,
	[fullScanCode] [varchar](60) NULL,
	[serialNo] [varchar](10) NULL,
	[countBy] [varchar](20) NULL,
	[countOn] [datetime] NULL,
 CONSTRAINT [PK_BX_CountingIM_Scan] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[BX_CountingIM_Scan]  WITH CHECK ADD  CONSTRAINT [FK_BX_CountingIM_Scan_BX_CountingIM] FOREIGN KEY([countingImId])
REFERENCES [dbo].[BX_CountingIM] ([id])
GO

ALTER TABLE [dbo].[BX_CountingIM_Scan] CHECK CONSTRAINT [FK_BX_CountingIM_Scan_BX_CountingIM]
GO


