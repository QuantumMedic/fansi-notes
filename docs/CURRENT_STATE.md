# CURRENT_STATE｜唯一目前有效網站狀態

更新：2026-11-15（PR #9／#10／#11／#13／#14／#15 均已合併至 `main`；Podcast 25 集分類與 16 組作品配對已生效，網站仍未部署）。本檔記錄最新可執行事實；規格看 `docs/WEBSITE_COMPLETION_SOP.md`，歷史另存 `docs/history/`，勿以舊聊天、舊 ZIP 或尚未更新的審核 seed 取代當前程式。

 > **PR #19 最新工程狀態：已實作、測試通過、待作者驗收。** 57篇文章（凡思維8／文章與故事49）、25集Podcast、25組映射、57個不重複作品、56IG／49Vocus與56個非null文章人氣順位均已接線及批次驗證。原48篇及新增9篇檔案雜湊、原16組映射完整保留。凡思維閱讀／收聽統一卡、文章雙欄／主題單欄與主題清除篩選已實測；11張敘事插圖按原位置呈現，其餘圖片依非阻擋規則省略。check零問題、build107頁、61/61測試通過。完整驗收、六項舊失敗修正及桌手機截圖：`docs/review/m5d/final/README.md`。GitHub CI見PR checks，未合併／未部署／尚未作者驗收。不開始M5-E。

## 權威來源
作者最新明確要求 ＞ 創作 SOP v4.1／分類與網站同步規範 v1.0（原文、分類、授權） ＞ `docs/WEBSITE_COMPLETION_SOP.md`（網站規格） ＞ 本檔（進度） ＞ `docs/review/m5c/`（候選及核准紀錄） ＞ 歷史材料。

## 已合併、不可重做
- **PR #8**：三篇核准正文與基礎結構。
- **PR #9**：新增 45 篇，共 48 篇已核准 Vocus 全文；原文及分類驗證通過，三篇短篇仍屬「文章與故事」。不重抓、不轉換、不重分類。
- **PR #11**：M5-D 第一批介面、48 篇卡片、文章／25集 Podcast 最新／最早／熱門排序、可複製摘要、四平台細框、原文已可證實的單集外連呈現；47 篇文章的 IG 主貼文連結（另 2 則相關 IG 貼文）、47 篇文章與 25 集 Podcast 人氣順位均已接入。無 IG／排名資料者保持 null，精確快照時間未知，不捏造讚數、播放數或日期。Podcast 人氣定義固定為**發布後首 7 天播放＋下載總數**，不稱 Spotify-only Plays。16 項針對性測試、check、build 與 PR CI 成功；作者已試用，接受本批主要介面。
- **PR #10**：`AGENTS.md` 新增任務前現況查證、階段分類、獨立方案決策、交接完整性、平行開發及完成驗證規則。
- **PR #13**：15 筆精確連結與 25 集分類候選查核完成，已保存審核歷史。
- **PR #14**：已修復主題頁清除篩選跳出原本主題的問題，保留主題單欄與文章清單雙欄。
- **PR #15**：25 集 Podcast 正式分類 confirmed，16 組同作品 GUID ↔ work_id 映射已核准寫入執行資料；9 集 Podcast-only。為新的分類及映射補齊資料／回歸測試，check、build、CI 通過。
- 以上 PR 均已合併 `main`；**沒有正式網站部署、沒有啟用服務**。合併 GitHub 程式碼不等於核准公開上線。

## 階段看板
| 階段 | 最新狀態 | 尚需完成／驗收 |
|---|---|---|
| M5-B 正文 | **已完成並合併** | 不重做 |
| M5-C 資料／權利／配對 | **已在 PR #19 分支補完九篇 IG 正文及 25 組正式配對，待合併與測試**；原有48篇不變 | 圖片按作者最新指示，適合且已公開者按原位置使用，其餘省略不阻擋；書籍資料留 M5-E |
| M5-D 文章／Podcast UI | **PR #19 最終工程已實作且61項測試通過，待作者驗收** | 作者驗收本批圖文／功能；驗收後下一批M5-E |
| M5-E 正式小說／出版／作者／首頁／互動 | 待開始 | 真實書目、作者資料、留言／聯絡／分析服務選型及實作 |
| M5-F 全站驗收 | 待開始 | 一次性功能、圖文、權利、連結、手機桌機、無障礙、回歸 QA |
| M6 正式部署與同步 | **未授權** | 作者另行核准部署、SEO、RSS 更新與回退 |
| M7 私人 Fansi Studio | 上線後選做 | 有實際需求才評估 |

## 現有資料位置（避免重新收件）
- 文章正式正文及分類：`src/content/articles/`；Podcast 25 集公開 RSS：`src/data/podcast.json`。
- 正式人氣名次：`src/data/popularity.json`；文章 IG 連結：各篇 frontmatter `platform_urls`；公開交接原始 JSON 與雜湊：`docs/review/m5d/inputs/`、`docs/review/m5d/data-import.json`；16 項測試及桌手機截圖：`docs/review/m5d/README.md`。
- 原文已有單集外連的轉址證據：`src/data/listening-redirects.json`。**這些是外連證據，不能自動升格成雙向 GUID 映射**。
- **正式 Podcast 分類／文章映射**：`src/data/podcast-classifications.json` 25 集全數已依作者委託改為 confirmed，`src/data/podcast-work-map.json` 在 main 的 PR #15 歷史基準為 16 組唯一 GUID ↔ work_id、9集尚未配對；PR #19 工作分支已新增9篇及映射，合計25組。原16組有14集精確單集 URL、2 集以相同敘事核對並由受託編輯判斷；沒有偽稱 URL 證據。詳見 `docs/review/m5c/PODCAST_MAPPING_APPROVAL_2026-11-15.md`。以上正式映射現已合併至 `main`，不再是審核候選。
- `docs/review/m5c/INPUT_GAPS.json` 是前期審核 seed，IG／人氣空欄與 11 筆初期音訊配對候選均**已過時**；本次正式 Podcast 結論以 `PODCAST_MAPPING_APPROVAL_2026-11-15.md` 和執行檔為準，不能再重問分類或重爬資料。
- `docs/review/m5c/IMAGE_TRIAGE.json`：新匯入 45 篇的 151 筆 Vocus 圖片候選位置；原三篇另有 8 個位置數，未全部取得來源或重刊權。圖片存在不等於網站有使用授權；不得批量爬取、直接重刊第三方圖片或匯入 IG 文字圖卡。
- **2026-11-15 M5-C 補充查核（PR #18 已合併）**：原九集 Podcast 目前只是未配到已匯入的 48 篇網站文章，已在私人已連結的設計來源中核對到相應書面內容；為保護未公開素材，私有設計 ID／內容未存入公開 GitHub。另查到一篇明確公開 Vocus 文章〈過度努力的陷阱〉（`vocus-689ed09bfd897800015571de`）原不在48篇匯入清單，**現已獲作者明確准許使用已公開IG書面原文並在PR #19補建該網站文章**，保留既有Vocus直達連結。詳見 `docs/review/m5c/PRE_CODEX_SOURCE_AND_IMAGE_AUDIT_2026-11-15.md`。
- **2026-11-15 IG 補查（PR #19 待審）**：原九集每一集都已由作者提供的 Meta 年度匯出工作簿找回精確 IG 單篇 permalink（9/9），已寫入 `docs/review/m5c/WRITTEN_VERSION_PUBLIC_SOURCE_GAPS_2026-11-15.json`。僅〈過度努力的陷阱〉另有本批核實的 Vocus 直達 URL；其餘八篇本批公開查找無法核實直達網址，屬待補證據，**不得誤標成沒有 IG 或沒有書面稿，也不可猜造 Vocus 網址**。此 PR 已含9篇新的正式網站 Markdown 書面文章，原16組正式映射保持內容不變，新增9組為總計25組；另同步更新56篇有IG貼文之人氣名次，並保留1筆null。
- **圖片初篩（歷史清冊）**：151筆已有原文圖片位置定位與安全行動表 `docs/review/m5c/IMAGE_ACTION_LEDGER_2026-11-15.json`；作者最新決定是直接用已公開、合適且可正常載入的圖片按位置呈現，宣傳圖與來源疑慮圖略過，無圖正常排版。此項不再阻擋 M5-D 完工。
- `docs/review/m5c/DECISION_GATE.md` 是集中作者決策入口；`docs/review/m5c/PUBLICATION_CANDIDATES.json` 的七筆出版線索尚未核准。私人原始分析、Canva 私有素材與聯絡資料不放公開 repo。

## PR #19 接下來的唯一工程批次

1. Codex 以 PR #19 工作分支及 `docs/review/m5d/FINAL_ARTICLE_PODCAST_CODEX_HANDOFF_2026-11-15.md` 為唯一輸入，驗收57篇文章、25集Podcast、25組一對一映射、凡思維/主題系列、排序搜尋、平台連結、無重複作品卡及手機桌機排版。
2. Vocus既有文章內文圖依 `IMAGE_TRIAGE.json` 原始位置、`data-source-image-position` 標記補入適合且能正常載入的圖片，Podcast宣傳圖／來源不當／失效圖直接略過；新IG文章無圖也正常閱讀，不重新審核151張圖片以卡住主要功能。
3. 實際執行check、build、CI並提交截圖，作者體驗驗收後標記M5-D完成。下一批直接進M5-E小說出版；M5-F最終全站驗收，M6另行授權部署。

## 並行與授權
每次動工先查最新分支、PR 與實際程式，使用獨立可審查 PR，不覆蓋人工修改。作者提出「怪怪的」先辨識已完成／現階段缺陷／未來規劃／素材缺口／新功能／最後精修，給出明確建議；不得自動當作修改授權。合併、正式部署、公開新作品、使用未核准圖像、啟用對外服務／付費都需對應明確授權。
