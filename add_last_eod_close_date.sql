-- Add last_eod_close_date to accounts table
ALTER TABLE accounts
ADD COLUMN last_eod_close_date DATE DEFAULT NULL;
