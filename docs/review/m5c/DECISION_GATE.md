> **2026-11-15 作者最新授權／PR #19 已備資料（未合併）**：作者授權將九篇已公開 IG 書面全文重用於網站，已在 PR #19 分支建立9篇 Markdown、補滿25組 Podcast GUID 配對及九筆 IG URL；原先『九集Podcast-only』『尚未核准網站全文』是前期狀態，不能據此阻擋或要求再次逐篇核准。對 Vocus 沒有核實網址的8篇隱藏 Vocus 按鈕即可；圖片採 Vocus 既有圖片位置與已公開素材，明顯第三方或失效的省略，無圖正常排版，不再由圖片阻擋 M5-D。**唯一 Codex 工作指令：**`docs/review/m5d/FINAL_ARTICLE_PODCAST_CODEX_HANDOFF_2026-11-15.md`。正式部署仍未授權。

# M5-C 唯一作者決策表｜剩餘待核准事項

此清單對應 [INPUT_GAPS.json](INPUT_GAPS.json)、[IMAGE_TRIAGE.json](IMAGE_TRIAGE.json)、[PUBLICATION_CANDIDATES.json](PUBLICATION_CANDIDATES.json)。已核准的 48 篇文章分類及全文不可重新提案。INPUT_GAPS 的 IG／人氣空欄是**歷史 seed**，實際接線請查 `src/content/articles/`、`src/data/popularity.json` 及 `docs/review/m5d/`。本表的圖片、出版、服務與公開授權待審項仍屬候選；Podcast 分類／作品配對已於 2026-11-15 另行完成。

## 可直接使用、Codex 不必再蒐集
- 48 篇正式文章、Vocus ID／URL、系列、主次主題及原文校驗：正式 frontmatter、M5-B batch-verification。
- 25 集公開 RSS GUID、Spotify／Apple 單集連結：src/data/podcast.json；25 筆正式 confirmed 分類：src/data/podcast-classifications.json（作者已委託 ChatGPT 完成）。
- 新匯入 45 篇的 151 筆圖片來源位置及圖說：IMAGE_TRIAGE；另外三篇只有 8 個位置的數量記錄，真正圖片 URL 尚未齊全。
- 15 筆原文單集 URL 證據、2 組原文／RSS 敘事內容比對，正式 16 筆唯一 GUID ↔ work_id 映射已寫入程式資料；鬼滅一集兩篇以一篇主要、另一篇保留獨立作品。詳見 PODCAST_MAPPING_APPROVAL_2026-11-15.md。
- 7 筆公開出版作品線索：PUBLICATION_CANDIDATES；僅候選，沒有核准書封／直達連結。

## 作者集中核准：M5-C 收件閘門
1. **音訊分類與配對（已結案）**：作者明確授權由 ChatGPT 判斷；25 集均已 confirmed、16 集同作品對應、9 集 Podcast-only。分類與對應權威檔案見上方；無需再要求作者逐集確認。其餘項目按原定階段。
2. **IG 與社群熱門（第一批已接入）**：PR #11 已按固定 work_id 接入 47 篇 IG 主貼文、2 則同作品相關貼文及 47 篇文章人氣名次；另有 1 篇 IG 狀態未知。25 集 Podcast 人氣名次也已接入，統計口徑是**發布後首 7 天播放＋下載總數**，不可稱 Spotify-only Plays。精確擷取時間未知維持 null，不把名次推算成原始數值。上述資料不必重新索取；後續只審核新作品或明確缺口。
3. **圖片**：每篇選定封面無字原圖及可公開來源；每張內文圖決定採用／不採用、圖說、權利和可存放的網站素材路徑。Vocus 與 Canva 的「存在」本身都不是重刊權證據；來源不明不下載。Podcast 宣傳圖片改走統一收聽元件。
4. **摘要**：作者獨立摘要優先，平台 auto 摘要可作卡片／SEO；若不合作者風格，改採作者核准的原文開頭摘錄，網站不擅自改寫敘事。
5. **正式出版與作者頁**：七筆來源候選，確認實際書目／系列／封面權利／出版與試讀購買直達 URL；正式作者署名、簡介、可公開照片、品牌素材。
6. **留言／來信／分析**：選擇服務提供者、費用容忍、讀者登入門檻（原規格不能 GitHub-only）、作者審核與通知、私人收件規則、流量來源／點擊追蹤與隱私。尚未選服務前，不啟用對外可送出表單，也不以「將來的私人後台」代替服務驗收。
7. **正式網址及 SEO**：公開網域、是否與 Vocus 共存並如何決定 canonical／索引策略、公開時間。與網站部署分開核准。

## 允許的結案狀態
- verified_author_approved：有來源、核准及對應作品 ID，Codex 可用。
- absent_confirmed：確定沒有該版本，網站不顯示空 UI。
- pending_evidence：尚缺來源，**不得假設為零、不得猜連結或授權**。
- rejected_for_reuse：不適合網站重刊（尤其第三方圖片），保留圖說／合法外連即可。

M5-C 完成不代表所有作品有 IG、Podcast 或圖片；代表每一筆知道採用還是隱藏。缺少非必要的單篇社群指標可以記錄例外，不阻擋文章閱讀功能。若某功能需要一批核准數據才可公開（例如熱門榜），在未取得之前仍可先做好**不顯示排行**的功能與測試。

## ChatGPT 與 Codex 分工
ChatGPT／作者：讀取公開來源、Canva 現有設計的候選、整理及確認真實跨平台網址、人氣快照和內容／圖片授權；私人設計連結、後台報表、token、收件資料不入 GitHub。
Codex：只讀已核准清冊，按 SOP M5-D/E 接線、修改共用元件、批次填資產、跑必要測試與回報例外。不得再重抓 48 篇正文、要求 25 集 RSS 重新分類，或把任何候選自動提升為 approved。
