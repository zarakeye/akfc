-- Demande au parent référent de renseigner, corriger ou effacer la date de naissance d'un mineur.
CREATE TABLE "BirthDateRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "sentTo" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BirthDateRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BirthDateRequest_userId_key" ON "BirthDateRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BirthDateRequest_tokenHash_key" ON "BirthDateRequest"("tokenHash");

-- CreateIndex
CREATE INDEX "BirthDateRequest_expiresAt_idx" ON "BirthDateRequest"("expiresAt");

-- AddForeignKey
ALTER TABLE "BirthDateRequest" ADD CONSTRAINT "BirthDateRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
