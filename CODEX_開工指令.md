> Current authorization: M5-A development/testing/import preparation. Read [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) first. Earlier M0–M2-only instructions are historical; all privacy/publication safeguards remain binding. No merge, deployment, paid service activation, M5-B or M6.

# 給 Codex 的正式開工指令｜凡思筆記網站 v1.0

請在我已授權的 GitHub Repository **`QuantumMedic/fansi-notes`** 中開發《凡思筆記 × 作者個人品牌》網站。先讀取本交接包的 `README_從這裡開始.md` 及 `docs/01` 到 `docs/08`，並將它們視為這次工作的主要產品規格；`reference/` 是舊設計討論，若有矛盾，以 v1.0 與作者最新指令為準。

**重要：現在先做 M0–M2，不要一次完成所有功能或直接公開正式內容。**

## 專案目標

- 「可探索故事書」互動首頁：平面繪本＋局部紙雕景深，有五個場景（凡思維、凡思聲、深度文章、小說與出版、關於作者）；滑鼠視差、hover/focus 預覽、點擊導覽。手機不靠 hover，鍵盤與減少動態皆可用。
- 內頁採有質感的文學雜誌式閱讀；深度文章較沉浸，凡思維較簡潔；出版作品是收藏書架＋各作品獨立世界。
- 支援《凡思筆記》與作者雙品牌、Podcast《凡思聲》、完整文章、出版作品、Instagram／Spotify／Vocus 正式連結、留言與私人聯絡。
- 一個作品 `work_id` 對應多媒介；網站正文以作者核准的 IG／Vocus 共用書面稿為唯一來源，Podcast 逐字稿另行保存。
- 作者自己發布 Instagram、Spotify、Vocus。網站僅管理、同步與導流，**不幫作者代發外部平台**。

## 必須遵守

1. **嚴禁把五篇尚未公開作品的全文、Podcast 長稿、Canva 未公開圖片或私人狀態卡放入公開 GitHub**，包括任何開發 branch／PR；先用清楚標示的虛構資料完成系統。
2. 不補造作者經歷、署名、書籍真實封面、出版資訊、心得、論文結果、購書網址或社群連結。未提供時使用占位／誠實空狀態。
3. 不覆寫使用者其他 Repo、Canva 設計或既有作品；不要自動建立付費第三方帳號，也不要把 API 密鑰放公開程式庫。
4. 不將「SOP 定稿」當成「已批准網站公開」；作者需另外給出明確授權。
5. 不假設 Spotify RSS 的標題可以正確配對文章；需 GUID 與作者核准的 `work_id` 映射。IG／Vocus 第一版以發布後提供 URL 一次為主。
6. 使用繁體中文，真實頁面優先可讀性；故事首頁不能犧牲手機、鍵盤與 SEO。設計細節缺少作者決定時提出選項與暫定方案，**不得冒充已定案**。

## 第一個 PR：M0／M1

- 依 Astro 官方目前文件建立專案、schema 與繁體中文設計系統；GitHub Pages 專案路徑要正確處理 `/fansi-notes/` base。
- 基本導覽、頁面殼層、路由、文章／Podcast／作品卡、搜尋骨架、404；測試只用虛構內容。
- 適當的 README、開發指令、CI、測試、手機響應式版面。
- 對需要第三方提供者的留言與私訊，先做明確可插拔界面，**不可假稱具備可提交的真實後端**。

## 第二個 PR：M2

- 依設計文件做首頁的「一本展開的書」多層場景原型，支援視差與五大區 hover／focus、觸控替代、reduced-motion。
- 使用占位插畫，保留未來能替換成作者核准的獨立插畫圖層；不要把導航文字燒在圖檔裡。
- 首頁捲動後的編輯式區塊，並提供桌機、手機、鍵盤、Reduced Motion 演示。

## 每個 PR 必須回覆

- 做了什麼、對應哪份規格、有哪些作者待決問題。
- 網站的實際預覽（若可）、至少桌機與手機截圖，以及鍵盤／減少動態互動驗證。
- Build／測試結果、是否包含真實未公開資料的檢查、GitHub Actions 是否已配置但未擅自部署。
- 任何未完成與風險，保持清楚，不假裝完成。

**完成 M0–M2 後停止，等待作者確認首頁美術與互動，再開始 M3–M5 的內容同步、出版書架和讀者交流。**