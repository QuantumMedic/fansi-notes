# M5-A 最後驗收與交接

## 需求對照

| 需求 | 核對與最小修改 |
|---|---|
| 獨立文章、小故事、隨筆、短文，無 Podcast | 已支援全文與空配對表；平台連結選填。補 website-original 母稿來源，避免冒稱來自 IG/Vocus |
| 完整文字閱讀，不做 IG 圖卡閱讀器 | 已支援且維持原版型；不增加圖卡模式 |
| 作者作品館、不預設小說全文 | 已支援書封、簡介、出版資訊、購買入口；試讀與世界欄位選填 |
| 已公開短篇經授權全文閱讀 | 原本只有 excerpt，現增加獨立 full_text 核准資料；只允許 published＋short，未授權直接拒絕 |
| 歷史一次匯入、未來逐篇同步 | 已有批次暫存工具與單篇 SOP；兩者不會自行寫入 GitHub、合併或部署 |

測試全部使用合成資料；不新增真實作品，不更改25集 proposed 或 GUID 關聯。

## Mac 開啟完整本機預覽

開啟「終端機」，執行：

```sh
cd /Users/chiangtzungfang/Documents/fansi-notes
export PATH="$PWD/.local-runtime/bin:$PATH"
export ASTRO_TELEMETRY_DISABLED=1
npm run dev -- --host 127.0.0.1 --port 4321
```

本機已有 Node 24.22.3 與依賴，毋須重新安裝。若換電腦，先依 .nvmrc 安裝 Node，再 npm ci。啟動後以終端顯示的 Local URL 為準；若4321被佔用，工具可能改用其他port，網址也要跟著換。不要同時啟動多份。

- 首頁：http://localhost:4321/fansi-notes/
- 文章列表：http://localhost:4321/fansi-notes/articles/
- 合成全文：http://localhost:4321/fansi-notes/articles/paper-garden/
- 作品館：http://localhost:4321/fansi-notes/works/
- 合成作品介紹：http://localhost:4321/fansi-notes/works/demo-paper-city/
- 作者：http://localhost:4321/fansi-notes/about/

dev 可看 proposed 待審核分類，不代表正式核准。需要看正式建置的分類行為時：

```sh
npm run build
npm run preview -- --host 127.0.0.1 --port 4322
```

再開 http://localhost:4322/fansi-notes/。這仍是本機，不會公開部署；審閱路由不存在，未確認 Podcast 仍在全部單集。一般前景程序可 Ctrl+C 停止；若 Astro 使用背景開發模式，可執行 `./node_modules/.bin/astro dev stop`。首次合成短篇全文驗收在隔離測試內，不為示範而新增作者作品。

## PR #1–#6 建議合併方式（現在不執行）

已再次查核六份PR皆open、未merged。依序 **#1 → #2 → #3 → #4 → #5 → #6**，但不是直接按每份目前的 Merge：#2–#6 的 base 現在指向前一階段分支。

1. 作者批准後，先確認 main 沒有部署工作流程或 Pages 分支自動發布；建置與排程artifact不能等同公開部署。
2. 保存各分支SHA與備份標記；每份PR通過CI與內容審閱後，以 **merge commit** 保留原有祖先關係。
3. #1 合併 main 後，把 #2 的 base 改成 main，重新查看差異只含該階段、確認無衝突並重跑CI，才合併。
4. 重複：#2完成後處理#3，直到#6。若出現重複diff或衝突，先停止該次合併並核對基底，不直接覆蓋main或force push。全部完成前不刪依賴分支。
5. 本次這種堆疊PR不優先採 squash／rebase merge；它們改變提交歷史，後續分支可能需要額外整理。若作者偏好單一提交，應另做完整堆疊遷移計畫。
6. 全部完成後再核對main與最終驗收內容一致、執行全測試、清理分支。合併並不代表已批准M5-B或部署。

依據：[GitHub 合併方式說明](https://docs.github.com/en/pull-requests/reference/pull-request-merges)。目前僅提供計畫，沒有變更base、合併或啟用Pages。

## M5-B 需要作者提供或決定

- **文章清冊與授權**：每篇永久work_id、標題、摘要、既有三系列、主要主題／選填次要主題、正式公開日期、核准署名／版本／日期；明確允許放公開GitHub與網站的完整書面定稿。沒有Podcast可留空，IG/Vocus網址有則提供。
- **小說與出版清冊**：正式書名、作品形式、出版狀態、系列與閱讀順序、核准簡介、出版社／年份、官方購買網址、可使用的書封與來源／授權。預設不提供全文；試讀、短篇全文、番外、人物世界各自確認公開範圍。
- **品牌與作者資料**：正式署名、核准簡介、可公開年表、照片及圖片授權、正式社群帳號；首頁視覺沿用，不自行改版。
- **Podcast**：25集 proposed 最終集中核准或修正；若有文章對應，提供明確work_id ↔ GUID核准關聯。既有RSS、Spotify與Apple單集連結不用重新提供。
- **留言與私訊**：服務與預算、訪客登入要求、審核／刪除／保留政策、通知需求；以作者帳號設定私人收件與管理者，私密資訊不寫公開repo。決定前不付費或啟用。
- **上線決策**：M5-A驗收、首批公開範圍、正式網域／網址、SEO與Vocus重複內容的canonical策略、公開時間、部署明確授權。移除合成資料，真人驗證服務送達／失敗／回覆與手機，才解除noindex與robots阻擋。

歷史批次清冊與未來單篇都要工具實際操作；不要求作者補Podcast來填滿文章頁。以上資料可分批提供，未提供項目維持空狀態。
