CREATE TABLE link_requests (
  id                    serial                        PRIMARY KEY NOT NULL,
  received_payment_id   int                           NOT NULL REFERENCES stellar_received_payments(id),
  ethereum_address      varchar(64)                   NOT NULL,
  tx_hash               varchar(64)                   ,
  status                int                           NOT NULL default 0,
  remarks               text                          ,
  last_created          timestamp with time zone      NOT NULL DEFAULT current_timestamp,
  last_modified         timestamp with time zone      NOT NULL DEFAULT current_timestamp
);

CREATE UNIQUE INDEX link_requests_uniq_hash ON link_requests (tx_hash) WHERE tx_hash IS NOT NULL;
CREATE TRIGGER link_requests_modtime BEFORE UPDATE ON link_requests FOR EACH ROW EXECUTE PROCEDURE update_last_modified_column();
