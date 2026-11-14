# M5-B 首批文章驗收

本輪僅匯入作者明確授權的三個 Vocus 完整文字版本。沒有匯入其他作品、圖片或書籍素材，沒有公開部署或合併 PR。

| 文章 | 網站系列／內部值 | 主要／次要主題 | 桌機1440px | 手機390px |
| --- | --- | --- | --- | --- |
| 別讓意志力透支！從「餅乾與蘿蔔實驗」看如何有效達成目標 | 凡思維／fansiwei | 心理與行為／科學與科技 | [截圖](willpower-desktop.jpg) | [截圖](willpower-mobile.jpg) |
| 從《反脆弱》看人生設計：擁抱不確定性，在衝擊中持續成長 | 文章與故事／longform | 書籍與文學／哲學與人生 | [截圖](antifragile-desktop.jpg) | [截圖](antifragile-mobile.jpg) |
| 會說話的影子 | 文章與故事／special | 個人與創作／心理與行為 | [截圖](shadow-desktop.jpg) | [截圖](shadow-mobile.jpg) |

## 原文完整性與資料邊界

來源連結、作者、發布與更新時間、全文雜湊、原文外部連結證據見 [source-verification.json](source-verification.json)。從指定頁面的 Lexical 正文轉成可選取的 HTML 文字，再獨立對照來源渲染 HTML：正規化空白後逐字一致；建置後測試再次驗證同一雜湊。原段落、標題、強調、清單、圖片文字說明和結尾保留。metadata 摘要直接採原文第一段，未另行摘要或改寫。

三筆 work_id 由各自唯一 Vocus 來源 ID 建立。作者署名使用來源「凡思筆記」，日期取來源 lastPublishAt／editAt，未編造缺失資料。圖片僅保留位置提示與原文圖說，無圖片檔、遠端圖片嵌入或測試封面。原文既有 Spotify／Apple 外連仍留在正文，僅作來源證據，不代表核准 RSS GUID 配對。

前台中央字典只有凡思維與文章與故事，後者涵蓋 longform 和 special。原 longform／special 路徑保留靜態轉址；舊文章查詢參數仍可用。小說、九主題、25集 proposed 狀態與既有關聯架構不變。開發模式仍能看到明示待審核的 Podcast 分類；正式 build 不使用 proposed 分類。

## 驗收結果

- 38/38 測試通過；Astro check 零錯誤、警告及提示；正式 build 58頁。
- 三篇完整正文、來源、標題、日期與署名正常；每篇只有一筆文章，沒有將影子放入小說作品館。
- 實際瀏覽器桌機1440與手機390排版通過，無橫向溢出；六張截圖為本機真實頁面，不是設計模擬圖。
- 桌機「文章與故事＋心理與行為＋荒謬的早晨」只找到影子；手機「凡思維＋科學與科技＋蘿蔔」只找到意志力文章。系列聯集、舊路由與次要主題也有自動測試。
- 公開建置審閱頁隔離、未核准內容防護、無自動配對、RSS保留人工分類、連結完整性及無部署 CI 等既有測試保持通過。

## 本機預覽與待作者事項

啟動方式沿用 npm run dev；入口 http://localhost:4321/fansi-notes/articles/ 。三篇路由為 articles/willpower-and-habits/、articles/antifragile-life/、articles/talking-shadow/。

本批文字不缺資料。若要加入封面及內文圖片，請另行授權並提供可使用素材；若要建立Podcast作品關聯，需另行確認精確GUID。這些不阻擋本次文字驗收。網站尚含明示合成範例，未將其當成正式作品。本輪到PR審閱停止。
