# Database

PantasTour uses PostgreSQL with PostGIS.

- `migrations/` contains immutable, ordered migrations.
- `seeds/` contains reproducible development and demo data.
- `scripts/` contains database maintenance and seed entry points.
- `schema.sql` is a generated or deliberately maintained schema snapshot, not a substitute for migrations.

The team must select one migration tool before creating the first application migration. Every migration requires review by another member.

