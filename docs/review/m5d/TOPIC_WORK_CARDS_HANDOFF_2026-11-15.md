# M5-D 下一批｜主題、文章＋Podcast 統一作品卡與凡思維系列（2026-11-15）

**這是 Codex 唯一可直接執行的後續工作清單。所有已核准作品分類、配對、人氣、IG 連結、原文和主題重設修復均已合併至 GitHub `main`。開工前仍需重新查最新 `AGENTS.md`、`docs/CURRENT_STATE.md` 及實際分支／PR。不得重做已完成資料。**

## A｜目前已完成且應沿用（不再做資料研究）

- **48 篇核准網站文章**：正文、主次主題、原文與 work_id 不改。
- **25 集 Podcast 分類 confirmed**：`src/data/podcast-classifications.json`；**16 集**與書面同作品、**9 集 Podcast-only**。映射在 `src/data/podcast-work-map.json`，都已按作者委託分類決定、資料測試及 CI 通過。正式證據與決策見 `docs/review/m5c/PODCAST_MAPPING_APPROVAL_2026-11-15.md`。
- **預期 57 個獨立作品**＝48 篇文章 + 9 個 Podcast-only；25 集音訊與 48 篇文章各自仍完整可讀。這是作品總數，非「57 篇文章」。
- **PR #14 主題頁 reset 已修**：`src/components/WorkExplorer.astro` 已固定 `initialTopic`，清除篩選保留頁面主題；主題單欄、文章瀏覽雙欄保留。
- **PR #11** 已做文章卡片、熱門排序、47 篇 IG 主貼文＋2 則相關 IG 及文末平台按鈕。熱門 Podcast 為發布後首 7 天播放＋下載總數，不稱 Spotify-only Plays。
- 既有 `src/lib/classification.mjs` 的 `buildWorks` 和 `src/components/UnifiedWorkCard.astro` 本來就能按正式 work_id 去重，同作品有閱讀／收聽兩入口。**先抽查現成結果再考慮修改元件，不從零重寫。**

## B｜Codex 唯一需要的本輪改動

**1. 補齊「凡思維」的文章＋音訊系列入口（M5-D 缺陷／待辦）。**

目前 `/series/fansiwei/` 仍使用 `ArticleBrowser` 只展示文章，不含已核准的 Podcast-only 凡思維。以最小差異讓此系列頁使用核准 `catalog().works` 與統一作品卡呈現：
- 有文章也有 Podcast：同一卡片，兩個入口。
- 只有文章：閱讀入口。
- 只有 Podcast：收聽入口，不虛構全文。
- 系列只顯示 `fansiwei`；不讓其他 Podcast／主題混進來。
- 不改 `/series/stories/` 既有文章雙欄、不改 `/articles/` 的文章全文清單與熱門排序，不為故事類別添加假全文。
- 保留已有 canonical／舊路由重導向，按必要範圍調整單元測試，不要修改文章素材。

**2. 統一作品卡片的真實展示與互動驗收。**

主題頁 `/topics/[slug]/` 保持單欄；`/series/stories/` 與 `/articles/` 保持雙欄文章卡。不要為了欄數統一而改設計。重點檢查：
- 書面＋聲音同作品在主題探索只一張 `UnifiedWorkCard`，附「閱讀全文」與「收聽單集」，摘要可以反白複製。
- 文章-only 只見閱讀，Podcast-only 只見收聽；標籤與所屬主／次主題確實正確。
- 《Punch》是可核實的同作品兩版本；《鬼滅之刃 無限城篇》音訊主配〈韌性哲學〉，第二篇〈猗窩座的生命陰影〉保持獨立文章與既有 Podcast 外連，不能消失或被重複硬合併。
- 作者核准作品的文章分類與對應音訊共用；不得以舊 `proposed` 清冊覆蓋已正式 confirmed 的資料。
- 手機與桌機的標題、摘要、入口、標籤無溢出，鍵盤可操作。

**3. 主題頁 reset 回歸測試（應已修，不重開設計）。**

由文章頁點「心理與行為」→輸入搜尋→清除，仍只顯示心理與行為作品；「瀏覽其他主題」明確帶到主題總覽。不要在保留主題標題的頁面顯示跨類 57 個作品，亦不要再把過去的 73 當作現況。若 PR #14 正常，只補必要測試即可。

## C｜交付與驗收

- 使用當前 `main` 開**獨立小範圍 PR**，避免在舊分支或已合併 PR #13/#14/#15 繼續改。不得與 ChatGPT 的資料／素材分支同時改相同檔案。
- 優先小範圍單元測試；PR 最後一次 check＋build＋相關測試，GitHub CI 需成功。
- 至少留桌機／手機對照：Punch 書音同卡、Podcast-only 凡思維、鬼滅兩文一集、清除心理主題篩選、原雙欄文章列表。
- 完成後更新唯一 `docs/CURRENT_STATE.md`，明確分成「實作／已測試／待作者驗收／待圖片權利」。不要把 M5-D 整階段標為已完成，因**文章正式封面及內文圖片仍待 M5-C 來源／重刊權核准後才能接入**。
- 不重新爬 Vocus／RSS，不修改 48 篇正文／分類、不重新匯入人氣、不新增出版／作者／留言功能、不合併或部署，除非作者另外明確授權。

## D｜作者／ChatGPT 與 Codex 分工

- ChatGPT 已完成 25 集分類、16 組映射、9 集 Podcast-only、分類差異消解、主題 reset 修正及資料驗證，不再交回 Codex。
- 圖片來源盤點與權利審核由 ChatGPT／作者另行處理，Codex 在核准前不要下載或填入未授權素材。
- Codex 本次只做 **凡思維系列入口＋必要展示修正＋實際 UI 驗收**。已有功能先驗證；不需要的檔案不動。
