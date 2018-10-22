CREATE TABLE stellar_accounts (
  id                serial                        PRIMARY KEY NOT NULL,
  address           varchar(64)                   NOT NULL,
  cursor            varchar(64)                   ,
  status            int                           NOT NULL default 0,
  last_created      timestamp with time zone      NOT NULL DEFAULT current_timestamp,
  last_modified     timestamp with time zone      NOT NULL DEFAULT current_timestamp,

  CONSTRAINT uniq_address UNIQUE(address)
);

CREATE OR REPLACE FUNCTION update_last_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_modified = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER stellar_accounts_modtime BEFORE UPDATE ON stellar_accounts FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();
