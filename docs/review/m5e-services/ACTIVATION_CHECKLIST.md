# M5-E 互動服務｜集中啟用清單

本批只完成本機程式與測試。以下資源**尚未建立／真實驗證**，不把測試網址當成正式服務。沒有任何步驟已授權部署、付費、綁卡或公開Email。

## 1. 作者一次完成的登入及確認

|服務|作者操作|驗證方式|
|---|---|---|
|[Cloudflare Dashboard](https://dash.cloudflare.com/)|登入自己的帳號，確認Workers Free、D1 Free；Zero Trust Free，不綁卡、不開付費試用。開啟One-time PIN登入方式。|確認方案及可用額度；若既有帳號有付費方案，先單獨檢查費用，不更改其他專案。|
|[Formspree](https://formspree.io/)|登入／建立免費帳號與表單，於後台設定並驗證作者已指定的Gmail。不要將收件信箱寫入Git。|後台顯示收件驗證完成；真實測試寄信仍另需作者授權及確認收到。|
|[GoatCounter](https://www.goatcounter.com/)|建立免費託管帳號，控制台設私人；測試與正式使用不同站點代碼。|登入後確認控制台非公開，取得實際count endpoint。|

作者需集中確認：①是否允許**受控測試**Worker部署及D1遠端遷移；②允許寄一封合成驗收信並由作者確認Gmail實收；③公開Email備援是否同意（預設不公開）；④專用測試網站origin/hostname（不買新網域）；⑤Access僅允許作者精確Email，不能整個gmail.com網域或Everyone。密碼、OTP及secret不要貼PR或公開文件。

## 2. 取得真實設定（全部缺項一次填）

使用Repository外的私人JSON或環境變數；`scripts/check_interaction_config.mjs`只列欄位名稱，不印值。下列資源名稱為程式的建議名稱，**不是已建立的資源**。

|欄位|取得處／用途|可公開？|
|---|---|---|
|ENVIRONMENT|`staging`或`production`，不可用local/test繞過正式入口|是|
|D1_DATABASE_NAME、D1_DATABASE_ID|授權後建立`fansi-comments-staging`及另立正式DB；兩個Worker同環境共用binding `DB`|ID不是密鑰，但目前留空，不造值|
|PUBLIC_COMMENTS_API|實際`fansi-comments-staging`／`fansi-comments`的HTTPS workers.dev origin|是；不加/fansi-notes|
|ADMIN_WORKER_URL|實際`fansi-comments-admin-staging`／`fansi-comments-admin`，與public不同origin|網址可公開；所有路徑都需Access|
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
- 刪除：兩個瀏覽器A不能刪B；保存碼在另一裝置恢復後能刪；父留言刪除不影響回覆。瀏覽器拒絕儲存時誠實提示。
- 作者管理：未登入、錯Email、偽header、過期JWT拒絕；作者OTP登入後查看待審、回覆、隱藏、刪除、切換審核及暫停。沒有Email通知。
- Formspree：保留服務後台免費防垃圾設定與蜜罐`_gotcha`，不把留言Turnstile當Formspree驗證。若服務回應挑戰／額度錯誤，前台保留輸入；測試provider成功不代表Gmail實收。由作者核對已授權的合成信收到。
- GoatCounter：只用隔離測試站點與私人控制台驗證；localhost／CI／review／admin不送，query、來信、Email、管理碼不進事件。點擊不等於購買或收聽。
- `/fansi-notes/`只屬網站；API使用自身origin。各服務失敗互不阻擋閱讀。

## 5. 作品同步、匯出與恢復

每次內容更新後`npm run sync:threads`（build亦自動執行），由公開文章metadata、Podcast GUID核准映射及出版作品產生唯一清冊。CI檢查清冊沒有過時。Worker更新需要同環境的授權部署，不需逐篇改程式。

未配對Podcast日後正式配對：`node scripts/plan-thread-migration.mjs`僅產生已確認alias的SQL計畫。先私人備份，再授權套用到指定DB；`UPDATE comments SET thread=...`保留原留言ID、私碼hash與父子關係，不按標題合併。不能只更新網站而漏掉既存串的遷移。

管理頁可逐批匯出JSON（20則／游標），不含管理碼或hash；只存私人位置，不能提交repo或公開artifact。完整可恢復備份須在授權後用`wrangler d1 export`匯出指定DB到Repository外的私人檔案，該SQL包含敏感資料，勿分享；恢復先在全新隔離DB，以`wrangler d1 execute --file 私人備份.sql`驗證數量與權限後才考慮替換。不得覆蓋正式資料庫作測試。

刪除擦除正文／暱稱／刪除碼hash，保留最小tombstone與冪等摘要；供應商備份保留限制另行確認。私人匯出檔也需由作者管理刪除與保留時間。

**停止點：本輪未建立外部帳號、未部署Worker、未遷移遠端DB、未寄真信、未啟用正式分析。下一次同PR接線，不重做元件。**
