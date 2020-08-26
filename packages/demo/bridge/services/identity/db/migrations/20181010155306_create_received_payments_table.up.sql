CREATE TABLE stellar_received_payments (
  id                serial                        PRIMARY KEY NOT NULL,
  to_account_id     int                           NOT NULL REFERENCES stellar_accounts(id),
  from_account      varchar(64)                   NOT NULL,
  payment_id        bigint                        NOT NULL default 0,
  tx_hash           varchar(64)                   NOT NULL,
  paging_token      varchar(64)                   NOT NULL UNIQUE,
  status            int                           NOT NULL default 0,
  memo_type         int                           NOT NULL default 0,
  memo              varchar(64)                   ,
  last_created      timestamp with time zone      NOT NULL DEFAULT current_timestamp,
  last_modified     timestamp with time zone      NOT NULL DEFAULT current_timestamp
);
CREATE UNIQUE INDEX stellar_received_payments_uniq_id ON stellar_received_payments (payment_id) WHERE payment_id != 0;
CREATE TRIGGER stellar_received_payments_modtime BEFORE UPDATE ON stellar_received_payments FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();
