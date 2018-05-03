-- ================================================
-- Template generated from Template Explorer using:
-- Create Procedure (New Menu).SQL
--
-- Use the Specify Values for Template Parameters 
-- command (Ctrl-Shift-M) to fill in the parameter 
-- values below.
--
-- This block of comments will not be included in
-- the definition of the procedure.
-- ================================================
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		yd.zhu
-- Create date: 20180502
-- Description:	Packing reversal, delete the DO from BX
-- =============================================
CREATE PROCEDURE dbo.BX_PackingReversal  @DONumber varchar(12)
AS
BEGIN
    BEGIN TRANSACTION;
    SAVE TRANSACTION MySavePoint;

    BEGIN TRY
		DELETE FROM dbo.BX_PackDetails WHERE DONumber = @DONumber
		DELETE FROM dbo.BX_PackHeader WHERE DONumber = @DONumber
		DELETE FROM dbo.BX_PackHUnits WHERE DONumber = @DONumber
		DELETE FROM dbo.SAP_DODetail WHERE DONumber = @DONumber
		DELETE FROM dbo.SAP_DOHeader WHERE DONumber = @DONumber
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
        BEGIN
            ROLLBACK TRANSACTION MySavePoint; -- rollback to MySavePoint
        END
    END CATCH
    COMMIT TRANSACTION 
END;
GO
