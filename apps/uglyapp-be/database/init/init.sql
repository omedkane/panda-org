CREATE TABLE
  IF NOT EXISTS hash_mode (
    id INTEGER PRIMARY KEY,
    algo TEXT,
    rounds INTEGER NULL,
    salt TEXT NULL,
    isDefault BOOLEAN NULL
  );

INSERT INTO
  hash_mode
VALUES
  (1, 'bcrypt', 10, null, 1);
