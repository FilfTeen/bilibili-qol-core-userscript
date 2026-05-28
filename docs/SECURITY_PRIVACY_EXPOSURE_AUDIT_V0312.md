# Security Privacy Exposure Audit V0312

Date: 2026-05-28

Scope: public GitHub exposure audit for `FilfTeen/bilibili-qol-core-userscript`. This audit covers current local `main`, cached `origin/*` refs, tags, GitHub refs API, PR metadata/head-base commits, release assets, repository metadata, GitHub Pages status, and historical GitHub object accessibility.

This public report intentionally withholds private object IDs, private path indexes, and sensitive source text. The complete GitHub Support purge request is stored outside this repository.

## Executive Verdict

- Current local worktree after this remediation has no P2 local identity/path literals targeted by this scan.
- `origin/main` still contains the P2 literals until the docs-only scrub commit from this thread is pushed.
- No private agent governance file is tracked in current `HEAD`, `origin/main`, remote branch heads, or tags scanned through local refs and GitHub refs API.
- GitHub commit and contents APIs still expose P1 private governance material in unreachable GitHub objects. Details are withheld from this public report; the private purge request is stored outside this repository.
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
| F-001 | P1 Private Asset | Unreachable historical GitHub objects; exact object IDs and affected private path set withheld | No branch/tag/PR head reachability found | No | Yes, commit API and contents API | GitHub Support purge request required; private draft stored outside repo | Open, main-thread authorization required |
| F-003 | P2 Local Identity / Path | `docs/FINAL_AUDIT_V039.md:43`; historical copies in `v0.3.10` and `v0.3.11` | Yes, current `origin/main` and tags `v0.3.10`, `v0.3.11` | Yes before this commit | N/A for line-level API; file is public through refs | Replaced literal local identity/workspace patterns with placeholders in current tree | Fixed in local docs-only commit; tag history remains |
| F-004 | P2 Local Identity / Path | `docs/V0312_LOCAL_LEARNING_SAMPLING_PLAN.md:852` | Yes, current `origin/main` | Yes before this commit | N/A for line-level API; file is public through refs | Replaced absolute repository path with `<repo-root>` | Fixed in local docs-only commit; push required |
| F-005 | P2 Local Identity / Path | `docs/V0312_MBGA_SAMPLING_PLAN.md:473` | Yes, current `origin/main` | Yes before this commit | N/A for line-level API; file is public through refs | Replaced absolute repository path with `<repo-root>` | Fixed in local docs-only commit; push required |
| F-006 | P3 Local Evidence Pointer | `README.md`, multiple `docs/*.md` files referencing ignored `output/` evidence, screenshots, and HAR names | Yes | Yes | Public through refs | No raw evidence files were tracked; `.gitignore` already ignores `output`; keep pointers abstract in future docs | Documented; optional docs sweep requires main-thread policy decision |

## Withheld P1 Exposure Details

Historical GitHub objects remain retrievable through GitHub APIs even though no branch, tag, or PR head/base reachability was found in this audit.

The exact object IDs, affected private path set, and GitHub API evidence are intentionally withheld from this public report because they would help locate private governance material. The complete GitHub Support purge request is stored outside this repository and does not include private file contents.

## Current Ref Assessment

Remote heads from GitHub refs API:

- `refs/heads/main` -> `f8e38f17362a7245fcd06c2896ac5ed5a57f193e`
- `refs/heads/codex/repo-rename-qol-core-migration` -> `5070c4d22d236b6fbc0447418d37884148d7f3ff`
- `refs/heads/codex/v0.3.7-qol-core-rc` -> `f3afdc1adcbd648aaec137a4ff1fac3c59395440`

Tags from GitHub refs API matched local cached tags:

- `v0.1.0`, `v0.2.0`, `v0.3.0`, `v0.3.1`, `v0.3.2`, `v0.3.5`, `v0.3.6`, `v0.3.7`, `v0.3.8`, `v0.3.9`, `v0.3.10`, `v0.3.11`

Reachable history conclusion:

- P1 private governance paths were not detected in branch/tag reachable object path scans.
- P2 local identity/path literals were detected in `origin/main` and historical tags `v0.3.10` and `v0.3.11`.
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

## GitHub Support Purge Request

The complete GitHub Support purge draft is intentionally omitted from this public repository. It is stored outside this repository with the full object IDs, affected private path set, repository metadata, and API accessibility evidence needed for submission.

Public summary: request GitHub purge cached views, dangling/unreachable object access, and commit/tree/content API access for unreachable objects exposing private governance material. Do not include sensitive file contents in the support ticket.

## Main Thread Decision Points

1. Accept and push this docs-only scrub commit to remove current-tree P2 exposure from `main`.
2. Authorize submitting the private GitHub Support purge request for the unreachable P1 exposure objects.
3. Decide whether to rewrite historical tags `v0.3.10` and `v0.3.11` for P2-only local path wording. This audit does not recommend emergency tag rewrite absent P0/P1 reachability, but it remains a policy decision.
4. Decide whether to run a separate docs evidence-pointer sweep to further abstract P3 `output/` references in accepted evidence documents. No tracked raw evidence files were found.
