# Contributing to The Boring Education

Thank you for considering contributing to **The Boring Education**! We welcome contributions that help improve the project and make it more robust. Whether you're fixing a bug, improving documentation, or adding a new feature, your contribution is appreciated.

## Getting Started

To contribute to this project, follow these steps:

### 1. Fork the Repository

```
git clone git@github.com:The-Boring-Education/TBE-Web.git
cd TBE-Web
```

### 2. Install Dependencies

```
npm install
```

### 3. Set Up Environment Variables

You will need to create a .env.local file to configure the environment:

Copy the .env.example file to .env.local.
Update the values in the .env.local file with your MongoDB connection string and other relevant configuration.

### 4. Start the Development Server

```
npm run dev
```

For detailed contribution guidelines and documentation, please refer to our Notion page:
[Contribute to The Boring Education](https://theboringeducation.notion.site/Contribute-The-Boring-Education-8171f19257fd4ef99b7287555eb5062b?pvs=4).

## Contributing Shiksha Course Content

You do not need to write code to contribute. Course content is contributed as a
**Course Bundle** — a JSON file under `content/shiksha/`, one file per course
slug.

1. Open a **📚 Shiksha Content Contribution** issue to propose the course or
   chapter, share your outline and give your GitHub handle so you can be
   credited.
2. Write the Bundle and record your Credit inside it.
3. Run `pnpm validate:course-bundles` and open a pull request — CI validates
   every Bundle file and reports field-level errors in the job output.

Merging your pull request does **not** publish the course. The file simply
lands in the repository; an admin imports and publishes it separately.

Read the [Course Bundle schema reference](../../docs/shiksha/course-bundle-schema.md)
for the full schema and a complete worked example.
