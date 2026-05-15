# Security Policy

## Reporting

Do not open a public issue with private contract data, real customer details, access details, uploaded source documents, or local input files.

Use GitHub private security advisories for sensitive reports:

https://github.com/ubermensch1218/scopeguard-kr/security/advisories/new

## Public Repo Boundary

The repository is intended to contain source code, fictional samples, templates, and public documentation only.

Do not commit:

- real contract input files
- uploaded original documents
- generated HWP or ZIP files
- environment files
- access keys or service credentials
- private customer or project notes

Run this before opening a PR:

```bash
npm run audit:publish
```

## Scope

This project creates draft documents and check rules for SW outsourcing contracts. It does not provide legal advice, document custody, identity verification, payment escrow, or hosted storage assurances.

