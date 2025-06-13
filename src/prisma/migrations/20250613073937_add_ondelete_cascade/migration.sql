-- DropForeignKey
ALTER TABLE "PostHashtag" DROP CONSTRAINT "PostHashtag_hashtagId_fkey";

-- DropForeignKey
ALTER TABLE "PostHashtag" DROP CONSTRAINT "PostHashtag_postId_fkey";

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHashtag" ADD CONSTRAINT "PostHashtag_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
