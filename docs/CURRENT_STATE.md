# PR #8 最新狀態：文末跨平台介面完成

文末統一為「聆聽這篇文章」與「在其他平台閱讀」。Spotify／Apple Podcasts／Vocus／Instagram共用小圖示細框按鈕；平台入口已從標題旁移除。來源Podcast宣傳連結在呈現層集中與去重，原文與來源URL保留；不顯示醒目的內部狀態標題。精確單集URL可提供既有單集名稱，但不等同GUID核准，不建立反向文章關聯。核准關聯仍使用既有映射表。

三篇原文、分類、作品ID及metadata無變更；沒有新文章、圖片或小說。42項測試、check零問題、build50頁；[最新六張文末與四平台隔離測試截圖](review/m5b-first-articles/README.md)。[PR #8](https://github.com/QuantumMedic/fansi-notes/pull/8)等待作者驗收，不合併、不部署、不進下一階段。

下一階段匯入規格：核准橫幅插畫保持比例、優先Vocus作者正式摘要（自動摘錄另處理）、IG逐篇核實留空允許、核准Podcast雙向關聯、圖片依原文順序且不重複整套IG文字圖卡。本輪只記錄，不執行素材下載或內容匯入。

---

# PR #8 最新補充：統一文章閱讀入口

本輪僅更新 PR #8 `codex/m5b-first-articles` 的介面與呈現。三篇原文、分類、work_id、已確認metadata及GUID映射不變。探索文章／凡思維／文章與故事共用 ArticleBrowser，正式計數3／1／2，不含Podcast-only；後者仍在凡思聲。固定系列清除篩選留在該系列，舊longform／special路由導向文章與故事。

一般列表、首頁、推薦及正式建置排除synthetic文章與出版作品；工程檔案保留供隔離測試，無正式小說資料時顯示待上架。開頭摘錄不重複出現在全文頁首，SEO description保留；可選summary_kind=independent供未來作者確認的獨立摘要。圖片標記仍保留在正文，閱讀介面隱藏占位，圖說／來源連結可讀可點。

標題旁依platform_urls顯示Vocus／Instagram；只有approved GUID配對才顯示收聽入口及相關Podcast（正式標題、Spotify、可用Apple單集網址與選擇載入播放器），單集反向連文章。三篇目前只有Vocus入口，不增加正式配對。

40項測試通過、check零問題、build50頁；[驗收與十二張桌機手機截圖](review/m5b-first-articles/README.md)。[PR #8](https://github.com/QuantumMedic/fansi-notes/pull/8)等待作者最終確認。不合併、不部署、不啟用服務、不新增內容或進入下一階段。以下先前紀錄供追溯，與本節不一致時以本節為準。

---

# 最新有效狀態：M5-B 首批全文匯入（2026-11-14）

本節優先於下方歷史階段限制。PR #1–#7 已合併；本輪從 main `c019985` 建立 `codex/m5b-first-articles`，不合併、不部署。

作者明確授權三篇指定 Vocus 版本的完整文字提交公開 GitHub：《別讓意志力透支！從「餅乾與蘿蔔實驗」看如何有效達成目標》、《從《反脆弱》看人生設計：擁抱不確定性，在衝擊中持續成長》、《會說話的影子》。精確來源與文字雜湊見 [驗收紀錄](review/m5b-first-articles/README.md)。不延伸到圖片、其餘45篇、小說或私人素材。

前台只有「凡思維」及「文章與故事」兩組；後者合併 longform／special。內部三系列、九主題及 work_id／GUID 架構保留；舊系列網址導向文章與故事。文章內容、分類和版本由作者決定，工程不改寫或評價。

三篇均完整文字閱讀，署名及發布／更新日期取自來源。圖片只有位置提示，沒有下載或使用圖片；沒有以測試封面冒充正式素材。原文外部連結保留為原文證據，沒有新建 Podcast GUID 配對。25集 proposed 狀態不變。

下一步等待作者驗收本 PR；圖片若要加入，需另外提供可用素材與授權；Podcast 關聯需另行確認。留言／聯絡服務不啟用，Canva與創作 SOP 不變，不進 M6。

---

## 以下為整合與前階段歷史紀錄

# 最新有效狀態（2026-11-14）

作者已驗收 PR #7，確認為現階段設計與工程基準，並明確授權依序合併 PR #1–#7。七份 PR 已全部以 merge commit 合併 main；沒有 squash、rebase、強制合併或刪除歷史分支。

整合提交 `32093dce852dc839a5fa9561c29759a29c26b293` 的完整 tree 為 `636dc8323837fba4ae9d237d685ae1c101df97c7`，與 PR #7 head `b9dd805f6389afca8415495e96de63cf82b0b33e` 完全相同。其後本次文件更新不改動網站程式、資料或素材。

## 有效授權與停止點

- M0–M5-A 已整合；M5-B 本輪只做公開來源盤點、缺失清單及2–3篇正式匯入試驗規劃。
- 尚未授權將新的真實全文或書籍素材提交到公開 GitHub；公開平台上已有內容不等於網站公開授權。作品清冊只存 Repository 外的本機審閱資料夾。
- 不公開部署、不啟用付費服務、不修改 Canva／既有創作 SOP、不擅自公開小說全文、不開始 M6。
- 25集分類仍為 proposed；沒有因合併或來源盤點而核准分類、建立新的正式 work_id／GUID 配對。
- 下一步須作者確認首批作品、書面版本、網站／公開GitHub範圍、圖片授權、分類與平台關聯，才可正式匯入。

## 整合驗證

每階段核對 PR 基底、變更範圍、CI及無衝突。#2–#7 逐次改以 main 為基底，合併樹與對應階段分支一致。PR及main驗證均未出現測試失敗。最終 main 本機 check 0 errors／warnings／hints、build 54頁、test 35/35通過。

GitHub API確認 Pages `has_pages:false`，部署紀錄空白；CI只建置與上傳審閱artifact。RSS排程現在隨合併進入預設分支，但僅唯讀同步／產出artifact，不回寫、不部署。仍保留noindex與robots阻擋。

## 本機來源清冊

完成48筆Vocus公開文章來源、25集Podcast、5筆書籍冊別候選，以及來源／缺失／首批試驗規劃。這是來源數，不是已去重作品數；正式work_id仍待確認。6篇文章有直接Spotify單集外連證據，但網站配對尚未核准。

Vocus專欄顯示60內容，尚有12筆索引差額；IG帳號已由作者公開文章外連定位，但無完整逐篇貼文／圖卡清冊；散文集書目未確認。這些缺口已在本機清冊明列，不臆造補齊。

本機交付為「作品總清冊與待確認.md」、vocus-inventory.json、podcast-inventory.json、publications-inventory.json；只保存標題、識別碼、日期與來源網址等metadata，沒有全文或書封檔。沒有加入公開Repository。

合併SHA及檢查方式見 [整合驗收](review/integration-m0-m5a.md)。

---

以下為先前階段紀錄。當中的「尚未合併／停止M5-A」等描述已由上述最新作者授權與完成狀態取代；原有內容公開及安全規則仍有效。

# 目前有效狀態（2026-11-13）

## 授權與決策

目前 M5-A：開發、測試與匯入準備。M0–M4 已實作，不重做；歷史「只做 M0–M2」及「不進 M4」不再是有效階段限制。不可合併、公開部署、啟用付費服務或進入 M5-B／M6。

完整文章：凡思維與深度文章保持文學雜誌式全文閱讀；IG／Podcast／Vocus 僅正式連結或既有收聽入口。不開發 IG 圖卡閱讀器，不改首頁視覺、Canva、創作順序或雙母稿 SOP。

三系列九主題不變；work_id 與 RSS GUID 只依核准關聯配對。25 集 proposed 刻意保留，dev 可展示待審核，build 排除；未分類集數仍在全部 Podcast。作者上線前再集中核准。

## GitHub 依賴

開始時已查核 GitHub：PR #1–#5 均 open、未 merged。

main ← #1 codex/m0-m1-foundation ← #2 codex/m2-storybook ← #3 codex/m3-content ← #4 codex/m3-taxonomy ← #5 codex/m4-publications ← #6 codex/m5a-readiness。

M4 基底 fd9f431f4747f28ec89e94289a4f7c0055343885。新 PR 指向 M4，不將未合併的歷史功能混作新增功能。合併順序需由作者批准，之後逐份重定基底及驗證。

## 本次實作

文章搜尋預處理全文、主次主題精準篩選、120ms 防抖與中文組字處理，排序只在選項改變時重排。小說 publication_status（published／serialized／unpublished）、work_form（novel／short／collection）及 series／order 分開；舊 publication_kind 不再接受，既有合成資料已遷移。

留言與聯絡尚未連到服務：欄位檢查、空狀態、清除及隱私說明可用，沒有送達或作者回覆的假承諾。服務比較見 M5A_服務與上線準備.md。

canonical、OG、RSS 發現連結、排除合成作品與作者審閱頁的 sitemap／文章 feed 已備妥。仍保留 noindex,nofollow 與 robots 禁止索引。既有 Podcast RSS 同步保留重試、失敗快取及人工連結／分類保護。

批次工具預設 dry-run，僅輸出 Repository 外全新暫存目錄，不自動提交或合併。清冊格式及核准要求見 M5A_批次匯入.md。

## M5-B 的前提與待辦

1. 作者驗收 M5-A；提供明確允許公開的全文、書封與 metadata。未公開稿件及私人資料不進任何公開分支或清冊範例。
2. 作者決定留言服務、預算、訪客模式、審核與刪除政策；決定聯絡收件服務及私人收件設定。
3. 用作者帳號啟用服務後，實測送達、失敗／逾時、作者回覆、審核、封鎖、匯出及刪除；本階段未啟用。
4. 確認正式署名、網域、公開作品、25 集分類；清除合成資料，重新建置審核 sitemap／RSS／SEO。
5. 明確批准部署後才新增可執行部署工作流程、移除 noindex／robots 阻擋，驗證 GitHub Pages base、回滾及手機無障礙。M6 另行授權。

ChatGPT SOP 不會自行寫入 GitHub。必須作者明確要求同步，再由已授權工具操作；GitHub 文件更新也不代表 ChatGPT 專案附件已修改。

## 最新驗收

M5-A 初次：33項測試通過、check零錯誤／警告／提示、51頁建置及RSS／sitemap完成。桌機與手機實測見 [驗收紀錄](review/m5a/README.md)。待作者審閱 [PR #6](https://github.com/QuantumMedic/fansi-notes/pull/6)；不自動合併。


## M5-A 最後驗收：作品公開範圍

- 凡思維、深度文章與其他文字創作可以只有網站全文，沒有 Podcast、IG 或 Vocus；三者連結均選填。小故事、隨筆與短文由作者選既有作品系列與主題，不新增分類、不強迫錄音。
- `written_master: website-original` 表示獨立網站書面定稿；既有 IG／Vocus 共用稿維持 `ig-vocus`。這是來源辨識，不改雙母稿創作順序；兩者都需明確網站公開授權。
- 小說與出版定位為作者作品館。預設只有書封、簡介、出版資訊、購買連結，試讀／番外／世界觀均選填，不預設公開小說全文。
- 已公開且另行授權全文的短篇小說可使用 `work_form: short`、`publication_status: published` 與 `full_text: {approved:true, approved_by, approved_revision, text}`。沒有 full_text 不顯示全文；未核准、未公開或長篇小說使用此欄位會驗證失敗。全文以跳脫文字與段落呈現，不執行 HTML。
- 歷史作品一次性批次匯入；未來作品經既有 SOP 確認後逐篇同步。完成 SOP 不等於公開授權，工具操作才會寫入 GitHub。未授權稿件不能先放公開 Repo 再用欄位隱藏。

最新操作、合併計畫與 M5-B 補件清單：[最後驗收與交接](M5A_最後驗收與交接.md)。


最後內容範圍驗收：34 tests 通過、check 零錯誤／警告／提示、build 51 頁。新增 website-original 與短篇全文獨立核准驗證；詳見 docs/M5A_最後驗收與交接.md。沒有新增真實作品或核准 Podcast 分類。

## M5-A 視覺精修（2026-11-14）

依作者新指令，允許精修首頁共用書架，不變更已確認的首頁五場景。從 PR #6 最新 head 34b3429 建立 `codex/m5a-visual-refinement`，獨立 PR 以 #6 分支為基底，依賴順序接在 #6 後。

收藏書架改固定比例與小幅抽出；詳頁桌機並列／手機堆疊；4 本明示合成作品驗證排列。文章／出版關聯集中在 publication-relations.json，核准有效 ID 後雙向顯示。35 項測試通過、check 零問題、54頁建置。真實截圖與設計差異見 [視覺精修驗收](review/m5a-visual/README.md)。等待作者視覺驗收；不合併、不部署、不匯入真實作品、不進 M5-B。
