DROP INDEX IF EXISTS link_requests_sender_nonce;
ALTER TABLE link_requests DROP COLUMN IF EXISTS sender_address;
ALTER TABLE link_requests DROP COLUMN IF EXISTS nonce;
