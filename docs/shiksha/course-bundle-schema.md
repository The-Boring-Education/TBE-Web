# Course Bundle Schema Reference

A **Course Bundle** is the JSON document that fully describes one Shiksha course
and all of its chapters. It is the contract shared by the Admin Course Builder,
the generation agent and community contributors opening a pull request.

Community contributions live in [`content/shiksha/`](../../content/shiksha),
one file per course slug, named `<course-slug>.json`.

> **Merging does not publish.** When your pull request is merged the file simply
> lands in the repository. An admin imports the Bundle and publishes the course
> as a separate, later decision. Nothing appears on the site because your pull
> request was merged.

## Contributing flow

1. Open a **📚 Shiksha Content Contribution** issue from the
   [issue form](https://github.com/The-Boring-Education/TBE-Web/issues/new/choose).
   It captures the course or chapter you propose, your outline and your GitHub
   handle, and carries the `shiksha-content` label so content proposals triage
   separately from code.
2. Once the proposal is accepted, add or edit `content/shiksha/<slug>.json`.
3. Run `pnpm validate:course-bundles` locally.
4. Open a pull request. CI validates every Bundle file and reports field-level
   errors directly in the job output.

## Schema

The Bundle carries `schemaVersion`, a `course` object and a non-empty
`chapters` array.

| Field           | Type     | Required | Notes                           |
| --------------- | -------- | -------- | ------------------------------- |
| `schemaVersion` | string   | yes      | Must be `"shiksha-course@1"`    |
| `course`        | object   | yes      | Course metadata, see below      |
| `chapters`      | object[] | yes      | At least one chapter, see below |

### `course`

| Field           | Type     | Required | Notes                                                                         |
| --------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `slug`          | string   | yes      | Lowercase words separated by single hyphens. Must match the file name.        |
| `title`         | string   | yes      | Course title                                                                  |
| `description`   | string   | yes      | Short description shown on the course card                                    |
| `coverImageURL` | string   | yes      | Absolute URL of the cover image                                               |
| `meta`          | string   | no       | Extra metadata                                                                |
| `roadmap`       | string   | yes      | One of `Frontend`, `Backend`, `Fullstack`, `Tech`, `DSA`, `AI`, `Data`, `GTM` |
| `difficulty`    | string   | yes      | One of `Beginner`, `Intermediate`, `Advanced`                                 |
| `isPremium`     | boolean  | no       | Defaults to free                                                              |
| `price`         | number   | no       | Non-negative; required and greater than 0 when `isPremium` is `true`          |
| `features`      | string[] | no       | Non-empty strings                                                             |
| `credits`       | object[] | no       | See [Credits](#credits)                                                       |

The course lifecycle status is deliberately **not** part of the Bundle:
publishing is an operational decision, not content, so importing a correction
can never accidentally publish or unpublish a course.

### `chapters[]`

| Field        | Type     | Required | Notes                                                                               |
| ------------ | -------- | -------- | ----------------------------------------------------------------------------------- |
| `chapterKey` | string   | yes      | Lowercase words separated by single hyphens, unique within the Bundle, never reused |
| `title`      | string   | yes      | Chapter title                                                                       |
| `content`    | string   | yes      | Chapter body as Markdown                                                            |
| `isOptional` | boolean  | no       | Marks the chapter as optional                                                       |
| `credits`    | object[] | no       | See [Credits](#credits)                                                             |

Chapters are rendered in array order.

### Credits

A Credit is how a contributor records authorship inside the Bundle. Add
yourself to `course.credits` when you wrote or shaped the whole course, and to
the `credits` of each chapter you wrote. Credits are verifiable because the file
arrives as a pull request and git history records who wrote it.

| Field          | Type   | Required | Notes                                              |
| -------------- | ------ | -------- | -------------------------------------------------- |
| `githubHandle` | string | yes      | Your GitHub handle, without the `@`                |
| `displayName`  | string | yes      | The name you want shown                            |
| `role`         | string | yes      | One of `AUTHOR`, `CO_AUTHOR`, `REVIEWER`, `EDITOR` |

Avatars are derived from the GitHub handle at render time and are never stored.

## Worked example

A complete, valid, two-chapter Bundle. Saved as
`content/shiksha/intro-to-git.json`:

````json
{
  "schemaVersion": "shiksha-course@1",
  "course": {
    "slug": "intro-to-git",
    "title": "Introduction to Git",
    "description": "Learn the handful of Git commands you actually use every day.",
    "coverImageURL": "https://cdn.theboringeducation.com/courses/intro-to-git.png",
    "roadmap": "Tech",
    "difficulty": "Beginner",
    "isPremium": false,
    "features": ["Two short chapters", "Hands-on commands"],
    "credits": [
      {
        "githubHandle": "imsks",
        "displayName": "Sachin Kumar",
        "role": "AUTHOR"
      }
    ]
  },
  "chapters": [
    {
      "chapterKey": "why-version-control",
      "title": "Why Version Control",
      "content": "# Why Version Control\n\nVersion control records every change to your code so you can see what changed, when, and why — and undo it when you need to.\n\n- **History**: every commit is a checkpoint you can return to.\n- **Collaboration**: several people can work on the same project without overwriting each other.\n",
      "credits": [
        {
          "githubHandle": "imsks",
          "displayName": "Sachin Kumar",
          "role": "AUTHOR"
        }
      ]
    },
    {
      "chapterKey": "your-first-commit",
      "title": "Your First Commit",
      "content": "# Your First Commit\n\n```bash\ngit init\ngit add README.md\ngit commit -m \"Add README\"\n```\n\n`git init` creates the repository, `git add` stages the file and `git commit` records it in history.\n",
      "isOptional": false,
      "credits": [
        {
          "githubHandle": "imsks",
          "displayName": "Sachin Kumar",
          "role": "AUTHOR"
        }
      ]
    }
  ]
}
````

## Validation

Validate locally before opening your pull request:

```bash
pnpm validate:course-bundles
# or a single file
pnpm validate:course-bundles content/shiksha/intro-to-git.json
```

The `📚 Validate Course Bundles` workflow runs the same validator on every pull
request that changes a file under `content/shiksha/`, and only then. An invalid
Bundle fails the job with the field-level errors printed in the output, for
example:

```
❌ content/shiksha/intro-to-git.json
   - course.roadmap: course.roadmap must be one of Frontend, Backend, Fullstack, Tech, DSA, AI, Data, GTM
   - chapters[1].title: chapters[1].title is required
```
