CREATE TABLE events (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    club VARCHAR NOT NULL,

    fest INTEGER NOT NULL,

    is_team_event BOOLEAN NOT NULL DEFAULT FALSE,
    min_team_size INTEGER,
    max_team_size INTEGER,

    fee INTEGER,
    payment_trigger payment_trigger NOT NULL,
    payment_round INTEGER,

    registration_end_time TIMESTAMP NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT events_fest_fk
        FOREIGN KEY (fest)
        REFERENCES fest(id)
);