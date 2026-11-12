# Shiksha Course Bundles

Each file in this directory is a **Course Bundle**: the versioned JSON document
that fully describes one Shiksha course and all of its chapters. There is one
file per course slug, named `<course-slug>.json`.

- Schema reference and a complete worked example:
  [`docs/shiksha/course-bundle-schema.md`](../../docs/shiksha/course-bundle-schema.md)
- Validate your file before opening a pull request:
  `pnpm validate:course-bundles`

Merging a Course Bundle has **no learner-facing effect**. An admin imports and
publishes the course separately.
