USE [BIOTRACK]
GO

/****** Object:  Table [dbo].[BX_QuarShpt_PrepackHUnits]    Script Date: 8/9/2018 6:39:04 PM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[BX_QuarShpt_PrepackHUnits](
	[qsNo] [varchar](22) NOT NULL,
	[HUNumber] [varchar](20) NOT NULL,
	[PackMaterial] [varchar](18) NULL,
	[CreatedBy] [varchar](20) NULL,
	[CreatedOn] [datetime] NULL,
 CONSTRAINT [PK_BX_QuarShpt_PrepackHUnits] PRIMARY KEY CLUSTERED 
(
	[qsNo] ASC,
	[HUNumber] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]
GO


