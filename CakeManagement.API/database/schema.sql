IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [Categories] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Categories] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Email] nvarchar(450) NOT NULL,
        [PasswordHash] nvarchar(max) NOT NULL,
        [Role] nvarchar(max) NOT NULL,
        [Phone] nvarchar(max) NULL,
        [Address] nvarchar(max) NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Users] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [Cakes] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        [StockQuantity] int NOT NULL,
        [ImageUrl] nvarchar(max) NOT NULL,
        [IsAvailable] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        [CategoryId] int NOT NULL,
        CONSTRAINT [PK_Cakes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Cakes_Categories_CategoryId] FOREIGN KEY ([CategoryId]) REFERENCES [Categories] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [Carts] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_Carts] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Carts_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [Orders] (
        [Id] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [OrderDate] datetime2 NOT NULL,
        [TotalAmount] decimal(18,2) NOT NULL,
        [Status] nvarchar(max) NOT NULL,
        [ShippingAddress] nvarchar(max) NULL,
        [PaymentMethod] nvarchar(max) NOT NULL,
        [PaymentStatus] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_Orders] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_Orders_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [CartItems] (
        [Id] int NOT NULL IDENTITY,
        [CartId] int NOT NULL,
        [CakeId] int NOT NULL,
        CONSTRAINT [PK_CartItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CartItems_Cakes_CakeId] FOREIGN KEY ([CakeId]) REFERENCES [Cakes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CartItems_Carts_CartId] FOREIGN KEY ([CartId]) REFERENCES [Carts] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE TABLE [OrderItems] (
        [Id] int NOT NULL IDENTITY,
        [OrderId] int NOT NULL,
        [CakeId] int NOT NULL,
        [Quantity] int NOT NULL,
        [UnitPrice] decimal(18,2) NOT NULL,
        [Subtotal] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_OrderItems] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_OrderItems_Cakes_CakeId] FOREIGN KEY ([CakeId]) REFERENCES [Cakes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_OrderItems_Orders_OrderId] FOREIGN KEY ([OrderId]) REFERENCES [Orders] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Cakes_CategoryId] ON [Cakes] ([CategoryId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CartItems_CakeId] ON [CartItems] ([CakeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_CartItems_CartId] ON [CartItems] ([CartId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Carts_UserId] ON [Carts] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_CakeId] ON [OrderItems] ([CakeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_OrderItems_OrderId] ON [OrderItems] ([OrderId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Orders_UserId] ON [Orders] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260908143416_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260908143416_InitialCreate', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260910150610_AddCartAndCartItems'
)
BEGIN
    ALTER TABLE [CartItems] ADD [Quantity] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260910150610_AddCartAndCartItems'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260910150610_AddCartAndCartItems', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260911000115_AddToOrderAndOrderItems'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260911000115_AddToOrderAndOrderItems', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260915135449_AddPhoneNumberToOrder'
)
BEGIN
    DECLARE @var nvarchar(max);
    SELECT @var = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Orders]') AND [c].[name] = N'UserId');
    IF @var IS NOT NULL EXEC(N'ALTER TABLE [Orders] DROP CONSTRAINT ' + @var + ';');
    ALTER TABLE [Orders] ALTER COLUMN [UserId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260915135449_AddPhoneNumberToOrder'
)
BEGIN
    ALTER TABLE [Orders] ADD [CustomerName] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260915135449_AddPhoneNumberToOrder'
)
BEGIN
    ALTER TABLE [Orders] ADD [PhoneNumber] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260915135449_AddPhoneNumberToOrder'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260915135449_AddPhoneNumberToOrder', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916063501_AddPhoneVerification'
)
BEGIN
    CREATE TABLE [PhoneVerifications] (
        [Id] int NOT NULL IDENTITY,
        [PhoneNumber] nvarchar(max) NOT NULL,
        [OtpHash] nvarchar(max) NOT NULL,
        [ExpiresAt] datetime2 NOT NULL,
        [IsVerified] bit NOT NULL,
        [Attempts] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_PhoneVerifications] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260916063501_AddPhoneVerification'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260916063501_AddPhoneVerification', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917104641_AddCakeCustomizations'
)
BEGIN
    CREATE TABLE [CakeCustomizations] (
        [Id] int NOT NULL IDENTITY,
        [CakeId] int NOT NULL,
        [UserId] int NULL,
        [GuestId] nvarchar(max) NULL,
        [Occassion] nvarchar(max) NULL,
        [BaseShape] nvarchar(max) NULL,
        [TierCount] int NOT NULL,
        [Flavor] nvarchar(max) NULL,
        [BaseColor] nvarchar(max) NULL,
        [Message] nvarchar(max) NULL,
        [CanvasData] nvarchar(max) NULL,
        [PreviewImageUrl] nvarchar(max) NULL,
        [TotalPrice] decimal(18,2) NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_CakeCustomizations] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeCustomizations_Cakes_CakeId] FOREIGN KEY ([CakeId]) REFERENCES [Cakes] ([Id]) ON DELETE NO ACTION,
        CONSTRAINT [FK_CakeCustomizations_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917104641_AddCakeCustomizations'
)
BEGIN
    CREATE INDEX [IX_CakeCustomizations_CakeId] ON [CakeCustomizations] ([CakeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917104641_AddCakeCustomizations'
)
BEGIN
    CREATE INDEX [IX_CakeCustomizations_UserId] ON [CakeCustomizations] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917104641_AddCakeCustomizations'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260917104641_AddCakeCustomizations', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917110602_RenameOccassionToOccasion'
)
BEGIN
    EXEC sp_rename N'[CakeCustomizations].[Occassion]', N'Occasion', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917110602_RenameOccassionToOccasion'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260917110602_RenameOccassionToOccasion', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917171133_AddDecorationSystem'
)
BEGIN
    CREATE TABLE [Decorations] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NULL,
        [ImageUrl] nvarchar(max) NULL,
        [price] decimal(18,2) NOT NULL,
        [Occasion] nvarchar(max) NULL,
        [IsActive] bit NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_Decorations] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917171133_AddDecorationSystem'
)
BEGIN
    CREATE TABLE [CakeCustomizationDecoration] (
        [Id] int NOT NULL IDENTITY,
        [CakeCustomizationId] int NOT NULL,
        [DecorationId] int NOT NULL,
        [PositionX] decimal(18,2) NOT NULL,
        [PositionY] decimal(18,2) NOT NULL,
        [Scale] decimal(18,2) NOT NULL,
        [Rotation] decimal(18,2) NOT NULL,
        [Layer] int NOT NULL,
        [Quantity] int NOT NULL,
        [Price] decimal(18,2) NOT NULL,
        CONSTRAINT [PK_CakeCustomizationDecoration] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeCustomizationDecoration_CakeCustomizations_CakeCustomizationId] FOREIGN KEY ([CakeCustomizationId]) REFERENCES [CakeCustomizations] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_CakeCustomizationDecoration_Decorations_DecorationId] FOREIGN KEY ([DecorationId]) REFERENCES [Decorations] ([Id]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917171133_AddDecorationSystem'
)
BEGIN
    CREATE INDEX [IX_CakeCustomizationDecoration_CakeCustomizationId] ON [CakeCustomizationDecoration] ([CakeCustomizationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917171133_AddDecorationSystem'
)
BEGIN
    CREATE INDEX [IX_CakeCustomizationDecoration_DecorationId] ON [CakeCustomizationDecoration] ([DecorationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260917171133_AddDecorationSystem'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260917171133_AddDecorationSystem', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    EXEC sp_rename N'[Decorations].[price]', N'Price', 'COLUMN';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    DECLARE @var1 nvarchar(max);
    SELECT @var1 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CakeCustomizationDecoration]') AND [c].[name] = N'Scale');
    IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [CakeCustomizationDecoration] DROP CONSTRAINT ' + @var1 + ';');
    ALTER TABLE [CakeCustomizationDecoration] ALTER COLUMN [Scale] decimal(10,4) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    DECLARE @var2 nvarchar(max);
    SELECT @var2 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CakeCustomizationDecoration]') AND [c].[name] = N'Rotation');
    IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [CakeCustomizationDecoration] DROP CONSTRAINT ' + @var2 + ';');
    ALTER TABLE [CakeCustomizationDecoration] ALTER COLUMN [Rotation] decimal(10,4) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    DECLARE @var3 nvarchar(max);
    SELECT @var3 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CakeCustomizationDecoration]') AND [c].[name] = N'PositionY');
    IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [CakeCustomizationDecoration] DROP CONSTRAINT ' + @var3 + ';');
    ALTER TABLE [CakeCustomizationDecoration] ALTER COLUMN [PositionY] decimal(10,2) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    DECLARE @var4 nvarchar(max);
    SELECT @var4 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CakeCustomizationDecoration]') AND [c].[name] = N'PositionX');
    IF @var4 IS NOT NULL EXEC(N'ALTER TABLE [CakeCustomizationDecoration] DROP CONSTRAINT ' + @var4 + ';');
    ALTER TABLE [CakeCustomizationDecoration] ALTER COLUMN [PositionX] decimal(10,2) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260918015509_ConfigureDecimalprecision'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260918015509_ConfigureDecimalprecision', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260922082916_AddCakeDesigns'
)
BEGIN
    CREATE TABLE [CakeDesigns] (
        [Id] int NOT NULL IDENTITY,
        [CakeId] int NOT NULL,
        [UserId] int NULL,
        [OrderId] int NULL,
        [Message] nvarchar(max) NOT NULL,
        [Font] nvarchar(max) NOT NULL,
        [Tiers] int NOT NULL,
        [Sponge] nvarchar(max) NOT NULL,
        [Frosting] nvarchar(max) NOT NULL,
        [Pen] nvarchar(max) NOT NULL,
        [Candles] int NOT NULL,
        [Lit] bit NOT NULL,
        [Sprinkles] bit NOT NULL,
        [Cherries] bit NOT NULL,
        [Drips] bit NOT NULL,
        [Seed] bigint NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        [UpdatedAt] datetime2 NULL,
        CONSTRAINT [PK_CakeDesigns] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeDesigns_Cakes_CakeId] FOREIGN KEY ([CakeId]) REFERENCES [Cakes] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260922082916_AddCakeDesigns'
)
BEGIN
    CREATE INDEX [IX_CakeDesigns_CakeId] ON [CakeDesigns] ([CakeId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260922082916_AddCakeDesigns'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260922082916_AddCakeDesigns', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260922152217_AddDesignTypeToCake'
)
BEGIN
    ALTER TABLE [Cakes] ADD [DesignType] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260922152217_AddDesignTypeToCake'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260922152217_AddDesignTypeToCake', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE TABLE [CakeTemplates] (
        [Id] int NOT NULL IDENTITY,
        [Name] nvarchar(max) NOT NULL,
        [Description] nvarchar(max) NOT NULL,
        [Category] nvarchar(max) NOT NULL,
        [IsPopular] bit NOT NULL,
        [Tiers] int NOT NULL,
        [BasePrice] decimal(18,2) NOT NULL,
        [MinPrepHours] int NOT NULL,
        [MaxPrepHours] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL,
        CONSTRAINT [PK_CakeTemplates] PRIMARY KEY ([Id])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE TABLE [CakeTemplateColors] (
        [Id] int NOT NULL IDENTITY,
        [CakeTemplateId] int NOT NULL,
        [ColorName] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_CakeTemplateColors] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeTemplateColors_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE TABLE [CakeTemplateFeatures] (
        [Id] int NOT NULL IDENTITY,
        [CakeTemplateId] int NOT NULL,
        [FeatureName] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_CakeTemplateFeatures] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeTemplateFeatures_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE TABLE [CakeTemplateImages] (
        [Id] int NOT NULL IDENTITY,
        [CakeTemplateId] int NOT NULL,
        [ImageUrl] nvarchar(max) NOT NULL,
        [ImageType] nvarchar(max) NOT NULL,
        CONSTRAINT [PK_CakeTemplateImages] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeTemplateImages_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE TABLE [CakeTemplateSizes] (
        [Id] int NOT NULL IDENTITY,
        [CakeTemplateId] int NOT NULL,
        [SizeInInches] int NOT NULL,
        CONSTRAINT [PK_CakeTemplateSizes] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeTemplateSizes_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE INDEX [IX_CakeTemplateColors_CakeTemplateId] ON [CakeTemplateColors] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE INDEX [IX_CakeTemplateFeatures_CakeTemplateId] ON [CakeTemplateFeatures] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE INDEX [IX_CakeTemplateImages_CakeTemplateId] ON [CakeTemplateImages] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    CREATE INDEX [IX_CakeTemplateSizes_CakeTemplateId] ON [CakeTemplateSizes] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260925064044_AddCakeTemplates'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260925064044_AddCakeTemplates', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260926070621_AddUniqueTemplateName'
)
BEGIN
    DECLARE @var5 nvarchar(max);
    SELECT @var5 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[CakeTemplates]') AND [c].[name] = N'Name');
    IF @var5 IS NOT NULL EXEC(N'ALTER TABLE [CakeTemplates] DROP CONSTRAINT ' + @var5 + ';');
    ALTER TABLE [CakeTemplates] ALTER COLUMN [Name] nvarchar(450) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260926070621_AddUniqueTemplateName'
)
BEGIN
    CREATE UNIQUE INDEX [IX_CakeTemplates_Name] ON [CakeTemplates] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260926070621_AddUniqueTemplateName'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260926070621_AddUniqueTemplateName', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260926110751_AddColorHexToTemplateColors'
)
BEGIN
    ALTER TABLE [CakeTemplateColors] ADD [ColorHex] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260926110751_AddColorHexToTemplateColors'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260926110751_AddColorHexToTemplateColors', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927091434_AddDecorationName'
)
BEGIN
    DECLARE @var6 nvarchar(max);
    SELECT @var6 = QUOTENAME([d].[name])
    FROM [sys].[default_constraints] [d]
    INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
    WHERE ([d].[parent_object_id] = OBJECT_ID(N'[Decorations]') AND [c].[name] = N'Name');
    IF @var6 IS NOT NULL EXEC(N'ALTER TABLE [Decorations] DROP CONSTRAINT ' + @var6 + ';');
    ALTER TABLE [Decorations] ALTER COLUMN [Name] nvarchar(100) NOT NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927091434_AddDecorationName'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Decorations_Name] ON [Decorations] ([Name]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260927091434_AddDecorationName'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260927091434_AddDecorationName', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928045209_AddTierCountToTemplateImage'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260928045209_AddTierCountToTemplateImage', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    ALTER TABLE [CakeDesigns] ADD [TemplateId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    ALTER TABLE [CakeDesigns] ADD [TotalPrice] decimal(18,2) NOT NULL DEFAULT 0.0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    CREATE TABLE [CakeDesignDecoration] (
        [Id] int NOT NULL IDENTITY,
        [CakeDesignId] int NOT NULL,
        [DecorationId] int NOT NULL,
        [Quantity] int NOT NULL,
        CONSTRAINT [PK_CakeDesignDecoration] PRIMARY KEY ([Id]),
        CONSTRAINT [FK_CakeDesignDecoration_CakeDesigns_CakeDesignId] FOREIGN KEY ([CakeDesignId]) REFERENCES [CakeDesigns] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [FK_CakeDesignDecoration_Decorations_DecorationId] FOREIGN KEY ([DecorationId]) REFERENCES [Decorations] ([Id]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    CREATE INDEX [IX_CakeDesigns_TemplateId] ON [CakeDesigns] ([TemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    CREATE INDEX [IX_CakeDesignDecoration_CakeDesignId] ON [CakeDesignDecoration] ([CakeDesignId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    CREATE INDEX [IX_CakeDesignDecoration_DecorationId] ON [CakeDesignDecoration] ([DecorationId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    ALTER TABLE [CakeDesigns] ADD CONSTRAINT [FK_CakeDesigns_CakeTemplates_TemplateId] FOREIGN KEY ([TemplateId]) REFERENCES [CakeTemplates] ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928155245_AddDecimalPrecision'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260928155245_AddDecimalPrecision', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecoration] DROP CONSTRAINT [FK_CakeDesignDecoration_CakeDesigns_CakeDesignId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecoration] DROP CONSTRAINT [FK_CakeDesignDecoration_Decorations_DecorationId];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecoration] DROP CONSTRAINT [PK_CakeDesignDecoration];
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    EXEC sp_rename N'[CakeDesignDecoration]', N'CakeDesignDecorations', 'OBJECT';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    EXEC sp_rename N'[CakeDesignDecorations].[IX_CakeDesignDecoration_DecorationId]', N'IX_CakeDesignDecorations_DecorationId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    EXEC sp_rename N'[CakeDesignDecorations].[IX_CakeDesignDecoration_CakeDesignId]', N'IX_CakeDesignDecorations_CakeDesignId', 'INDEX';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesigns] ADD [ColorId] nvarchar(max) NOT NULL DEFAULT N'';
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesigns] ADD [Size] int NOT NULL DEFAULT 0;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecorations] ADD CONSTRAINT [PK_CakeDesignDecorations] PRIMARY KEY ([Id]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecorations] ADD CONSTRAINT [FK_CakeDesignDecorations_CakeDesigns_CakeDesignId] FOREIGN KEY ([CakeDesignId]) REFERENCES [CakeDesigns] ([Id]) ON DELETE CASCADE;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    ALTER TABLE [CakeDesignDecorations] ADD CONSTRAINT [FK_CakeDesignDecorations_Decorations_DecorationId] FOREIGN KEY ([DecorationId]) REFERENCES [Decorations] ([Id]) ON DELETE NO ACTION;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260928165706_AddSizeAndColorIdToCakeDesign'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260928165706_AddSizeAndColorIdToCakeDesign', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [OrderItems] ADD [CakeTemplateId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [OrderItems] ADD [CustomizationJson] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [CartItems] ADD [CakeTemplateId] int NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [CartItems] ADD [CustomUnitPrice] decimal(18,2) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [CartItems] ADD [CustomizationJson] nvarchar(max) NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    CREATE INDEX [IX_OrderItems_CakeTemplateId] ON [OrderItems] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    CREATE INDEX [IX_CartItems_CakeTemplateId] ON [CartItems] ([CakeTemplateId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [CartItems] ADD CONSTRAINT [FK_CartItems_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE SET NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    ALTER TABLE [OrderItems] ADD CONSTRAINT [FK_OrderItems_CakeTemplates_CakeTemplateId] FOREIGN KEY ([CakeTemplateId]) REFERENCES [CakeTemplates] ([Id]) ON DELETE SET NULL;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929060453_AddCustomizationToCartAndOrderItems'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260929060453_AddCustomizationToCartAndOrderItems', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260929082415_AddCartCustomization'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260929082415_AddCartCustomization', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260930042211_AddCakeId'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260930042211_AddCakeId', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260930055706_SyncModels'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260930055706_SyncModels', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20260930135341_CheckOrderItemCustomization'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20260930135341_CheckOrderItemCustomization', N'10.0.11');
END;

COMMIT;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005055821_AddCakeFlags'
)
BEGIN
    ALTER TABLE [Cakes] ADD [IsBestSeller] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005055821_AddCakeFlags'
)
BEGIN
    ALTER TABLE [Cakes] ADD [IsFeatured] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005055821_AddCakeFlags'
)
BEGIN
    ALTER TABLE [Cakes] ADD [IsTrending] bit NOT NULL DEFAULT CAST(0 AS bit);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261005055821_AddCakeFlags'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261005055821_AddCakeFlags', N'10.0.11');
END;

COMMIT;
GO

