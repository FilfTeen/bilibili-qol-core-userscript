# Security Privacy Exposure Audit V0312

Date: 2026-05-28

Status update: 2026-06-10

Scope: public GitHub exposure audit for `FilfTeen/bilibili-qol-core-userscript`. This audit covers current local `main`, cached `origin/*` refs, tags, GitHub refs API, PR metadata/head-base commits, release assets, repository metadata, GitHub Pages status, and historical GitHub object accessibility.

This public report intentionally withholds private object IDs, private path indexes, support-ticket details, and sensitive source text. The complete GitHub Support purge records are stored outside this repository.

## Executive Verdict

- Closure status: `PASS - PRIVACY INCIDENT BLOCK CLOSED`.
- Current `main` / `origin/main` after remediation have no P2 local identity/path literals targeted by this scan.
- No private agent governance file is tracked in current `HEAD`, `origin/main`, remote branch heads, or tags scanned through local refs and GitHub refs API.
- GitHub Support confirmed garbage collection / cache clearance for the unreachable P1 exposure. Post-purge API verification found no accessible commit, tree, branches-where-head, or contents responses for the withheld private object set.
- Release assets scanned from all listed releases contain only userscript assets and no detected P0/P1/P2 exposure patterns.
- PR metadata for PRs #1-#4 is merged-only and the scanned PR head/base trees did not expose P1/P2 paths.
- No credential rotation indicated by this scan.

## Audit Coverage

Local Git checks:

- `git status --short --branch`
- `git rev-parse main origin/main v0.3.11`
- `git ls-files`
- `git ls-tree -r --name-only origin/main`
- `git for-each-ref --format='%(refname) %(objectname)' refs/remotes/origin refs/tags`
- `git rev-list --remotes=origin --tags --objects` path scans
- `git grep -nI -E ...` scans across `refs/remotes/origin` and `refs/tags`

Network/API checks:

- `gh repo view FilfTeen/bilibili-qol-core-userscript --json nameWithOwner,visibility,isPrivate,forkCount,defaultBranchRef`
- `gh pr list --state all --limit 200 --json number,title,state,url,headRefName,headRefOid,baseRefName,baseRefOid`
- `gh release list --limit 100`
- GitHub refs API for heads and tags
- GitHub commit API and contents API for the historical exposure objects
- GitHub releases API and downloaded release assets
- GitHub Pages API

Limitations:

- `git fetch --prune origin '+refs/heads/*:refs/remotes/origin/*' '+refs/tags/*:refs/tags/*'` failed due GitHub transport/network errors.
- `git ls-remote origin` failed due GitHub transport/network errors.
- The missing Git transport checks were cross-checked with GitHub refs API, which returned three branch heads and twelve tags matching local cached refs.

## Findings Table

| id | severity | location | reachable? | current tree? | GitHub API accessible? | remediation | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-001 | P1 Private Asset | Unreachable historical GitHub objects; exact object IDs and affected private path set withheld | No branch/tag/PR head reachability found | No | No after Support purge verification | GitHub Support purge completed; post-purge API checks return inaccessible for the withheld private object set | Closed |
| F-003 | P2 Local Identity / Path | `docs/FINAL_AUDIT_V039.md:43`; historical copies in `v0.3.10` and `v0.3.11` | Yes, historical tags retain old wording | No in current main | N/A for line-level API; historical tag files remain public through refs | Replaced literal local identity/workspace patterns with placeholders in current tree | Closed for current main; no emergency tag rewrite authorized |
| F-004 | P2 Local Identity / Path | `docs/V0312_LOCAL_LEARNING_SAMPLING_PLAN.md:852` | Was present in pre-remediation main | No in current main | N/A for line-level API | Replaced absolute repository path with `<repo-root>` | Closed |
| F-005 | P2 Local Identity / Path | `docs/V0312_MBGA_SAMPLING_PLAN.md:473` | Was present in pre-remediation main | No in current main | N/A for line-level API | Replaced absolute repository path with `<repo-root>` | Closed |
| F-006 | P3 Local Evidence Pointer | `README.md`, multiple `docs/*.md` files referencing ignored `output/` evidence, screenshots, and HAR names | Yes | Yes | Public through refs | No raw evidence files were tracked; `.gitignore` already ignores `output`; keep pointers abstract in future docs | Documented; optional docs sweep requires main-thread policy decision |

## Withheld P1 Exposure Details

Historical GitHub objects were retrievable through GitHub APIs even though no branch, tag, or PR head/base reachability was found in this audit.

The exact object IDs, affected private path set, and GitHub API evidence are intentionally withheld from this public report because they would help locate private governance material. The complete GitHub Support purge request and closure notes are stored outside this repository and do not include private file contents in public docs.

Post-purge verification summary:

- Commit API accessible responses: `0/2`.
- Git commit API accessible responses: `0/2`.
- Tree API accessible responses: `0/2`.
- Branches-where-head accessible responses: `0/2`.
- Contents API accessible responses for the withheld private path set: `0/24`.

## Current Ref Assessment

Remote heads from GitHub refs/API checks after closure:

- `refs/heads/main` -> `8216844f5dc12d81ccbdaaf37cd34c3c231434df`
- `refs/heads/codex/repo-rename-qol-core-migration` -> `5070c4d22d236b6fbc0447418d37884148d7f3ff`
- `refs/heads/codex/v0.3.7-qol-core-rc` -> `f3afdc1adcbd648aaec137a4ff1fac3c59395440`

Tags from GitHub refs API matched local cached tags:

- `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.3.1`, `v0.3.2`, `v0.3.5`, `v0.3.6`, `v0.3.7`, `v0.3.8`, `v0.3.9`, `v0.3.10`, `v0.3.11`

Reachable history conclusion after closure:

- P1 private governance paths were not detected in branch/tag reachable object path scans.
- P2 local identity/path literals are removed from current `main` / `origin/main`; historical tags `v0.3.10` and `v0.3.11` still contain old P2-only wording and are not being rewritten.
- No P0 credential pattern was detected by exact secret-pattern scans.

## PR, Release, Pages Assessment

PRs:

- PRs #1-#4 are merged.
- Head/base OID tree scans found no P1/P2 path exposure.
- Commit-to-PR API for the historical exposure objects returned no associated PRs.

Releases:

- Release assets from `v0.1.0` through `v0.3.11` were downloaded to a temporary directory and scanned.
- Assets are userscript `.user.js` files only.
- No P0/P1/P2 exposure patterns were detected in downloaded assets.

GitHub Pages:

- GitHub Pages API returned 404 Not Found, interpreted as no Pages site configured for this repository.

Repository metadata:

- Repo: `FilfTeen/bilibili-qol-core-userscript`
- Visibility: public
- `isPrivate`: false
- `forkCount`: 0
- Default branch: `main`

## False Positives

- `token` in commercial-intent rule data and comment-feedback one-time nonce code is P4 benign source token naming, not a credential.
- `authorization`, `cookie`, and related words in diagnostics sanitizer tests and docs are privacy-control assertions or fake test material, not live credentials.
- `node_modules` in `.gitignore` and `package-lock.json` is expected dependency metadata and is P4.
- `output/` references are P3 pointers to ignored local evidence directories; no actual `output/` evidence file path was found in `git rev-list --remotes=origin --tags --objects`.

## GitHub Support Purge Closure

The complete GitHub Support purge draft and closure notes are intentionally omitted from this public repository. They are stored outside this repository with the full object IDs, affected private path set, repository metadata, API accessibility evidence, support status notes, and screenshots.

Public summary: GitHub Support completed the requested cached view / dangling object cleanup. Post-purge API verification found the withheld private object set inaccessible. Do not include sensitive file contents or withheld object indexes in public docs or support summaries.

## Main Thread Closure Decision

Main-thread result:

- Privacy incident block is closed.
- No force push, tag rewrite, repository visibility change, release deletion, or credential rotation is required.
- Current `main` / `origin/main` remain docs-only governance / evidence state.
- Runtime release baseline remains `v0.3.11`; no v0.3.12 runtime release is authorized.
- Optional future cleanup: a separate P3 evidence-pointer docs sweep may further abstract `output/` references, but no tracked raw evidence files were found.
