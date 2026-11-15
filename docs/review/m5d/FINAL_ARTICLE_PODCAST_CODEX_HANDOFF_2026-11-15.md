# M5-D 最終單次 Codex 交接：文章／Podcast 全部接線與圖文展示

本交接以 PR #19 的分支 `research/m5c-nine-ig-permalinks-20261115` 為唯一工作起點；最新作者授權允許已發表 IG 書面文字作為網站書面文章。PR 此時**未合併、未 CI／桌手機驗收、未正式部署**。Codex 下一步只需從此分支接手一次，完成 M5-D 版型、圖片非阻擋處理及實際驗收，不再次做 M5-C 研究。

## 已在 PR #19 分支完成、請勿重做

- 原有 48 篇核准 Vocus 文章原文完全保留；新建 9 篇已公開 IG 書面文章 Markdown 至 `src/content/articles/`，按每頁原文轉為長文段落，未搬整套 IG 字卡為圖片。
- 25／25 集 Podcast 原有精確 GUID、Spotify 直達單集、Apple 直達單集、RSS 方形封面均完整。
- `src/data/podcast-work-map.json` 已擴充為 25 個 GUID→網站 `work_id` 一對一配對；`src/data/podcast-classifications.json` 25 筆與正式文章 ID 同步，全數 confirmed。
- `src/data/popularity.json` 已由作者過往 Meta IG 全年工作簿按主貼文讚數重新排出 56 篇有 IG 的正式名次，另外 1 篇原始沒有 IG 保持 `null`，25 集 Podcast 排名不變。沒有捏造即時讚數與快照日期。
- 9 篇的 IG 直達連結全部在文章 frontmatter；1 篇已核實 Vocus 直達連結；其餘 8 篇未證實有 Vocus 版本，前端應省略 Vocus 按鈕，**不需要因此退回作者重查**。
- 預期 PR 合併後：57 篇網站文章、25 集 Podcast、25 組文章＋Podcast 配對，**57 個不重複的作品卡片**（而非 57+25 張）。本次不再有『九集獨立音訊』類別。

## 九篇正式資料對應

| 作品 | work_id／文章檔名 | Podcast GUID | IG | 系列／主次主題 |
|---|---|---|---|---|
| 為什麼我們逃向複雜？ | `ig-dvnhptok8yt` | `8dfe039a-7fb5-4bdf-9134-9fcdf76bb2e0` | https://www.instagram.com/p/DVnHpTok8Yt/ | `longform`／`psychology, philosophy` |
| 上帝是個左撇子？ | `ig-dvbkyqok9e` | `d973015a-d1d4-42a4-b959-d1f61c691397` | https://www.instagram.com/p/DVBkYQok9e_/ | `longform`／`science, philosophy` |
| 2025推薦書單＆人生回顧 | `ig-dulrjmfk64q` | `9a81d6cd-3cd1-4fae-bb71-378c78371b64` | https://www.instagram.com/p/DULRJmfk64q/ | `special`／`literature, creation` |
| 一盆植物延長生命？ | `ig-dudigqee921` | `58adc2d4-72c6-444d-8fe6-770296c843f1` | https://www.instagram.com/p/DUDiGQeE921/ | `fansiwei`／`psychology, medicine` |
| 阿凡達3：火與燼 | `ig-dtsrqjaewqz` | `bf20ddce-f482-4556-b2fd-daa3833b33dc` | https://www.instagram.com/p/DTSrQJaEwQZ/ | `longform`／`screen, philosophy` |
| 米爾格倫服從實驗 | `ig-drroyve60v` | `bd111a66-7431-41fa-92ad-fb1952112c70` | https://www.instagram.com/p/DRroYV_E60V/ | `fansiwei`／`psychology, society` |
| 巴菲特最後一封股東信 | `ig-drxkarwk5mw` | `d0b432c1-36da-4863-9b71-4068dd941dae` | https://www.instagram.com/p/DRXKarwk5mW/ | `longform`／`philosophy, society` |
| 活出意義來 | `ig-dq3v8ste0kl` | `53c18650-7819-41b2-b019-284617749502` | https://www.instagram.com/p/DQ3v8sTE0KL/ | `longform`／`literature, philosophy` |
| 過度努力的陷阱 | `vocus-689ed09bfd897800015571de` | `6f85e22a-f8a9-43fc-891c-cea514725480` | https://www.instagram.com/p/DNXrcNyPm0w/ | `longform`／`psychology, creation` |

Vocus 目前唯一新增已核實網址：`https://vocus.cc/article/689ed09bfd897800015571de`；另外八篇 IG 已公開，網站有自己的正式書面全文，**不可因缺 Vocus 而視為沒有文章**。各篇 Spotify／Apple 不要重複填寫或猜 URL，由已核准 Podcast GUID 從 `src/data/podcast.json` 取得。

## 最終頁面與圖片放置契約

### 文章列表／作品卡

- `/articles/` 與 `/series/stories/` 保留既定雙欄；主題頁 `/topics/[slug]/` 單欄；`/series/fansiwei/` 改以現有 `catalog().works` 展示此系列全部正式書面／音訊，不跨混其他系列。
- 同一 `work_id` 的文章與 Podcast **共用一張卡**：上方系列、主／次主題、日期；中間標題和可選取摘要；下方『閱讀全文』和『收聽單集』兩個獨立入口。卡片沒有整卡 `<a>` 包覆摘要。
- 卡片有可用、適當的正式封面才顯示封面；不得用整張密集文字 IG 輪播圖卡代替正式文章封面；沒有圖時保持現有無圖版型、標題與文字正常對齊。

### 文章全文頁順序（桌手機採同一語意結構）

1. 文章系列與主次主題 → 標題／摘要／正式發布日期 → 有圖則顯示封面（若無則直接進正文）。
2. 原書面文字按自然段落與子標題排版，維持可選取、可複製；不得將 8–11 張 IG 字卡當成九篇圖像幻燈片。
3. Vocus 原有有用的內文圖，按各篇原文位置回填在**相鄰段落之間**，有圖片圖說者以圖說標示；響應式最大寬度不超過正文容器，維持原圖比例。
4. 正文末尾顯示一組 Spotify／Apple 收聽入口（由 Podcast GUID 自動取）、IG 及存在時的 Vocus 官方網址；不重複宣傳圖、播放器或裸 URL。
5. 相關作品與回到列表入口保持既定 UI；所有媒介不存在時整個無用區塊隱藏。

### 圖片資料的唯一實作方式（不再開圖片研究流程）

- 既有 45 篇 Vocus 共 151 個來源圖片位置，權威欄位在 `docs/review/m5c/IMAGE_TRIAGE.json` (`work_id`,`source_position`,`original_url`,`source_caption`)，原始正文的 `data-source-image-position` 是接回**確切段落位置**的定位符號。Codex 按位置找回，禁止全部放在篇首或篇末。
- 原圖片標記是 Podcast 宣傳用途的 15 筆，可略過，交給正式收聽元件；第三方明顯有疑慮、缺圖、失效 URL 或無合適內容的圖片也略過，版型自然收合，不讓作者再逐張審核。
- 原三篇只有 8 個歷史圖片位置而缺完整 URL；本批可保留無圖，不得捏造圖檔或再要求作者補素材。
- 九篇新 IG 書面文章的主要資產是**已完整擷取的文字**，不需重新尋找原始圖片才能結案。封面不足時使用正常無圖文章版式，Podcast 卡片仍使用已存在 RSS 封面。
- 如果採遠端 Vocus 原文圖片 URL，須實際確認載入並提供圖片載入失敗回退；不自動將第三方不明來源下載、重刊或放進公開 repo。

## PR #19 已查到的 CI 失敗原因（Codex 務必修正）

2026-11-15 GitHub Actions「網站驗證」run #90：npm run check 通過、npm run build 通過（產出107頁）；npm test 58項中52項成功、6項失敗。

1. tests/content-build.test.mjs：仍預期「分類待確認」，實際已是確認分類。按作者已確認的分類更新測試預期，勿將正式資料倒退為 pending。
2. tests/m5b-import.test.mjs 兩項：把全站文章數硬寫48，現為57。務必保留『原48篇正文與來源雜湊／身份／路由完全不變』的獨立回歸檢查，另驗證新增9篇及全站57篇，禁止刪除原48篇完整性保護。
3. tests/m5c-podcast-approved.test.mjs：仍預期16組映射＋9 Podcast-only；如今25組均有正式網站書面作品。驗證原16筆逐項不變、新增9筆唯一、25集分類不變。
4. tests/m5d-data.test.mjs 兩項：舊人氣名次（例如13）因新IG作品插入變成14，以及舊16組映射數。驗證56篇具有IG的按讚排序、原1篇無IG保留null、25集Podcast首7天人氣名次不變。

這六項是舊測試預期與已公開的新資料不一致；仍須查實個別視覺與行為是否正確。不得為了變綠移除測試、跳過斷言、倒退正式分類或熱門名次。請完成工程後重新執行全部 CI。

截至本查核，PR #19 沒有修改任何既有網站 Astro 元件、CSS、頁面版型或原48篇正文；修改限九篇新增文章、三個資料JSON和交接／進度文件。Codex 應依 M5-D 具體缺陷最小範圍修改，不做非必要介面重構。

## Codex 唯一剩餘 M5-D 工程

1. **從 PR #19 HEAD 分支繼續**，不要從舊 `main` 重新匯入 48 篇，也不要在另一平行分支覆蓋本批九篇。
2. 實作／驗收「凡思維系列」統一作品卡展示、主題頁 one-card-per-work、文章雙欄、索引與搜尋排序；若現有 `UnifiedWorkCard.astro` 及 `buildWorks` 正常，沿用，不重寫。
3. 檢查九篇 IG 轉寫 Markdown 的小標、段落與裝飾性圖卡標題；只調整排版、移除宣傳 CTA／多餘封面重複標題，不要改寫作者正文、經驗或研究數字。特別核對 2025 書單六本書與各段對應。
4. 依上方原位置規則，補 Vocus 有意義圖片；無圖不是阻擋條件，不另發起原始素材工作。
5. 針對 57 篇／25 集／25 組書音／9 新文章／56 IG／49 Vocus 文章網址存在時與正確隱藏的 8 筆／25 個 Spotify、Apple 的映射進行自動驗證（49 Vocus = 原48 + 新1）；確保不存在 57 篇文章加 25 張重複Podcast作品卡。
6. 手機與桌機抽查：凡思維所有作品、IG-only 書面版、Vocus＋IG 書面版、Punch 雙版本、鬼滅兩文一集、主題清除篩選、摘要複製、文章無圖與有圖、無錯誤目錄與空按鈕。
7. 執行針對性測試、Astro check、build、CI，必要時修復；提交實際桌機手機截圖與測試結果，明確寫『實作／測試通過／待作者驗收』。PR／CI 尚未成功前，不宣稱 M5-D 已驗收。
8. 更新 `docs/CURRENT_STATE.md` 為實際結果；舊手冊提及『48+9 Podcast-only』是 PR #15 基準，已由本 PR 的 57 文章／25 配對取代。不要重新打開已結案的 M5-C 九篇網址追查。

## 後續階段

一旦本次 M5-D 合併並經作者體驗驗收，下一批**直接做 M5-E 小說／出版與作者／首頁／互動服務**。M5-F 全站回歸與 M6 作者另行部署授權仍是分開的階段，沒有混成這次 Codex 任務。
