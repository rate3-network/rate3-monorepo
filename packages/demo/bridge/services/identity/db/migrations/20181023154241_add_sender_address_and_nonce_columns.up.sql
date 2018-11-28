ALTER TABLE link_requests ADD COLUMN sender_address varchar(64);
ALTER TABLE link_requests ADD COLUMN nonce int;

CREATE UNIQUE INDEX link_requests_sender_nonce ON link_requests (sender_address, nonce) WHERE sender_address IS NOT NULL AND nonce IS NOT NULL;
