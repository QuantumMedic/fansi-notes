# M5-E 免費互動服務｜唯一開工與接線規格

2026-11-16。狀態：**作者已選定零訂閱費方向；程式已有本地基線；本輪調整閱讀與管理，雲端尚未接線**。本文件取代舊 Hyvor 年繳建議及會使同一需求反覆開工的流程。正式進度只寫 `docs/CURRENT_STATE.md`。

## 0. 工作分支、輸入與授權

- Repository：`QuantumMedic/fansi-notes`。
- 本批分支：`prep/m5e-free-interactions-20261116`，從 PR #20 已通過的 `c96ec85f0c69d87647991e95ea534ffa82a3eec1` 分出。
- 開工時 fetch 最新 refs，確認本批 PR 與並行工作；不要回到舊 main，不修改 PR #19/#20 的分支，不 force push。若前兩個PR未合併，本批PR以 `prep/m5e-publication-display-20261115` 為 base；前序經作者另行授權合併後，再整合最新 main 並調整本批 base，保留完整成果。
- 先讀 `AGENTS.md`、`docs/CURRENT_STATE.md`、本檔及同目錄 `SERVICE_PLAN.json`。只有實作細節需要時才讀相關元件，禁止重讀57篇正文、小說原稿或舊聊天。
- 這次交給 Codex 的任務是**一次開發留言、基本管理、聯絡、分析與設定檢查**，先完成本地及CI。登入／信箱驗證／免費服務條款由作者集中完成一次，再做同一PR的真實接線驗收，不能冒稱模擬成功等於寄信送達。
- **本次不授權合併、正式網站部署、解除noindex、付費、綁信用卡或新建外部帳號。** 沒有額外授權，不部署公開Worker；測試雲端端點也要在帳號設定階段確認。網站M6正式部署與M5-E受控服務測試是不同授權。
- 完整流程只有六步：①本次規格備妥；②Codex一次程式實作與本地驗證；③作者一次帳號／信箱設定與必要授權；④Codex接線與真實服務驗收；⑤M5-F整站驗收（作者授權後依依賴合併）；⑥M6另行授權正式上線。③可與②並行；不把技術選型或路徑選擇丟回作者。

## 1. 固定選型、免費邊界與可降級項

- 留言：Cloudflare Workers Free + D1 Free + Turnstile Free；管理端 Cloudflare Access Free。**自建最小留言功能，不買Hyvor，不用GitHub登入作讀者入口，不自建會員系統。** 免費不等於免維護，範圍以本檔為限。
- 私人來信：Formspree Free，僅代收表單並通知作者Gmail；目前免費額度50次/月、後台30天，AJAX可用。收件地址由作者在服務後台驗證，**不能拿公開Gmail地址直接拼成未建立的Formspree端點**。不做自動回信、附件、自建SMTP或新的寄信供應商。
- 分析：GoatCounter 免費託管，控制台設私人，只記基本頁面與作品外連點擊；沒有帳號則保持關閉。
- 免費額度用完時回報可用狀態與備援，不自動升級、不用付費試用、不開自動加值。Cloudflare既有帳號若已是付費方案，必須先讓作者知道不能據此保證零費用；不替作者更改既有帳號方案。
- 不買新網域，不把既有Astro靜態網站遷移到Cloudflare；留言使用平台提供的workers.dev地址即可。託管地址須由實際帳號取得，不寫假hostname。
- 第一版明確延後：留言Email通知、讀者帳號、會員資料、讀者編輯留言、圖片／附件留言、即時推播、按讚系統、M7統一後台。管理者可查看新留言與待審數，沒有Email通知也要清楚標示。
- 管理頁是本批留言的必要工具，不是M7大型後台。介面只含列表、回覆、隱藏／刪除、審核開關與匯出。

## 2. 既有入口與新檔案邊界

已查過的既有入口：
- `src/components/ServiceState.astro`：目前comments/contact占位，聯絡只檢查不送出。改成協調真實元件及未設定狀態，禁止殘留看似送出成功的假功能。
- `src/data/site.ts`：comments/contact目前provider為null；維持網站共用設定與base URL helper。
- `src/lib/catalog.ts`、`src/data/podcast-work-map.json`：權威書音身分；不得重算或改寫正式映射。
- `src/pages/articles/[slug].astro`、`src/pages/works/[slug]/index.astro`、Podcast詳頁現有ServiceState使用處：只調整服務接入與傳入thread key。先在實際目錄確認Podcast詳頁檔名，不因猜錯路徑創建第二條路由。
- `src/pages/contact.astro`、`src/pages/privacy.astro`、`src/layouts/Main.astro`：聯絡、隱私、分析載入。

建議新增位置（這些是**待Codex建立**，非聲稱已存在）：
- `src/components/Comments.astro`、`src/components/ContactForm.astro`、`src/components/Analytics.astro`。
- `src/lib/interaction-config.ts`：驗證公開設定並獨立控制各服務，禁止有假值也顯示已啟用。
- `src/lib/comment-threads.mjs`：可測的唯一thread resolver，供前端及後端允許清單共用。
- `services/comments/`：兩個Worker入口、共享資料層、SQL migrations、測試、wrangler設定；不要污染網站靜態路由或把資料庫放進public。
- `scripts/check_interaction_config.mjs`：本地／接線／正式模式預檢；輸出完整缺項但不輸出secret值。
- `docs/review/m5e-services/ACTIVATION_CHECKLIST.md`：Codex首次交付後原位建立唯一帳號設定清單（不能聲稱尚未建立的資源存在）。
- `docs/review/m5e-services/README.md`：保留本批本地及真實驗收、截圖；進度仍只維護CURRENT_STATE。

不需要附件、ZIP、小說PDF或新文章素材。可安裝必要且固定版本的開發依賴，這不是付費服務；遵循現有Node／lockfile，不任意升級整個專案。

## 3. 不搬網站：公開留言與私人管理分離

採兩個小型Worker，共用同一環境的D1 binding `DB`：

1. **public Worker**：只提供讀取、發表、用刪除憑證刪除。對允許的官網origin回CORS；不設讀者登入。沒有admin路由，即使猜URL也不能取得管理功能。
2. **admin Worker**：管理HTML與管理API位於同一origin，Cloudflare Access保護整個Worker及所有預覽網址；只允許作者的精確email，不可允許整個gmail.com網域或everyone。啟用One-time PIN登入方法，登入者精確比對allowlist。預設deny，缺Access設定或無有效身分一律拒絕。

公開API建議路由：`GET /v1/threads/:threadId/comments`、`POST /v1/comments`、`DELETE /v1/comments/:commentId`、不含秘密的health。管理Worker：`/admin/`及`/v1/admin/*`。**Worker API不使用/fansi-notes前綴**；只有官網頁面／本地資產套既有base helper。設定origin不含路徑，API URL用URL API組合。

管理身分驗證採正式Access JWT驗簽（issuer、audience、expiry、JWKS與精確email），使用維護中的函式庫；不得只信任可偽造的email header。若採官方受驗證的ctx.access，須驗證runtime及部署方式確實支援（Static Assets內部router可能不傳遞ctx.access），不能以缺ctx.access為理由放行。選一條有測試保護的方案，不建兩套登入。

管理寫入須same-origin、CSRF防護／Origin驗證、JSON Content-Type；cookie身份不能因CORS設定不當被跨站利用。公開API的Origin檢查不是身份認證，刪除仍要逐則憑證。不要在公開Worker後門代理admin。

## 4. 留言身分、刪除與防垃圾

### 4.1 作品對應

- 文章thread：`article:<work_id>`。
- 有核准配對的Podcast：使用該篇文章相同thread，依GUID查既有mapping，禁止按標題配對。
- 沒有配對的公開Podcast：`podcast:<RSS_GUID>`；日後正式配對時以明確alias／遷移維持留言，不自動合併不相干作品。
- 出版作品：`publication:<work_id>`，每冊依既有身分；平台外連不建立新作品。
- 由已公開catalog與publications產生允許清單及別名，提供可重複的匯出／同步命令，不能手寫64筆或要求每新增文章就重改後端程式。現有基線57文章＋7出版=64個討論身分，25音訊沿用核准文章串。鬼滅兩篇文章仍是獨立work_id。
- 後端拒絕未知thread及不在同串的parent/reply ID；不可讓client自行宣稱作者、核准或任意建新作品。

### 4.2 讀者流程

- 暱稱＋純文字留言，不註冊、不收Email、不支援HTML／圖片／附件。建議暱稱1–40字、內容1–2000字、請求上限16KiB，前後端同驗證。訪客不能假冒系統的「作者」徽章，徽章只由驗證後的admin寫入。
- 通過防垃圾檢查後預設公開。管理者可切先審核模式；pending不進公開查詢，原作者仍能用憑證刪除。保留「暫停新留言」開關。
- 每則留言的刪除憑證使用Web Crypto CSPRNG至少256-bit；前端在送出前產生並保存，後端只保存hash，禁止在GET回傳hash／憑證、在URL query或記錄中洩漏。以Bearer或JSON提交，HTTPS傳輸。測試A無法刪B，不能靠暱稱、IP、Email或可預測ID授權。
- 同瀏覽器顯示自己的刪除按鈕；憑證由瀏覽器自動保存，不顯示或提供複製、下載、恢復介面。儲存失敗保留頁面記憶體自刪；離開、換裝置或清除資料後不提供恢復。
- 用客戶端請求ID與唯一約束實作idempotency；雙擊、重試或回應遺失不能生成重複留言。不要把Turnstile一次性token當刪除碼或長期session。
- 讀者只能刪自己的留言，不能刪其他人的回覆。刪除清除該筆公開文字／暱稱／憑證；有回覆時保留最小tombstone關聯，不級聯刪掉別人內容。不宣稱供應商備份立即消失，隱私頁說明保留限制。
- 第一版只需一層回覆，作者可以回覆。讀者若可回覆，仍遵守自己的憑證規則，不開無限巢狀討論。

### 4.3 安全與可用性

- Turnstile必須後端Siteverify、驗success及預期hostname/action；token有時效且一次性。client畫面成功不等於後端驗證。
- 生產設定拒絕dummy key與mock auth；本地用官方測試key或隔離stub，兩種狀態分開。不能有可在公開request啟動的test/bypass參數。
- 參數化SQL、textContent／安全跳脫，測HTML/XSS／SQL injection。使用D1持久計數與短期匿名化fingerprint限流，不能只用隨時重啟的Worker記憶體；不要長期存原始IP。限流參數集中設定，錯誤回429+Retry-After，不記錄全文或憑證。
- 首次按「查看留言」才讀取，每批10則主留言由新到舊；作者回覆獨立限量、手動載入，不占主留言配額，索引與游標查詢；不做每秒polling、不在每張列表卡查留言數。公開response只含已核准字段；private/delete/admin回應no-store。
- 後端錯誤／額度滿／驗證失敗／離線都要保留正在輸入的內容，除非使用者自己清除；不能顯示成功、不影響正文及其他服務。
- 公開留言存在D1，不寫GitHub或公開CI artifact。匯出需admin權限，管理碼不進匯出；SQL備份只由作者在受控環境保存。提供備份、恢復及刪除資料的簡明操作步驟，不新增付費備份服務。

## 5. 私人來信：可用表單與低成本備援

- 作者已指定既有Gmail為收件地址；不用再問收件人。實際地址只在Formspree私人設定與本地secret欄位保留，**本公開規格不存放地址**。Formspree endpoint是帳號建置後取得的真實`https://formspree.io/f/<id>`，前端使用已驗證endpoint，不暴露私人收件設定。
- 保留讀者來信／合作邀約、選填暱稱、必填回覆Email與內容。只送到指定Formspree服務，不把私人內容送到留言API或分析平台。
- 無endpoint時明確尚未啟用，不能讓訪客填完再假成功；若作者批准公開聯絡地址，顯示mailto＋複製Email備援。**收件授權不自動等於公開地址授權**，PUBLIC_CONTACT_EMAIL及public_email_approved預設空／false，設定時一次確認。
- Formspree免費方案的AJAX與基本垃圾防護可用。使用provider支援的reCAPTCHA／垃圾防護，不把Cloudflare Turnstile當作Formspree已自動驗證。不得私自改用付費插件；官方預設支援與自訂honeypot額度分清楚。
- timeout、429、4xx/5xx、額度滿：保留輸入，正確顯示失敗與備援；提交中停用重複提交，不無限自動重寄。只有provider明確接受後顯示「已送出」，**實際送達Gmail另由真人確認**。
- 不上傳附件、不自動回信、不建SMTP、不把Gmail密碼交給程式。無JS時使用安全的provider原生提交或可見備援，不提供無效按鈕。

## 6. 分析、隱私與開關

- GoatCounter private dashboard。僅在明確啟用且hostname允許的正式/專用測試環境載入，localhost、CI、admin、review頁預設不送事件；接線驗證可用隔離的測試代碼，不污染正式統計。
- 事件：page_view、article_read_more、outbound_spotify/apple/vocus/instagram、outbound_bookstore、comment_submitted、contact_submitted。只送固定work_id／platform等允許值，不送留言、Email、管理碼、自由輸入搜尋詞、敏感URL/query/fragment。
- 事件只在對應成功時記；表單accepted不是已閱讀信件，外連點擊不是收聽或購買。原IG與Podcast人氣排序完全不動。
- comments/contact/analytics各自開關及獨立失效，不能因一個未設定就讓網站無法建置，亦不可默默假開啟。隱私頁依實際啟用服務列資料目的、供應商、刪除方式、瀏覽器管理碼及備份／保留限制；不宣稱網站完全不處理資料。
- 不把私人信箱公開、開啟第三方統計、寄真信或建立公開測試留言當作本地測試自動動作。

## 7. 一次帳號設定清單與預檢

讀 `SERVICE_PLAN.json` 的required_configuration，不填假值。首輪程式必須以local D1、官方測試key／mock provider完成測試，無外部帳號也能開發。完成後交**一份**ACTIVATION_CHECKLIST，不要每次只問一個設定。

預檢區分：
- local-ready：測試資源及依賴完整，沒有真實外連提交。
- staging-ready：作者已登入／授權受控測試Worker部署，D1／Access／Turnstile真實配置完成，Formspree收件已驗證，GoatCounter測試配置妥當。
- production-ready：正式origin／hostnames／設定齊全，無mock/test key，發布仍另須M6授權。

本地/雲端環境DB分離；不使用remote binding在測試中修改正式資料。預設禁止外部部署與schema遠端變更；得到測試授權才執行明確環境的遷移。建立資源腳本可先產生plan，不偷偷建立帳號、改付費方案或改其他專案。

管理端先以fail-closed部署，再設定Access，最後驗證未登入被拒絕與作者成功登入；公開端無admin功能。不要整個Cloudflare帳號套登入保護而阻擋讀者，Access只保護admin Worker的全部domain/preview。

## 8. 兩次Codex交付與完工標準

### A／第一次：程式完整、本地與CI通過、待帳號接線

一次完成上述全部程式、最小管理頁、資料遷移、前端、聯絡與分析adapter、設定樣板及預檢。不先只交留言一半再另開聯絡規劃。

本地重點：新增/讀取/自己的刪除/他人不能刪/碼遺失/回應遺失冪等/管理者許可與偽造身份拒絕/父留言刪除不刪別人回覆/先審核/限流/Turnstile拒絕重播/XSS/跨origin/額度錯誤/無JS與第三方封鎖/不存在thread/作者輸入不洩漏。

管理server驗JWT、前端UX及資料庫實際SQL至少有本地端對端測試，不能全是mock fetch。提供服務程式測試命令與可重複的npm scripts。更新CI跑到相關測試，保持只驗證、無部署權限。

保護現有73項實質保障，新增測試不跳過舊原文hash。僅為本輪明確功能更新原先「服務永不送出」的假設：未設定仍不送、設定測試provider才送，不能刪掉無授權保護。前後端秘密不得出現在dist／git／logs。

截圖只拍受影響的留言、自己的刪除、管理、聯絡與手機邊界；114頁是基線不是永恆硬數字。已驗收作者、書架和57篇內容不需重拍。

交付README、精確缺項預檢結果、ACTIVATION_CHECKLIST、CI與新HEAD。狀態只能寫「本地已實作／測試通過／待雲端設定」，**未寄真信就不能寫Gmail已送達，未驗Access就不能寫線上管理可用**。

### B／第二次：一次接線、真實服務驗收

作者集中完成登入／Email驗證及測試授權後，同一PR設定環境、有限部署測試API與受保護管理Worker。驗收真人不用帳號留言、瀏覽器A不能刪B、保存碼可恢復、作者真登入/回覆/刪除、真實Turnstile、表單接受且指定Gmail真正收到、測試分析事件只進私人測試控制台。

沒有條件實測的項目如實列未驗，不用localhost截圖冒充線上實測。不因免費服務缺額度購買替代方案；Formspree無法使用時可在作者確認公開信箱後改聯絡資料頁，留言／分析不可默默砍掉。

完成B後才可稱M5-E互動服務待作者驗收。M5-F一次全站回歸後、作者另行授權，按#19→#20→本批的依賴合併及M6部署；不把合併或正式網站啟用藏在測試裡。

## 9. 官方依據（2026-11-16查核；費率可能變動）

- Workers免費限制：https://developers.cloudflare.com/workers/platform/limits/
- D1免費額度與超額行為：https://developers.cloudflare.com/d1/platform/pricing/
- D1本地環境：https://developers.cloudflare.com/d1/best-practices/local-development/
- workers.dev無需另購網域：https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- Access分Worker保護、identity與Static Assets限制：https://developers.cloudflare.com/workers/configuration/cloudflare-access/
- Access OTP（須啟用，限制精確email）：https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
- Access JWT：https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- Zero Trust Free：https://www.cloudflare.com/plans/zero-trust-services/
- Turnstile後端驗證：https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
- Turnstile測試key：https://developers.cloudflare.com/turnstile/troubleshooting/testing/
- Formspree免費能力：https://formspree.io/plans/
- Formspree額度：https://help.formspree.io/articles/account-management/account-limits
- GoatCounter免費合理用量：https://www.goatcounter.com/
- GoatCounter事件：https://www.goatcounter.com/help/events
- 開發環境排除：https://www.goatcounter.com/help/skip-dev

## 最新閱讀與管理決議
作者顯示「宗凡」與既有核准照片；僅server author欄位授權徽章。頁尾作者登入及主留言作者回覆連同一Access管理頁。未讀持久保存；明確標為已讀，回覆可自動已讀。沒有Email或手機推播。原文定位用清冊canonical_path與合法ID，不按標題或ID猜slug。
