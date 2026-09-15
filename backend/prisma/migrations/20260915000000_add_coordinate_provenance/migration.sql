ALTER TABLE "destinations"
ADD COLUMN "coordinate_source_url" TEXT,
ADD COLUMN "coordinates_verified_at" TIMESTAMP(3);
