> Current authorization: M5-A development/testing/import preparation. Read [docs/CURRENT_STATE.md](docs/CURRENT_STATE.md) first. Earlier M0–M2-only instructions are historical; all privacy/publication safeguards remain binding. No merge, deployment, paid service activation, M5-B or M6.

# 凡思筆記 × 作者個人品牌｜Codex 開發交接包 v1.0

**交接日期：2026-11-12（Asia/Taipei）**  
**專案：** `QuantumMedic/fansi-notes`  
**用途：** Codex 可依此開發網站。**本交接包只有規格、流程與範例；未包含網站程式碼、未發布文章或真實帳號金鑰。**  
**內容優先順序：** 作者最新明確指令 ＞ 本交接包 v1.0 ＞ `reference/` 歷史討論稿。遇到不一致時，以作者已確認內容為準，不自行補寫作者資訊或文章內容。

## 一句話定位

建立一座有「可探索繪本首頁 × 文學雜誌式閱讀」的繁體中文創作網站，整合《凡思筆記》短篇與深度文章、《凡思聲》Podcast、作者小說與出版作品、社群連結及讀者交流；作者仍自行發布外部平台，網站負責展示、分類與同步。

## 已確認（可照做）

1. 《凡思筆記》與作者個人品牌**雙品牌並行**；《凡思聲》為 Podcast 名稱。
2. 首頁：展開故事書的連續平面繪本場景，搭配輕微 2.5D 景深、滑鼠 Hover／視差互動；內頁採安靜、成熟的文學雜誌閱讀體驗。
3. 深度文章有較強的封面沉浸感；《凡思維》研究短篇較簡潔、快速進入正文。
4. 小說與出版區「收藏書架＋各作品獨立故事世界」。
5. 每篇作品有唯一固定 `work_id`，網站正文使用經作者確認的 IG／Vocus **共用書面母稿**，Podcast 長版逐字稿是另一份獨立母稿。
6. 網站文章、單集、IG／Vocus 對應網址、分類及相關作品集中管理；IG／Spotify／Vocus **作者自行發布**。
7. 讀者需要公開留言、作者回覆、私人來信與合作聯絡；不可只提供「必須有 GitHub 帳號」的留言方式。
8. 不擅自公開、臆造、改寫原稿；不任意修改現有 Canva 或其他 GitHub 專案。

## 需要先知道的幾件事

- GitHub 公開儲存庫在任何分支與 PR 中都**不能放尚未批准公開的完整備稿**；五篇待發作品只作為用例名稱，不提供全文。
- 「ChatGPT 對話完成 SOP」**不會自行觸發 GitHub 更新**。v1 的明確動作是作者要求「同步網站」，ChatGPT／Codex 才將已核准內容寫入；之後部署自動完成。
- Spotify RSS **可偵測新集數**，但異名文章與集數需依穩定識別碼人工確認關聯；不可僅用標題猜測。
- IG 與 Vocus 初版發布後，各貼一次 URL 即可。未來才考慮透過 Meta API 自動發現，**不自動發文**。
- 插畫、書籍真實封面、作者公開姓名／照片、部分網址、留言服務需作者補件；可先以**明確標示的示意圖與假資料**做原型，但不可當正式內容發布。

## 文件索引（建議 Codex 依序讀取）

| 檔案 | 內容 |
|---|---|
| `docs/01_產品定位與網站地圖.md` | 目標、主要導覽、完整路由、讀者動線、功能邊界 |
| `docs/02_視覺設計與互動.md` | 首頁五場景、手機操作、字體與色彩方向、動畫規範 |
| `docs/03_各頁面規格.md` | 首頁、文章、Podcast、小說、作者、留言及聯絡的欄位與空狀態 |
| `docs/04_內容模型與每週同步.md` | 稿件身分、標籤、狀態、書面母稿、Spotify RSS、IG/Vocus URL、發布安全 |
| `docs/05_技術架構與安全.md` | Astro、GitHub Pages、資料夾、Actions、隱私、效能與 SEO |
| `docs/06_開發里程碑與驗收.md` | 各 PR 範圍、測試案例、交付與演示要求 |
| `docs/07_待補資料與作者決策.md` | 可開始與正式上線的差異、需要作者補齊的資料 |
| `docs/08_SOP網站同步增補.md` | 加入現有內容 SOP 的最少新步驟 |
| `examples/作品資料範例_僅示意.yaml` | 非真實發表資料的內容格式示意，不供正式上線 |
| `CODEX_開工指令.md` | 可直接交給 Codex 的開發指令 |
| `reference/設計討論_v0.1_歷史參考.md` | 之前討論稿，僅作背景參考 |

## Codex 第一階段交付範圍

先完成 **M1：網站骨架／設計系統／可運行的路由**，以及 **M2：首頁可操作互動原型**；以**虛構假資料和未定版圖層**驗證操作。完成後提供 PR、可預覽網址（若可用）、桌機／手機／鍵盤／減少動態演示。**不匯入五篇未發表文章、不啟用自動公開。** 後續里程碑待作者逐項驗收。

## 技術查證網址

- Astro GitHub Pages：https://docs.astro.build/zh-tw/guides/deploy/github/
- Astro Content Collections：https://docs.astro.build/zh-tw/guides/content-collections/
- GitHub Pages：https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
- Spotify RSS：https://support.spotify.com/creators/article/finding-and-enabling-your-rss-feed/
- Spotify Embeds：https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed
- GitHub Actions schedule：https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows

## M3 使用與驗收

- [每週更新網站](docs/每週更新網站.md)
- [M3 測試與桌機／手機畫面](docs/review/m3/README.md)
- [開發接續紀錄](docs/開發進度.md)

已設定作者提供的正式 RSS 與 Spotify 節目網址；文章仍為合成測試資料。每日讀取僅輸出審閱 artifact，沒有部署或自動回寫。
