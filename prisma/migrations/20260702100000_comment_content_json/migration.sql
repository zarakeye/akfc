-- Comment.content : String -> Json (table vide au moment de la migration,
-- le cast direct ::jsonb est sans danger)
ALTER TABLE "Comment" ALTER COLUMN "content" TYPE JSONB USING "content"::jsonb;
