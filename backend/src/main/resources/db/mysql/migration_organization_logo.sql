USE academia_certa;

ALTER TABLE unidade_organizacional
    ADD COLUMN logo_mime_type VARCHAR(32) NULL,
    ADD COLUMN logo_data MEDIUMBLOB NULL,
    ADD COLUMN logo_atualizado_em DATETIME(6) NULL;
