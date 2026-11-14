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
