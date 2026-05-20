# Registry Data

Generated catalog data for the website.

Run:

```bash
pnpm generate:registry
```

The generator reads every `skills/*/package.json` file and writes:

- `registry/index.json`
- `registry/skills/<short-name>.json`
