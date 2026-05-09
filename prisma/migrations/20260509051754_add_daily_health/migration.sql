-- CreateTable
CREATE TABLE "DailyHealth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "waterGlasses" INTEGER NOT NULL DEFAULT 0,
    "sleepHours" DOUBLE PRECISION,
    "movementLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyHealth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyHealth_userId_date_key" ON "DailyHealth"("userId", "date");

-- AddForeignKey
ALTER TABLE "DailyHealth" ADD CONSTRAINT "DailyHealth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
