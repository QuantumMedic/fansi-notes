> Current status: PR #9 contains all 48 author-authorized, previously published Vocus articles, pending author review/merge. For remaining website work, follow docs/WEBSITE_COMPLETION_SOP.md and the latest docs/CURRENT_STATE.md. No implicit permission to merge, deploy, publish new works, import images, or enable paid services.

# Codex Agent Instructions — Fansi Notes

This is a Traditional Chinese author/podcast portfolio site. At task start read `docs/CURRENT_STATE.md`, `docs/WEBSITE_COMPLETION_SOP.md`, and only the files or approved references directly relevant to the requested work. Consult `README_從這裡開始.md` when architecture/context is actually needed. Do NOT reread every `docs/*.md` or all historical articles by default. Follow the author's latest instruction over the documents. The `reference/` material is historical only.

## Required source hierarchy and fast workflow
Latest explicit author request > creator SOP v4.1 and taxonomy/sync spec v1.0 for content rights/classification > docs/WEBSITE_COMPLETION_SOP.md for website implementation > docs/CURRENT_STATE.md for current progress > docs/review/m5c/DECISION_GATE.md and INPUT_GAPS.json for pending data > legacy documents only for specific context. Old M5/M6 numbering is historical: current M6=deployment; legacy M6 private studio=M7 optional.

Only read current-stage files and necessary source indices; avoid rereading 48 article bodies, long archive docs or Canva designs. Review manifests do not grant approval. Docs-only changes need no visual screenshots; one cross-site regression at M5-F. No reader experience requiring GitHub login as the only comment path.

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

## Mandatory product-owner decision gate (for every task and every "this looks wrong" report)
Do not treat a new observation, suggestion, or question from the author as automatic permission to redesign or reprioritize. Apply these checks **before** proposing work, editing code, or preparing a Codex handoff:

1. **Read live truth, not recollection:** inspect the relevant current branch/PR, `docs/CURRENT_STATE.md`, `docs/WEBSITE_COMPLETION_SOP.md`, and affected components or manifests. Do not assume a previously uploaded chat file or generated link exists in the repository.
2. **Classify the observation:** (A) already implemented and verified; (B) defect against current-stage acceptance criteria; (C) already planned in a later phase; (D) awaiting author-approved source/data/rights; (E) genuinely new requirement; (F) final visual/content polish. Cite the specific phase and evidence, and explicitly recommend **fix now / implement in its planned phase / defer for final polish / do not implement**. Explain important dependencies or waste.
3. **Independently choose the method:** prefer the least-work durable approach, with approved public website data versioned in this repository and sensitive/raw analytics outside it. Determine the appropriate tool and storage without asking the author to choose ZIP vs GitHub. If a file lives only in ChatGPT, verify Codex can actually read an explicitly attached package before claiming handoff is complete.
4. **Check concurrent work:** confirm branches and in-flight PR scopes before writing. Do not change a branch or files another agent is actively editing; use an isolated scoped PR or defer until the active work lands. Never overwrite author changes to designs, articles, or data.
5. **Define done before claiming done:** enumerate inputs, output locations, dependencies, acceptance tests, screenshots when UI changes, and the exact authorization boundary. `ready to hand off` means inputs physically accessible to the receiving agent; `implemented` means changed code checked; `done` means acceptance criteria verified. An accepted task or passing CI alone is not a complete feature.
6. **Don't outsource judgment to the author:** present the preferred path and its rationale, flag material trade-offs and required author decisions only (authorship, permissions, privacy, costs, public release). Avoid repeated confirmations of known constraints or questions already answered.

**Phase map, to be checked against live state rather than assumed as completed:** M5-C = source/mapping/rights approval; M5-D = article and Podcast cards, filters, rankings, links and approved inline images; M5-E = real publications/novels, author data, contact/comments/analytics decisions and integration; M5-F = single full-site acceptance sweep; M6 = separately approved launch and synchronization; M7 = optional private studio. A feature intentionally scheduled for M5-E is not a defect in an unfinished M5-D preview. Distinguish missing implementation from a current bug and late visual polish.

**Data and metric precision:** cross-platform versions of the same work may differ in title or presentation and one work may map to multiple IG posts. Use validated work IDs/URLs, do not invent or re-crawl approved matches. Podcast first-seven-day plays-plus-downloads is distinct from Spotify-only Plays; never relabel either measure. Public popularity is a dated snapshot, not live data.

**At the end of a scoped PR:** update the authoritative current-state board with what is implemented, what was verified, what is blocked, what remains intentionally scheduled later, and next dependency; never silently mark an entire phase complete based only on partial components.
