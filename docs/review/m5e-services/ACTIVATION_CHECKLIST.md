# M5-E 互動服務｜集中啟用清單

本機程式已完成；本輪進入作者授權的免費 staging 接線。帳號存在不代表 CLI 已登入或雲端驗收完成。禁止 production、付費升級、公開 Email 備援及公開私人管理資訊。

## 1. 已有設定與本輪授權

|服務|已完成的準備|仍需驗證|
|---|---|---|
|Cloudflare|作者已完成 Zero Trust Free、官方要求的付款資料步驟及 One-time PIN；沿用原組織，不重建。|Wrangler OAuth 與帳號已核對；staging D1／Turnstile 已建立。待 Access 權限、team domain／政策核對及真實作者登入。|
|Formspree|既有免費表單及指定收件通知已由作者畫面確認。|從受控聯絡頁送一封合成驗收信；服務接受與作者 Gmail 實收分開記錄。|
|GoatCounter|正式與測試站點已建立，Email 已驗證；兩控制台匿名存取均為登入頁。|只向測試站送授權事件，作者登入確認資料；正式站不送驗收流量。|

本輪已授權本專案免費 staging D1／Worker／Turnstile／Access、受控 HTTPS 前台及增量遷移。公開 Email 備援仍關閉；不改正式 GitHub Pages 或 noindex。沒有建立外部資源前不寫已建立；Access 政策與真實登入分開驗證，不預填完成旗標。

官方 OAuth 由作者親自批准，憑證使用 Wrangler 的 Mac 鑰匙圈。若 OAuth 缺 Access 權限，僅補所需控制台操作或受限 token；不得索取 Global API Key、密碼或 OTP，也不讀瀏覽器 Cookie。

## 2. 取得真實設定（全部缺項一次填）

使用Repository外的私人JSON或環境變數；`scripts/check_interaction_config.mjs`只列欄位名稱，不印值。下列資源名稱為程式的建議名稱，**不是已建立的資源**。

|欄位|取得處／用途|可公開？|
|---|---|---|
|ENVIRONMENT|`staging`或`production`，不可用local/test繞過正式入口|是|
|D1_DATABASE_NAME、D1_DATABASE_ID|授權後建立`fansi-comments-staging`及另立正式DB；兩個Worker同環境共用binding `DB`|ID不是密鑰，但目前留空，不造值|
|PUBLIC_COMMENTS_API|實際`fansi-comments-staging`／`fansi-comments`的HTTPS workers.dev origin|是；不加/fansi-notes|
|ADMIN_WORKER_URL|實際`fansi-comments-admin-staging`／`fansi-comments-admin`，與public不同origin|僅私人本地設定及書籤；所有路徑都需Access|
|ALLOWED_ORIGINS|網站完整origin，逗號分隔，不含路徑、萬用字元|是|
|TURNSTILE_HOSTNAMES|實際前台hostname，逗號分隔|是|
|PUBLIC_TURNSTILE_SITE_KEY|Turnstile正式widget site key|是|
|TURNSTILE_SECRET_KEY|同widget secret；`wrangler secret put`，只放public Worker|**Secret**|
|RATE_LIMIT_HMAC_SECRET|Web Crypto隨機至少32字元；只放public Worker|**Secret**|
|ACCESS_TEAM_DOMAIN、ACCESS_AUD|Access應用的團隊domain與audience tag|伺服器設定|
|ADMIN_EMAIL_ALLOWLIST|作者精確Email，逗號分隔；在admin Worker secret設定|**私人資料**，不寫公開repo|
|PUBLIC_FORMSPREE_ENDPOINT|表單後台真實`https://formspree.io/f/ID`|是；不是Gmail地址|
|PUBLIC_GOATCOUNTER_ENDPOINT|真實`https://代碼.goatcounter.com/count`|是；API帳號token永不進前端|
|PUBLIC_ANALYTICS_HOSTS|允許測試或正式hostname，分開設定|是|
|PUBLIC_COMMENTS_ENABLED、PUBLIC_CONTACT_ENABLED、PUBLIC_ANALYTICS_ENABLED|三個獨立`true/false`，預設false；接線驗收才逐項開啟|是|
|PUBLIC_EMAIL_APPROVED、PUBLIC_CONTACT_EMAIL|僅作者明確批准公開備援後填；收件授權不等於公開授權|預設false／空|

私人預檢確認欄位：`REMOTE_TEST_DEPLOY_APPROVED`、`FORMSPREE_RECIPIENT_VERIFIED`、`ACCESS_POLICY_VERIFIED`、`GOATCOUNTER_PRIVATE_DASHBOARD_VERIFIED`。只有真的完成才填`true`，不能用填旗標替代實際驗收。正式階段另需`M6_DEPLOY_APPROVED`、`LIVE_COMMENTS_VERIFIED`、`LIVE_ACCESS_VERIFIED`、`LIVE_MAIL_RECEIVED`、`ISOLATED_ANALYTICS_VERIFIED`。

## 3. 對應實際程式的操作

本機（不需要帳號，不會寄信）：

```sh
npm ci
npm run sync:threads
npm run services:preflight
npm run services:local
# 另一個終端
npm run dev:services
```

前台 `http://127.0.0.1:4335/fansi-notes/`；留言API8787、合成JWT管理頁`http://127.0.0.1:8788/admin/`、假收件8789。管理頁本地adapter簽發隔離測試JWT，仍經真正驗簽；不代表Cloudflare Access已登入。全部只綁127.0.0.1，D1記憶體資料重啟即清空。測試來信填`[quota]`／`[timeout]`／`[failure]`可驗證錯誤；其他文字接受但不寄信。上述adapter在`scripts/local-interactions.mjs`與`tests/helpers`，**未被任何Worker入口或正式網站匯入**。

雲端設定預檢（不建立任何資源）：

```sh
node scripts/check_interaction_config.mjs staging /私人位置/設定.json
node scripts/prepare-interaction-config.mjs /私人位置/設定.json staging
```

只有預檢齊全才產生忽略Git的`services/comments/public.staging.private.json`與`admin.staging.private.json`。正式用production，DB不同。預檢ready表示欄位與確認齊備，不代表服務已部署或線上可用。

取得明確授權後，Codex可協助：建立指定D1、Turnstile、兩個Worker、Access應用與精確Email規則、設定secrets、套用SQL。原始wrangler樣板`ENVIRONMENT=unconfigured`且沒有DB，缺設定即拒絕。不要直接部署樣板冒稱完成。

遷移／部署的**授權後**命令對應：

```sh
npx wrangler d1 migrations apply fansi-comments-staging --remote --config services/comments/public.staging.private.json
npx wrangler secret put TURNSTILE_SECRET_KEY --config services/comments/public.staging.private.json
npx wrangler secret put RATE_LIMIT_HMAC_SECRET --config services/comments/public.staging.private.json
npx wrangler secret put ADMIN_EMAIL_ALLOWLIST --config services/comments/admin.staging.private.json
npx wrangler deploy --config services/comments/public.staging.private.json
npx wrangler deploy --config services/comments/admin.staging.private.json
```

上述名稱必須與實際建立名稱一致；範例不是執行紀錄。先讓admin缺設定拒絕，完整保護workers.dev所有路徑，preview_urls保持false；設定Access後才完成登入驗收，不保護public Worker。Workers源碼會再次驗JWT簽章／issuer／audience／到期／精確Email，不信任單一Email header。

## 4. 每項真實驗收

- 公開留言：Turnstile真widget及Siteverify，正確hostname/action；一般讀者免登入發表。跨origin／假token拒絕，雙擊／回應遺失只一筆。
- 刪除：兩個瀏覽器A不能刪B；同瀏覽器自動憑證可刪，換裝置不提供恢復；父留言刪除不影響回覆。瀏覽器拒絕儲存時誠實提示。
- 作者管理：未登入、錯Email、偽header、過期JWT拒絕；作者OTP登入後查看待審、回覆、隱藏、刪除、切換審核及暫停。沒有Email通知。
- Formspree：保留服務後台免費防垃圾設定與蜜罐`_gotcha`，不把留言Turnstile當Formspree驗證。若服務回應挑戰／額度錯誤，前台保留輸入；測試provider成功不代表Gmail實收。由作者核對已授權的合成信收到。
- GoatCounter：只用隔離測試站點與私人控制台驗證；localhost／CI／review／admin不送，query、來信、Email、管理碼不進事件。點擊不等於購買或收聽。
- `/fansi-notes/`只屬網站；API使用自身origin。各服務失敗互不阻擋閱讀。

## 5. 作品同步、匯出與恢復

每次內容更新後`npm run sync:threads`（build亦自動執行），由公開文章metadata、Podcast GUID核准映射及出版作品產生唯一清冊。CI檢查清冊沒有過時。Worker更新需要同環境的授權部署，不需逐篇改程式。

未配對Podcast日後正式配對：`node scripts/plan-thread-migration.mjs`僅產生已確認alias的SQL計畫。先私人備份，再授權套用到指定DB；`UPDATE comments SET thread=...`保留原留言ID、私碼hash與父子關係，不按標題合併。不能只更新網站而漏掉既存串的遷移。

管理頁可逐批匯出JSON（20則／游標），不含管理碼或hash；只存私人位置，不能提交repo或公開artifact。完整可恢復備份須在授權後用`wrangler d1 export`匯出指定DB到Repository外的私人檔案，該SQL包含敏感資料，勿分享；恢復先在全新隔離DB，以`wrangler d1 execute --file 私人備份.sql`驗證數量與權限後才考慮替換。不得覆蓋正式資料庫作測試。

刪除擦除正文／暱稱／刪除碼hash，保留最小tombstone與冪等摘要；供應商備份保留限制另行確認。私人匯出檔也需由作者管理刪除與保留時間。

**接線進行中：已建立 staging D1、套用 0001／0002，Turnstile 已建立；尚未部署 Worker、寄驗收信或送統計。接續同 PR 補足 Access 權限及政策查核，不重做元件。**

本輪補充：公開網站不使用管理URL設定，舊PUBLIC_COMMENTS_ADMIN_URL會被忽略；管理Worker返回網站使用 SITE_ORIGIN 與 SITE_BASE（例如 /fansi-notes），僅拼接公開清冊canonical_path。帳號已準備，staging 真實接線尚未完成；production 不在本輪。

## 私人書籤與Access最後驗收

- 正式管理網址尚未建立。帳號接線時只透過私人本地設定交付；作者存瀏覽器書籤，直接登入，不依賴GPT、Codex或公開GitHub入口。
- Access只放行作者指定精確Email，禁止Everyone及整個gmail.com。保護管理Worker所有頁面、API及全部可達hostname。
- preview_urls保持false；未來若啟用也須同等保護。公開留言Worker不要求登入。
- 真實接線以作者與非作者帳號分別驗證允許／拒絕；本地測試簽章不能當作正式登入驗收，測試身分不進正式Worker或公開建置。
- 公開repo的程式與路徑不承諾保密；知道網址仍須通過伺服器JWT、issuer、audience、有效期、精確Email及寫入origin驗證。

## 本輪 Access 權限與受控前台

Wrangler 4.162.0 官方 OAuth 已完成；Access create 回應 403 auth.forbidden，組織讀取亦被拒絕。只補限目前帳號的短期 `Access: Apps and Policies Edit` 與 `Access: Organizations, Identity Providers, and Groups Read`。Token 只在 repo 外私人檔案以隱藏輸入保存；不要貼聊天／PR，不索取 Global API Key，不重新要求作者註冊。

既有 staging D1 與 Turnstile 要沿用。私人資源清冊保存實際 ID、狀態與停用方法，不在此文件輸出私人管理 hostname。Access team domain、每個應用 AUD、精確 Email policy 必須由實際結果核對，政策檢查與真實 OTP 登入是兩個驗收項目。

受控前台使用既有 Astro build，獨立 `services/comments/staging-site.mjs`，所有資產先驗 JWT；`assets.run_worker_first=true`、preview_urls=false。三服務僅在隔離 build 設定啟用，普通 build 仍關閉。Access 設定完成、preflight 通過後：

```sh
node scripts/prepare-staging-site.mjs /私人位置/設定.json
# 產生被 Git 忽略的 services/comments/site.staging.private.json
# 前台需獨立 FRONTEND_ACCESS_AUD，與管理 AUD 不同。
# 三個 Worker 的帳號 ID 來自私人 CLOUDFLARE_ACCOUNT_ID。
npx wrangler secret put ADMIN_EMAIL_ALLOWLIST --config services/comments/site.staging.private.json
npx wrangler deploy --config services/comments/site.staging.private.json
```

前台 allowlist 同樣只進 Worker secret，不進 HTML／JS。腳本將 dist 複製到 repo 外並檢查靜態輸出不含私人管理 URL、allowlist、Turnstile secret 或限流 secret。前台 secret 尚未設定時驗證失敗、不能讀資產。上列命令是授權後接續步驟，**不是已部署證明**。

本輪停用清單與實際資源 ID 私下保存：先停止本專案 staging Workers，再依作者決定備份／刪除測試 D1、Turnstile 和本批 Access app；不刪原組織、Identity Provider、帳號子網域、既有 Formspree 或 GoatCounter 站點。
