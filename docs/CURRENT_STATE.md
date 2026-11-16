# CURRENT_STATE｜唯一目前有效網站狀態

## 目前階段：PR #25已合併／受保護限時驗證通道已接線／真實操作證據待補（2026-11-17）

作者接受PR #25並授權merge commit。合併提交`0fe555729dbb290b90a68fd6f0df8cdb39906366`，與PR HEAD完整內容樹一致；[main CI通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43902233778)。本輪從該main建立`prep/m6-controlled-verification`，沒有覆蓋其他工作。作者本輪明確授權受保護通道、精確臨時Turnstile hostname、限時寫入及自動復原，不等於正式發布授權。

- **已接線**：沿用現有受Access保護前台，透過私有service binding連到實際production D1／留言Worker。前台及後端逐次驗JWT與精確作者Email；公開API的workers.dev仍false，所有preview仍false，PRODUCTION_SERVICES_ACTIVE仍false。另有獨立、最長4小時的驗證租期；只有本輪受保護請求可使用，不能從公開參數開啟。
- **窗口實際狀態**：2026-11-17台灣時間04:06到期。受控期間D1允許少量合成驗收留言，獨立管理hostname暫時啟用但仍經既有Access及後端完整驗證。Turnstile只增加一個精確測試hostname。Pages設定實際讀回仍Branch=None／disabled，noindex維持，沒有執行release、修改Access政策或使用撤銷Token。
- **到期保護**：Worker每次請求檢查截止時間；D1觸發器拒絕跨截止時間才完成的寫入；雲端每分鐘排程將租期關閉並paused=1。本機監督程序負責關閉管理hostname、恢復Worker／前台／widget及私下備份後清理本輪精確留言ID。若Mac離線，雲端拒絕服務不受影響，但控制台設定清理可能延後；未實際讀回復原前不宣稱已完成復原。
- **已實測**：作者目前有效的Access登入可開前台及真正production管理頁，管理統計讀取0；私有通道health顯示configured／accepting_comments=true，文章正常讀到0／0。獨立未登入HTTP請求對前台、前台API、管理頁及管理API皆被Access轉址；公開production API回404。這不等於非白名單真實身分已驗收。
- **必要小修**：隔離本次瀏覽器留言憑證，避免舊staging待審提示混進production驗證；舊憑證不刪除。實際Workers不支援redirect:error，改manual並明確拒絕3xx。沒有重做留言介面。
- **尚待**：使用者真實發表／持久化／回覆／自刪、非白名單真實管理拒絕、獨立瀏覽器自刪權限，依實際回報補證據。目前沒有填任何新的LIVE_*通過旗標。Formspree已實收的證據沿用；本輪沒有寄信或送分析流量。

本輪保留原106項保障，新增6項窗口／JWT／路由／真SQL到期／設定／憑證隔離測試；本地112項通過、輸入與64串清冊／local預檢通過、check 135檔0錯誤0警告（1個既有hint）、114頁普通build通過。三Worker打包成功。CI以本輪獨立PR最新HEAD為準；真實人工測試不以CI替代。57篇正文、25集／配對、96圖、7出版作品／26入口、作者資料與人氣資料diff為零。唯一操作與驗收入口為[本批M6紀錄](review/m6/README.md)。

## 正式發布停止條件

受控通道證據及原兩項安全證據未完整時，不產生完整發布manifest、不啟用正式公開留言、不切Pages Actions來源。受控測試hostname不冒稱正式GitHub Pages hostname已通過；後者須另行發布授權及發布後冒煙檢查。正式索引解除另行確認。未合併本輪新PR、未新增付費、未改正式內容或設計。

## PR #24合併與發布保護（前輪已完成，AUD狀態以頂部為準）

- 作者接受PR #24並授權merge commit。合併前重新讀取Pages：Deploy from a branch／Branch=None／currently disabled；PR最新HEAD `1deb0261d4df4570c3531d9229a1061ad767abd5` CI通過、main未被並行更動，正式內容diff為零。
- merge commit：`745553452f229f359d17989d61dce1c582461e99`；[main CI通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43845649652)。合併後完整內容樹與PR #24 HEAD同為`6b89a6ae4967ca729d8cfcd174e620b43bbdaad9`。本次現況文件提交在該比較之後，與工程樹核對分開記錄。
- 已建立並儲存`github-pages` Environment：required reviewer=QuantumMedic、禁止管理員bypass、只允許Branch `main`（1 branch／0 tags）。Prevent self-review維持關閉，讓唯一作者可明確審核自己發起的發布；不等於免審核。沒有加入Environment secrets或variables，尚不填未驗證的RELEASE_SERVICES_JSON。
- 完成設定後再看Pages，仍停用；未切換Actions Source、未執行release、未解除noindex。Environment保護已實際儲存，但本輪沒有為測試審核而啟動部署。
- production唯讀核對：兩Worker入口／preview／activation仍關閉；管理Worker已部署AUD仍為空，實際AUD僅在私人設定；D1仍0留言／paused=1／moderation=1。沒有重建資源、覆寫私人設定或部署。

## 前批整合基線（已完成，非本輪部署授權）

作者已接受網站、留言與管理操作及PR #23工程準備。此次僅授權程式碼整合；#19→#20→#21→#22→#23均以merge commit完成，未刪分支、未force push。#20／#21已轉Ready；每次先將下一PR base調整main，核對內容樹並等待main CI成功後才繼續。

|PR|merge commit|main CI|
|---|---|---|
|#19|56a49243d0d3e7a1e25dffdf3735f1129babf4be|[通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43829334531)|
|#20|0806d833d660b8ef440e9b7c114f5ba23ba444ee|[通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43829533288)|
|#21|18af226b0cde7b1cdbc608c2a2d17a1521e6127b|[通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43829749879)|
|#22|eb87ad5c02076a53d3ba43575a39fd19da014d20|[通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43829954572)|
|#23|47cf2b41d2777382f45ec1f65936a25071ce19cb|[通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43830150386)|

**內容樹比較時間點（本文件提交之前）**：整合main `47cf2b41d2777382f45ec1f65936a25071ce19cb`與原PR #23 HEAD `f9e3e173ee853f79257707ac8e7bad2fe8f6e3d5`完整樹均為`55c5cb9479ec9d5cc5850d6ad185aa26f37657a3`，git diff為零。57篇文章、25集與映射、96圖、7作品／26入口、作者資料及互動程式完整保留。其後僅本CURRENT_STATE文件更新，與上述工程樹比較分開記錄；工程版本98項測試／check／build由main CI成功確認。

## 發布與服務狀態

- 合併前後均實際讀取GitHub Pages：Source為Deploy from a branch，Branch=None，顯示Pages currently disabled。未按Save或啟用。
- 本輪已建立github-pages審核保護與main-only規則，詳見上段。release僅workflow_dispatch，不隨main push執行；本輪只有驗證CI，沒有執行release。
- 整合當時noindex維持、服務預設關閉、未建立production；本輪已授權資源建立但仍停用，詳見頂部。
- 完整留言、聯絡、分析仍是目標；靜態服務關閉版本只是備案，不代表取消留言。
- 唯一M6操作入口：docs/review/m6/README.md。該報告內「PR待合併」等為準備當時紀錄，最新整合狀態以上表為準。

## PR #25之前的正式啟用待辦（歷史；本輪狀態以頂部為準）

1. 作者另行授權受控啟用驗證及正式發布。Environment保護已設定；Pages Actions來源仍待正式發布授權時切換，不先啟用。
2. D1、Workers與Turnstile已建立並停用；Access政策與實際AUD已私下配置及讀回；AUD已部署並讀回，仍須另行授權受控驗證通道、限時寫入及管理登入實測，之後才可啟用正式服務。初始空庫已備份，不能搬staging合成留言。
3. 兩項安全證據仍未完整完成：非白名單真實帳號的私人管理拒絕、獨立瀏覽器讀者自刪權限。作者本輪暫不追加測試；不重建Access Token、不改寫為通過或已接受所有風險。production預檢門檻保留。
4. 第一次約14:55手機LINE開啟的是一般staging文章，沒有已確認非作者進入管理端證據。後續無OTP不等於拒絕驗收通過；當時authentication logs未取得，未繞過瀏覽器安全限制。
5. 正式分析切換與隱私、索引／SEO／分享圖用途、發布後檢查及回退確認，均在正式授權時進行。Gmail既已實收，不重寄。

## 以下為歷史階段紀錄（未合併／待授權等敘述僅指當時）

## 真實 staging 接線（2026-11-16，作者已接受／安全補驗保留）

- 同一 PR #21 接續工程提交 `8bad741`，保留 PR #20 依賴；未合併、未部署正式官網、未解除 noindex、未升級付費。
- 作者已完成官方 Wrangler OAuth；短期受限 Token 補足 Access 設定權限。實際帳號、既有組織與 One-time PIN 已核對，沒有重建組織。先核對兩個 Access 應用的精確作者允許政策，再部署 staging 前台與私人管理 Worker；公開留言 API 不要求 Access 登入。三個 Worker 均停用 preview URL。
- 本專案 staging D1 已套用 0001／0002；真 Turnstile、發表、重整持久保存、同瀏覽器自刪、作者回覆與原文定位、待審→公開→隱藏→刪除皆已實測。刪除父留言後保留回覆。只有少量明示合成的驗收資料，沒有搬入本地13則示範或任何真實讀者內容；驗收後先審模式與暫停均恢復關閉。
- 作者親自完成 OTP，受控前台及私人管理可操作。匿名與偽造憑證對管理頁／列表／設定／匯出及前台資產均被 Access 阻擋；獨立請求錯誤自刪憑證、跨 origin 與無效 Turnstile 均遭拒，公開 API 無管理路由。**第二個真實非白名單帳號尚未操作驗證**；本地錯誤身分／JWT測試與精確政策查核不能代替這一項。
- 唯一一封「凡思筆記｜接線驗收」合成信已由受控聯絡頁送出，Formspree 接受，**作者已確認 Gmail 實收**；不再重寄。僅增加選填 `PUBLIC_CONTACT_SUBJECT` 隱藏欄位，普通建置未設定即不產生。公開 Email 備援仍關閉。
- GoatCounter **測試站**控制台已看到文章／聯絡頁瀏覽、留言／來信提交及一次 Vocus 外連事件；只含固定路徑、作品ID與事件名稱。正式與測試控制台匿名均只顯示登入頁；沒有向正式站送驗收流量，也沒有公開統計。
- 私人設定、資源ID／實際管理書籤、原始操作紀錄與停用方法均在 Repository 外，目錄0700、設定0600；公開文件僅保留去識別驗收。正式 production 仍未設定，普通 build 三服務預設關閉，公開頁面不輸出管理入口。
- 保留原90項保障，現91項；本輪91項測試全綠、check 114檔零錯誤／警告／提示、114頁build及輸入／64串清冊／local與staging預檢通過；CI結果見PR最新HEAD。57篇文章、25集Podcast與配對、96張圖片、7筆出版／26連結、作者資料與人氣均未修改。
- 作者已親自接受本輪操作與視覺，並確認撤銷 fansi-access-staging-setup；不再要求重驗視覺或重建Token。第二個真實非白名單帳號與獨立瀏覽器自刪仍列安全待驗，接續M5-F，不代表授權合併或production。

## 前輪本地驗收歷史（以下未接線敘述僅指當時）

本輪公開管理入口移除：程式與本地權限測試已完成；90項測試、check零錯誤／警告／提示、114頁build、輸入檢查／服務預檢、兩個Worker dry-run通過。正式Access政策與真實登入尚待接線驗證；GitHub CI以PR #21最新HEAD為準。


**留言介面與管理體驗已實作／本地及CI測試通過／待作者視覺驗收與免費帳號設定、真實接線。** 工程提交 `e5ef26b3d22a0309a1e538675de6784fb2dba7d2`：[CI #123 全綠](https://github.com/QuantumMedic/fansi-notes/actions/runs/43800453776)，88項測試通過；未合併或部署。

更新：2026-11-16。**作者已表示主要展示驗收良好，下一批採零訂閱費互動服務。** 本分支已實作免費互動程式，本地與測試結果見下；未建立外部帳號、未送真信、未啟用正式分析，未合併或部署。

## 持續有效決定：私人書籤管理

公開HTML與JavaScript停止產生作者登入、作者專用回覆連結及管理網址。舊PUBLIC_COMMENTS_ADMIN_URL即使留在環境也忽略。作者保存私人管理書籤，Access驗證後集中管理；只保留管理頁返回原文的單向導航。認證與公開留言功能不變。staging Access政策、作者登入已驗證；production尚未建立。

## 唯一當前開工入口

- Repository：`QuantumMedic/fansi-notes`。
- 已完成M5-D：PR #19，`research/m5c-nine-ig-permalinks-20261115`，HEAD `756e7696e592df4bf0d9cd26013c73cc0ce281b1`，尚未合併。
- 已完成M5-E主要展示：PR #20，`prep/m5e-publication-display-20261115`，本批建立時HEAD `c96ec85f0c69d87647991e95ea534ffa82a3eec1`，尚未合併；原73項測試、check及114頁build通過。
- **新工作分支**：`prep/m5e-free-interactions-20261116`，從上述PR #20精確HEAD分出，規格準備與實作都在新分支，不搶改#19/#20。
- **唯一互動服務交接**：`docs/review/m5e-services/START_HERE.md`。
- **選型、設定及測試邊界**：`docs/review/m5e-services/SERVICE_PLAN.json`。
- 新分支PR以PR #20分支為base。前序經作者另行授權合併後，再整合最新main並調整新PR base；不可從舊main遺失前兩批成果，也不可自行合併或force push。

## 六步工作順序（不另外新增里程碑）

1. ChatGPT完成規格與來源核對：**本次已備妥**。選型與功能邊界固定；程式已在本批實作。
2. Codex已完成留言＋最小作者管理頁＋私人來信＋分析adapter＋本地／CI測試；帳號未設定不阻止本地開發，不能冒稱真服務已接通。
3. 作者集中一次完成免費帳號登入、Gmail驗證、必要服務設定與受控測試部署授權；可與2並行。公開Email備援需分開確認，收件授權不自動變公開個資。
4. Codex在同一互動PR接線，做真實留言／刪除／Access登入、Gmail收件與隔離分析驗證；作者驗收後才結案M5-E互動。
5. M5-F一次全站整合驗收。依明確作者授權，先#19、再#20、再互動PR，逐一確認base與CI後合併；不與正式部署混同。
6. M6另行批准正式上線、SEO與受控同步／回退。M7大型私人後台仍選做。

## 首輪本地實作歷史（真實接線結果以上方為準）

- **留言**：Cloudflare Workers/D1/Turnstile免費方案，免註冊暱稱純文字、預設防垃圾通過後公開、可切先審核、逐則安全管理碼讓讀者自刪。公開API與作者管理Worker分離；管理端Access Free＋Email一次性驗證、精確作者allowlist，預設拒絕無認證請求。
- **管理**：最小留言列表／回覆／隱藏／刪除／審核開關／匯出；第一版不寄留言Email通知，不做會員、附件、即時聊天室或大型後台。這是作者確認的低成本縮減，不是忘記原規格。
- **私人聯絡**：Formspree Free，收件地址已由作者指定，於服務後台私下驗證，不在公開repo放實際地址。準備mailto／複製Email備援，但未核准公開前不寫入地址。未設定不可假成功；遇免費額度不足不自動升級。
- **分析**：GoatCounter免費託管，私人控制台，僅必要頁面與作品外連事件；本地/CI/admin預設不送，不收留言或來信正文，不改原熱門排名。
- 帳號與 Formspree／GoatCounter 端點已有作者確認資料；D1 ID、Worker URL、Turnstile widget、Access 應用及真實登入仍須以授權後的帳號查核與操作結果為準。
- Codex第一批交付後建立一份`docs/review/m5e-services/ACTIVATION_CHECKLIST.md`與配置預檢完整列缺項。該檔、設定樣板與預檢已建立；`local-ready`通過，staging／production仍為not-configured。
- 最新授權允許免費 staging 受控端點與增量遷移，不允許 production、付費升級或額外付款變更；作者已自行完成 Free 開通要求。

## PR #21 留言閱讀與作者管理調整（2026-11-16）

- 本輪取代讀者複製／下載／恢復管理碼UI；瀏覽器自動保存憑證，失敗保留頁面記憶體。後端hash驗證、JWT與冪等仍保留。
- 10則主留言最新在前，作者回覆不占配額、每批10則手動追加。穩定seq游標、前端去重、有限定位查詢；待審與隱藏不可公開定位。
- 作者回覆固定「宗凡」與核准照片、server author徽章；訪客不能取得作者身分。管理頁作品標題、未讀／待審／待回覆全量統計、按需回覆欄及已讀操作。
- 新增0002增量migration；未執行遠端遷移。公開網站不產生管理入口；作者使用私人書籤經Access進入管理頁；canonical_path由清冊產生，支援/fansi-notes。
- 本地反脆弱種子：13公開主留言、4合成作者回覆、1待審；可重跑、只在loopback adapter使用，不進正式HTML或DB。
- 驗收與截圖見同批README。本地check/build通過；GitHub CI以PR #21最新HEAD為準。正式免費帳號與真實接線仍未完成。

## PR #21 第一輪歷史實作與驗收（以下管理碼UI已被本輪取代）


- 分支 `prep/m5e-free-interactions-20261116`，父提交 `8d0819c82d0437c2feeb986f2754c7b14efd3077`，base仍為PR #20；未改#19/#20。
- 公開／管理Worker分離、D1遷移、64個自動產生討論串與25個核准GUID別名。文章與Podcast共串，出版按冊別，不新增作品。
- 純文字／暱稱，256bit瀏覽器私碼、後端hash、同請求ID冪等、持久限流與Turnstile Siteverify。作者Access JWT驗簽與精確Email、同origin寫入，缺設定拒絕；審核、暫停、回覆、隱藏、刪除、分頁匯出已實作。
- Formspree adapter含提交中／接受／錯誤／逾時／額度處理；只有另行批准才顯示Email備援。GoatCounter獨立開關、固定事件、localhost／CI／admin／review排除；正式均維持關閉。
- 輸入檢查通過；check零錯誤／警告／提示、build114頁、原73項＋新增13項＝86項測試通過。使用Miniflare本地D1真SQL與隔離JWT簽章；兩個Worker `--dry-run`打包通過，沒有遠端動作。工程提交 `313d50cada8e8fccde869dedf3b23c67a8284c88` 的 [GitHub CI #121](https://github.com/QuantumMedic/fansi-notes/actions/runs/43796342999) 全綠（輸入檢查、check、build、86項測試）；後續文件提交以PR最新HEAD檢查為準。
- 實際瀏覽器完成發表、作者回覆、先審核、讀者自刪保留回覆、表單接受／429／逾時。1440px／390px八張截圖，360px留言／管理無溢出、鍵盤焦點可見。見 `docs/review/m5e-services/README.md`。
- `npm run services:local`＋`npm run dev:services`提供4335前台、8787 API、8788隔離管理與8789假收件；只綁127.0.0.1。本地管理登入由測試adapter提供合成JWT，不是Cloudflare Access線上登入。
- 唯一下一步清單：`docs/review/m5e-services/ACTIVATION_CHECKLIST.md`。Gmail實收、真Turnstile、Access OTP及隔離線上分析**尚未驗證**。不宣稱M5-E整階段完成。

## 固定成果：禁止重新整理或覆蓋

- 57篇文章（48＋9IG書面）、25集Podcast、25組GUID↔work_id；凡思維8／文章與故事49。文章、分類、日期、平台URL、原文hash與原16組配對完整保留。
- 151筆內文圖處置：96接入、55省略；另外8個無URL歷史位置維持無圖。固定文字卡、IG頁尾、搜尋排序、凡思維純音訊、文章20／Podcast15／主題12分頁正常。
- 56個IG人氣名次＋1null、Podcast首7天播放＋下載順位不變，不冒稱Spotify-only Plays或站內閱讀。
- 七筆出版作品、26媒介入口（含8博客來直達）、六張正式遠端書封、指定作者照片、四段作品介紹與推薦全顯示；近期八筆博客來已經有限瀏覽器驗證匹配，不能再退回「缺網址」。
- 三段作者簡介、首頁短介、13事件／11來源已接入。「經歷與作品」新至舊，歷史獎項與版本稱謂保留，指定照片不改。
- 原驗收證據：`docs/review/m5d/final/README.md`、`docs/review/m5e/README.md`。原文／資料保護基準不得換掉來讓新測試變綠。

## 保留的非阻擋例外

讀墨官網單冊直達未全核實；金石堂通路保持正確標示，不等於作者取消該需求。遠端圖片依供應端可用性，已有失敗回退。《數據風暴》保留已確認的HTTP原發表入口。這些不重開文章或小說工程。

## 階段真實狀態

|階段|狀態|下一步|
|---|---|---|
|M5-D及M5-E主要展示|實作／測試完成，作者表示驗收良好；#19/#20未合併|凍結內容；經獨立授權再依序合併|
|M5-E互動服務|互動程式已實作／本地與CI測試通過／待帳號設定及真實接線|同PR #21集中設定→受控接線實測，不另開架構|
|M5-F|未開始|互動完成後一次全站驗收|
|M6|未授權|正式部署、SEO、同步與回退|
|M7|選做|日後視需求做大型私人管理中心|

準備完畢、已實作、測試通過、作者驗收、合併與部署分開記錄；不把本地mock／離線CI當作Gmail已送達或Access線上認證成功。
