# M5-C 唯一作者決策表｜目前不代表核准

此清單對應 [INPUT_GAPS.json](INPUT_GAPS.json)、[IMAGE_TRIAGE.json](IMAGE_TRIAGE.json)、[PUBLICATION_CANDIDATES.json](PUBLICATION_CANDIDATES.json)。已核准的 48 篇文章分類及全文不可重新提案。

## 可直接使用、Codex 不必再蒐集
- 48 篇正式文章、Vocus ID／URL、系列、主次主題及原文校驗：正式 frontmatter、M5-B batch-verification。
- 25 集公開 RSS GUID、Spotify／Apple 單集連結：src/data/podcast.json；25 筆 proposed 分類：src/data/podcast-classifications.json。
- 新匯入 45 篇的 151 筆圖片來源位置及圖說：IMAGE_TRIAGE；另外三篇只有 8 個位置的數量記錄，真正圖片 URL 尚未齊全。
- 11 筆有精確外連證據的文章／音訊配對候選，牽涉 10 個 GUID，含兩篇文章指向同一單集：INPUT_GAPS。
- 7 筆公開出版作品線索：PUBLICATION_CANDIDATES；僅候選，沒有核准書封／直達連結。

## 作者集中核准：M5-C 收件閘門
1. **音訊分類與配對**：一次核准或修訂 25 集 proposed 系列／主次主題，以及有證據的 GUID ↔ work_id。多篇對同一集需明確決定網站顯示策略。證據不足者保持 pending。
2. **IG 與社群熱門**：實際存在的單篇 IG URL、同一擷取日期的讚數快照；無 IG 版本註記 absent，未知註記 pending。熱門文章標題預設標成「熱門文章（依 IG 讚數）」；熱門 Podcast 使用作者提供的 Spotify Plays 快照與一致日期／統計期間。不同來源不直接加總。
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
