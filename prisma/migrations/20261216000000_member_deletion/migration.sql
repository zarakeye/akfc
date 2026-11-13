-- Supprimer un membre ne doit plus être bloqué par sa vie sur le site.
-- Réactions, votes et préférences partent avec lui ; ses posts, commentaires et médias
-- restent, sans auteur. Discipline, séminaire et évènement gardent leur RESTRICT : ce sont
-- des données du club, que l'administrateur réattribue d'abord.

-- Posts : auteur facultatif, détaché à la suppression.
ALTER TABLE "Post" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Commentaires : auteur facultatif, détaché à la suppression (« Ancien membre »).
ALTER TABLE "Comment" ALTER COLUMN "authorId" DROP NOT NULL;
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Médias : téléverseur facultatif, détaché à la suppression.
ALTER TABLE "MediaAsset" ALTER COLUMN "uploaderUserId" DROP NOT NULL;
ALTER TABLE "MediaAsset" DROP CONSTRAINT "MediaAsset_uploaderUserId_fkey";
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_uploaderUserId_fkey" FOREIGN KEY ("uploaderUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Réactions, votes, préférences : effacés avec le membre.
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_userId_fkey";
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_userId_fkey";
ALTER TABLE "PollVote" ADD CONSTRAINT "PollVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Preferences" DROP CONSTRAINT "Preferences_userId_fkey";
ALTER TABLE "Preferences" ADD CONSTRAINT "Preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
