> Current authorization: M5-B first batch, limited to the three explicitly authorized Vocus article texts listed in docs/CURRENT_STATE.md and necessary public-series display changes. No images, other works, merge, deployment, paid services or M6. Preserve all privacy/publication safeguards.

# Codex Agent Instructions — Fansi Notes

This is a Traditional Chinese author/podcast portfolio site. Read `README_從這裡開始.md` then every `docs/*.md` document before implementation. Follow the author's latest instruction over the documents. The `reference/` material is historical only.

## Non-negotiable safeguards
- Work ONLY in `QuantumMedic/fansi-notes`; do not alter other repositories or Canva designs.
- **Never commit unpublished manuscripts, podcast scripts, unpublished Canva assets, passwords or private contact data to this PUBLIC repository — including feature branches and pull requests.** Use obviously synthetic development fixtures instead.
- 'SOP completed' is NOT permission to publish. Publishing a work on the website requires explicit author approval.
- Do not write fictional biography, book publishing facts, quotations, article prose, experiences, social URLs, or endorsements as if real. Use placeholders.
- Instagram, Vocus, and Spotify are published manually by the author. Site ingestion and links only; do not post to platforms.
- Never match a podcast episode to an article solely by fuzzy title similarity. Use confirmed work_id ↔ RSS GUID mapping.
- Podcast long-form manuscript and IG/Vocus shared written master are separately approved; website article body uses only the approved written master.
- Maintain full Traditional Chinese support, accessible keyboard and mobile navigation, reduced-motion behavior, sensible static fallback.
- Keep changes in reviewable scoped PRs. For the first development request, do M0–M2 only; no production content import or live deployment without author authorization.

## Default stack
Astro static website, typed Content Collections, GitHub Actions, GitHub Pages project base `/fansi-notes/`, lightweight SVG/CSS interactions. Comments/forms require a separately selected hosted service and owner-controlled accounts. See documents for details and acceptance criteria.

## Required PR report
Scope; specification references; screenshots on desktop and mobile; keyboard/reduced-motion behavior; tests/build; remaining author decisions; check that no unapproved content was committed.