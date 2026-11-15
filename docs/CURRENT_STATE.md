# CURRENT_STATE｜唯一目前有效網站狀態

更新：2026-11-15（PR #9／#10／#11／#13／#14 已合併；Podcast 25集分類及16集配對已經作者委託定案，待本批 PR 合併驗證）。本檔記錄最新可執行事實；規格看 `docs/WEBSITE_COMPLETION_SOP.md`，歷史另存 `docs/history/`，勿以舊聊天、舊 ZIP 或尚未更新的審核 seed 取代當前程式。

## 權威來源
作者最新明確要求 ＞ 創作 SOP v4.1／分類與網站同步規範 v1.0（原文、分類、授權） ＞ `docs/WEBSITE_COMPLETION_SOP.md`（網站規格） ＞ 本檔（進度） ＞ `docs/review/m5c/`（候選及核准紀錄） ＞ 歷史材料。

## 已合併、不可重做
- **PR #8**：三篇核准正文與基礎結構。
- **PR #9**：新增 45 篇，共 48 篇已核准 Vocus 全文；原文及分類驗證通過，三篇短篇仍屬「文章與故事」。不重抓、不轉換、不重分類。
- **PR #11**：M5-D 第一批介面、48 篇卡片、文章／25集 Podcast 最新／最早／熱門排序、可複製摘要、四平台細框、原文已可證實的單集外連呈現；47 篇文章的 IG 主貼文連結（另 2 則相關 IG 貼文）、47 篇文章與 25 集 Podcast 人氣順位均已接入。無 IG／排名資料者保持 null，精確快照時間未知，不捏造讚數、播放數或日期。Podcast 人氣定義固定為**發布後首 7 天播放＋下載總數**，不稱 Spotify-only Plays。16 項針對性測試、check、build 與 PR CI 成功；作者已試用，接受本批主要介面。
- **PR #10**：`AGENTS.md` 新增任務前現況查證、階段分類、獨立方案決策、交接完整性、平行開發及完成驗證規則。
- **PR #13**：15 筆精確連結與 25 集分類候選查核完成，已保存審核歷史。
- **PR #14**：已修復主題頁清除篩選跳出原本主題的問題，保留主題單欄與文章清單雙欄。
- 以上 PR 均已合併 `main`；**沒有正式網站部署、沒有啟用服務**。合併 GitHub 程式碼不等於核准公開上線。

## 階段看板
| 階段 | 最新狀態 | 尚需完成／驗收 |
|---|---|---|
| M5-B 正文 | **已完成並合併** | 不重做 |
| M5-C 資料／權利／配對 | **公開作品身份／分類已由作者委託定案並在本批 PR 實作**：IG／熱門與 Podcast 資料備齊 | 封面及內文圖素材的權利審核／接入；後續書籍作者資料 |
| M5-D 文章／Podcast UI | **第一批已合併並經作者試用，主題清除缺陷已修；全階段未結案** | 本批正式映射進入後，抽查文章＋Podcast 統一卡片／雙向入口；補 Podcast-only 凡思維系列聚合；圖片審核後接入圖文，最後針對性驗收 |
| M5-E 正式小說／出版／作者／首頁／互動 | 待開始 | 真實書目、作者資料、留言／聯絡／分析服務選型及實作 |
| M5-F 全站驗收 | 待開始 | 一次性功能、圖文、權利、連結、手機桌機、無障礙、回歸 QA |
| M6 正式部署與同步 | **未授權** | 作者另行核准部署、SEO、RSS 更新與回退 |
| M7 私人 Fansi Studio | 上線後選做 | 有實際需求才評估 |

## 現有資料位置（避免重新收件）
- 文章正式正文及分類：`src/content/articles/`；Podcast 25 集公開 RSS：`src/data/podcast.json`。
- 正式人氣名次：`src/data/popularity.json`；文章 IG 連結：各篇 frontmatter `platform_urls`；公開交接原始 JSON 與雜湊：`docs/review/m5d/inputs/`、`docs/review/m5d/data-import.json`；16 項測試及桌手機截圖：`docs/review/m5d/README.md`。
- 原文已有單集外連的轉址證據：`src/data/listening-redirects.json`。**這些是外連證據，不能自動升格成雙向 GUID 映射**。
- **正式 Podcast 分類／文章映射**：`src/data/podcast-classifications.json` 25 集全數已依作者委託改為 confirmed，`src/data/podcast-work-map.json` 有 16 組唯一 GUID ↔ work_id；9 集 Podcast-only。14 集有精確單集 URL、2 集以相同敘事核對並由受託編輯判斷；沒有偽稱 URL 證據。詳見 `docs/review/m5c/PODCAST_MAPPING_APPROVAL_2026-11-15.md`。本批變更隨 PR 合併後才成為 `main` 版本。
- `docs/review/m5c/INPUT_GAPS.json` 是前期審核 seed，IG／人氣空欄與 11 筆初期音訊配對候選均**已過時**；本次正式 Podcast 結論以 `PODCAST_MAPPING_APPROVAL_2026-11-15.md` 和執行檔為準，不能再重問分類或重爬資料。
- `docs/review/m5c/IMAGE_TRIAGE.json`：新匯入 45 篇的 151 筆 Vocus 圖片候選位置；原三篇另有 8 個位置數，未全部取得來源或重刊權。圖片存在不等於網站有使用授權；不得批量爬取、直接重刊第三方圖片或匯入 IG 文字圖卡。
- `docs/review/m5c/DECISION_GATE.md` 是集中作者決策入口；`docs/review/m5c/PUBLICATION_CANDIDATES.json` 的七筆出版線索尚未核准。私人原始分析、Canva 私有素材與聯絡資料不放公開 repo。

## 下一個合理批次（按依賴與既定階段）

1. **M5-D 核准映射展示抽查**：確認 16 集已配對 Podcast 在主題頁的單欄統一作品卡僅出現一筆（同卡書面＋聲音），未配對 9 集保留 Podcast-only，全部 48 篇正式文章與 25 集音訊仍可找到；《鬼滅》兩篇書面作品皆保留。主題清除篩選應不跳出當前主題。
2. **M5-D 凡思維系列補完**：既有 `/series/fansiwei/` 仍只用 `ArticleBrowser` 呈現文章，需要在系列探索入口整合已確認的 Podcast-only 凡思維單集，不要在 `/articles/` 製造假文章。Codex 修改最少需要的系列頁與 UI。
3. **M5-C 圖片權利與用途**：由 ChatGPT 先分揀 151 筆 Vocus 圖像候選及原三篇 8 處位置，來源與重刊權不足時保留缺圖狀態；真正核准圖片後才交 Codex 做 M5-D 接入。
4. **下一階段**：M5-D 完成後進 M5-E 正式小說／出版／作者／互動，然後 M5-F 一次性全站驗收；M6 部署仍需另一授權。

## 並行與授權
每次動工先查最新分支、PR 與實際程式，使用獨立可審查 PR，不覆蓋人工修改。作者提出「怪怪的」先辨識已完成／現階段缺陷／未來規劃／素材缺口／新功能／最後精修，給出明確建議；不得自動當作修改授權。合併、正式部署、公開新作品、使用未核准圖像、啟用對外服務／付費都需對應明確授權。
