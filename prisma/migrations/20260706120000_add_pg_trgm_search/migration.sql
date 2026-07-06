CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "User_username_trgm_idx"
    ON "User"
    USING GIN ("username" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_name_trgm_idx"
    ON "User"
    USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "User_email_trgm_idx"
    ON "User"
    USING GIN ("email" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Story_title_trgm_idx"
    ON "Story"
    USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Story_body_trgm_idx"
    ON "Story"
    USING GIN ("body" gin_trgm_ops);