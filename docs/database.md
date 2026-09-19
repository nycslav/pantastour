# Database design

The first migration enables PostGIS and creates the `destinations` table. It stores API-facing
content, arrays for tags and cultural guidance, editorial ratings, premium visibility metadata,
and a canonical `geography(Point, 4326)` location.

Coordinates use `{ latitude, longitude }` at API boundaries. SQL creates points in longitude,
latitude order, and proximity queries use `ST_DWithin` and `ST_Distance` against geography values
so radius and distance calculations use meters.

Indexes include GiST for destination location, GIN for tags, and B-tree indexes for region and
island group. The JSON catalog remains the reproducible source for development seeding and the
automated-test fallback.

The second migration creates `itineraries`, `itinerary_days`, and `itinerary_stops`. Core itinerary
metadata and validated preferences live on the parent record, while ordered days and typed stops
are relational rows with cascading deletion. A future authentication migration can populate the
nullable `user_id` without changing the current Shipathon API contract.

The fourth migration records whether Gemini, OpenAI, or the deterministic fallback generated an
itinerary. The fifth migration adds an optional normalized Geoapify place reference to each stop,
including the provider ID, verified display data, and coordinates. A database constraint requires
all place fields to be present together, while generic transport or rest stops keep them null.

