CREATE TABLE stellar_identity_accounts_events (
  id                    serial                        PRIMARY KEY NOT NULL,
  contract_id           int                           NOT NULL REFERENCES contracts(id),
  event_name            text                          NOT NULL,
  identity_address      varchar(64)                   NOT NULL,
  account_address       varchar(64)                   NOT NULL,
  tx_hash               varchar(64)                   NOT NULL UNIQUE,
  block_number          int                           NOT NULL,
  tx_index              int                           NOT NULL,
  block_timestamp       timestamp with time zone      NOT NULL,
  last_created          timestamp with time zone      NOT NULL DEFAULT current_timestamp,
  last_modified         timestamp with time zone      NOT NULL DEFAULT current_timestamp
);

CREATE TRIGGER stellar_identity_accounts_events_modtime BEFORE UPDATE ON stellar_identity_accounts_events FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();
