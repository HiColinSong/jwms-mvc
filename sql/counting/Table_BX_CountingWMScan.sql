USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_CountingWM_Scan]    Script Date: 09-Oct-18 4:34:21 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_CountingWM_Scan](
	[id] [int] IDENTITY(1,1) NOT NULL,
	[countingWmId] [int] NOT NULL,
	[qty] [int] NULL,
	[fullScanCode] [varbinary](60) NULL,
	[serialNo] [varchar](10) NULL,
	[countBy] [varchar](20) NULL,
	[countOn] [datetime] NULL,
 CONSTRAINT [PK_BX_CountingWM_Scan] PRIMARY KEY CLUSTERED 
(
	[id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[BX_CountingWM_Scan]  WITH CHECK ADD  CONSTRAINT [FK_BX_CountingWM_Scan_BX_CountingWM] FOREIGN KEY([countingWmId])
REFERENCES [dbo].[BX_CountingWM] ([id])
GO

ALTER TABLE [dbo].[BX_CountingWM_Scan] CHECK CONSTRAINT [FK_BX_CountingWM_Scan_BX_CountingWM]
GO


