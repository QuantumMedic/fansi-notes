> Current status: PR #9 contains all 48 author-authorized, previously published Vocus articles, pending author review/merge. For remaining website work, follow docs/WEBSITE_COMPLETION_SOP.md and the latest docs/CURRENT_STATE.md. No implicit permission to merge, deploy, publish new works, import images, or enable paid services.

# Codex Agent Instructions — Fansi Notes

This is a Traditional Chinese author/podcast portfolio site. At task start read `docs/CURRENT_STATE.md`, `docs/WEBSITE_COMPLETION_SOP.md`, and only the files or approved references directly relevant to the requested work. Consult `README_從這裡開始.md` when architecture/context is actually needed. Do NOT reread every `docs/*.md` or all historical articles by default. Follow the author's latest instruction over the documents. The `reference/` material is historical only.

## Non-negotiable safeguards
- Work ONLY in `QuantumMedic/fansi-notes`; do not alter other repositories or Canva designs.
- **Never commit unpublished manuscripts, podcast scripts, unpublished Canva assets, passwords or private contact data to this PUBLIC repository — including feature branches and pull requests.** Use obviously synthetic development fixtures instead.
- 'SOP completed' is NOT permission to publish. Publishing a work on the website requires explicit author approval.
- Do not write fictional biography, book publishing facts, quotations, article prose, experiences, social URLs, or endorsements as if real. Use placeholders.
- Instagram, Vocus, and Spotify are published manually by the author. Site ingestion and links only; do not post to platforms.
- Never match a podcast episode to an article solely by fuzzy title similarity. Use confirmed work_id ↔ RSS GUID mapping.
- Podcast long-form manuscript and IG/Vocus shared written master are separately approved; website article body uses only the approved written master.
- Maintain full Traditional Chinese support, accessible keyboard and mobile navigation, reduced-motion behavior, sensible static fallback.
- Keep changes in reviewable scoped PRs, using the approved current stage. Import only content explicitly authorized for this public repository; never merge or deploy without separate author authorization.

## Default stack
Astro static website, typed Content Collections, GitHub Actions, GitHub Pages project base `/fansi-notes/`, lightweight SVG/CSS interactions. Comments/forms require a separately selected hosted service and owner-controlled accounts. See documents for details and acceptance criteria.

## Required PR report
Scope, changed files, required targeted tests, relevant CI/build result, remaining author decisions and authorization check. Include desktop/mobile screenshots and keyboard/reduced-motion testing only when the change affects UI/interactions; docs-only changes do not require visual retests. Run one complete cross-site regression at M5-F, not repeatedly at every intermediate step.