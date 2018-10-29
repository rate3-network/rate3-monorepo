CREATE TABLE contracts (
  id                    serial                        PRIMARY KEY NOT NULL,
  contract_address      varchar(64)                   NOT NULL,
  block_number          int                           NOT NULL default 0,
  last_created          timestamp with time zone      NOT NULL DEFAULT current_timestamp,
  last_modified         timestamp with time zone      NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER contracts_modtime BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();
