# M6 production 接線（2026-11-16）

本輪從已整合main `37fb8838e6cc2b3c4d763ea6a05280474338207d` 建立 `prep/m6-production-wiring`。作者授權免費production資源準備；後續已接受並授權PR #24合併，但仍未授權公開網站或開放讀者寫入。原網站、文章與視覺不變。

## 實際資源與狀態

|項目|本輪實際結果|啟用狀態|
|---|---|---|
|production D1 `fansi-comments`|已建立，與staging不同ID；0001／0002遷移成功；讀回0則留言、paused=1、moderation=1；初始空庫備份在repo外|已配置／寫入停用|
|公開留言Worker `fansi-comments`|已上傳既有程式＋production停用閘門，綁定production DB；secret私下匯入|workers.dev=false、preview_urls=false、PRODUCTION_SERVICES_ACTIVE=false；沒有公開入口|
|私人管理Worker `fansi-comments-admin`|已上傳，綁定production DB；精確帳號secret私下保存；原JWT簽章／issuer／audience／期限驗證保留|workers.dev=false、preview_urls=false、啟用false；AUD缺失時拒絕，無可用管理頁|
|production Turnstile|獨立widget/site key，精確hostname為quantummedic.github.io，managed模式、no_clearance|已配置，尚未在正式前台驗證|
|production Access|本次短期受限Token建立獨立管理應用；精確作者Email、只允許既有OTP、完整hostname所有路徑；實際AUD已保存私人設定|設定讀回通過；未部署AUD至Worker、未驗真實登入，管理入口仍關閉|
|Formspree|沿用已存在的表單；收件與作者確認Gmail實收證據保留，沒有重寄|網站尚未發布，未新增表單|
|GoatCounter|正式站點配置契約已接入；測試站／私人控制台證據保留|未送本輪production流量|
|GitHub Pages|未啟用，沒有執行release或解除noindex|仍待另行授權|

Wrangler 4.162.0 OAuth有效；只操作以上本專案資源，未更動staging資料／政策、未設定付款或升級。所有實際ID、完整管理網址、白名單、secret、備份與雲端原始日誌均留repo外私人目錄，0700／0600，不放PR。帳號的既有workers.dev共用後綴含staging字樣不等於使用staging Worker；以不同script名稱、D1 ID、widget及未來獨立AUD核對，不更改帳號子網域。

## 本輪程式接線

- `prepare-production-inactive.mjs`只產生停用設定，要求精確帳號、production目標與獨立實際D1；不填安全通過旗標。實際上傳後再次API讀回入口關閉、DB隔離、啟用false及空庫。
- 公開Worker在production缺少明確啟用旗標時，連POST／DELETE／OPTIONS都拒絕，不先查庫或驗Turnstile。管理端先驗Access，再檢查啟用；知道網址不會取得管理權限。資料庫另以paused=1維持第二層停止。
- 原正式預檢與設定產生器沿用，新增獨立Access AUD及精確origin／hostname檢查；只有所有既有安全證據與發布授權通過後，才能產生啟用設定。資源建立授權與發布授權分開。
- 完整release模式使用`service-release.mjs`由私人設定預檢後輸出白名單manifest：只有公開API、site key、Formspree、GoatCounter與允許hostname及核對旗標，不含admin URL／Email／secret。manifest綁定精確main SHA，換SHA必須重核。
- `release.yml`仍只手動執行；`services=full`還須`ENABLE_VERIFIED_PRODUCTION_SERVICES`，解除索引另須`AUTHORIZE_INDEXING`。Environment審核後才讀manifest；完整模式發布前只讀public health，未啟用、未配置或DB仍paused即停止，不發測試留言、郵件或分析。
- 普通build／CI保持原先服務關閉與noindex。只有完整manifest驗證成功的候選建置，才將三個adapter輸出；建置本身不跑瀏覽器、不送分析。此受控步驟移除CI環境旗標以避免正式GoatCounter adapter被一般CI防護誤抑制；一般測試／預覽防護不變。
- `services=off`仍可作另外授權的故障降級；不代表取消完整網站目標。回退指定先前已驗證且具本版工具的main SHA，full需重核綁定舊SHA的manifest；缺工具／缺證據則停止，不偷帶較新設定。靜態回退不自動回退Worker或DB，沿用私人版本與備份流程。

## 集中設定狀態與後續控制台操作

1. **Cloudflare Access設定已完成**：作者另行提供短期受限Token後，已建立並讀回精確作者Email＋OTP的production管理應用；不重建組織、不修改staging或其他應用，public API與Pages不加作者登入。實際AUD僅保存私人設定，本輪未部署；後續須另行授權將AUD接至Worker並完成真實驗證。作者已確認撤銷設定Token，本輪沒有再次使用。
2. **GitHub Settings → Environments → github-pages（已完成）**：本輪已實際建立並儲存，部署只允許Branch main（1 branch／0 tags），required reviewer為QuantumMedic，禁止管理員bypass。Prevent self-review維持關閉，唯一作者仍須明確核准自己的發布。prepare與deploy使用同一Environment，可能各要求一次審核；本輪沒有執行工作流程測試。
3. 在該Environment建立`RELEASE_SERVICES_JSON` secret，內容來自完成私人預檢後的白名單manifest；不把Cloudflare secrets、白名單或管理網址上傳GitHub。生成：`node scripts/launch/service-release.mjs 私人production設定.json repo外manifest.json`。目前此命令應拒絕，不能手工把待驗旗標改true。
4. **GitHub Settings → Pages → Build and deployment**：另行發布授權時才切換Source為GitHub Actions，維持既定`https://quantummedic.github.io/fansi-notes/`；不要選main分支式自動發布、不改DNS或買網域。本輪未動設定。
5. 安全證據與production真實接線完成後，另行授權啟用Workers與DB寫入；先確認管理Access所有可達hostname，再開workers.dev，preview持續關閉。網站公開前依序做正式預檢、備份、manifest、手動workflow與發布後檢查。正式管理書籤需另外驗證後私下交付。

## 明確停止條件

目前production preflight為not-configured：缺M6_DEPLOY_APPROVED、LIVE_COMMENTS_VERIFIED、LIVE_ACCESS_VERIFIED、NON_ALLOWLIST_ADMIN_VERIFIED、INDEPENDENT_BROWSER_DELETE_VERIFIED。未擅自填true。

非白名單真實管理存取／獨立瀏覽器自刪仍待驗；作者本輪暫不追加操作。第一次其他Email開啟一般staging文章不是已確認管理入侵；無OTP也不是拒絕通過。不能為本輪接線暫時移除限制；Access設定權限阻擋已解除，真實安全及發布門檻仍保留；不能把政策讀回當成登入實測。

## production Access後續設定與讀回

- 新Token以本機隱藏輸入存repo外0600檔案；只用於本專案production管理Access。原OAuth 403是歷史狀態，本次設定成功不代表Wrangler取得額外權限。
- 核對既有team domain及唯一OTP provider；新增一個獨立production應用。讀回完整hostname、全部路徑、四小時session、HTTP-only cookie、停用preflight bypass／App Launcher；只有一條精確作者Email Allow，沒有Everyone、整個Email網域或Bypass。production AUD與staging不同。
- 前後對比其他Access應用內容一致。原始應用／政策／ID／AUD及白名單證據只在私人目錄，公開報告只記去識別結果。
- 後續OAuth唯讀核對兩Worker仍workers.dev=false、preview=false、activation=false，綁定獨立production D1；0留言、paused=1、moderation=1。本輪沒有Worker部署、遠端遷移或開入口；線上管理Worker的AUD仍空值、拒絕服務。
- 私人production預檢invalid=[]，ready=false；尚缺發布授權、production留言／Access真實實測與原兩項安全證據。沒有預填任何live驗證旗標。沒有新UI或程式修改；本次只更新此報告及CURRENT_STATE，CI以最新文件提交為準。
- 作者已確認撤銷 `fansi-access-production-setup`。此後不再使用該Token，不重新要求建立。

## PR #24已整合／Environment保護已設定

作者授權後以merge commit `745553452f229f359d17989d61dce1c582461e99` 合併PR #24，[main驗證CI成功](https://github.com/QuantumMedic/fansi-notes/actions/runs/43845649652)。合併工程樹與原PR HEAD完全一致；其後僅現況／驗收文件補記，沒有功能或正式內容變更。

Pages合併前後實際畫面均為Deploy from a branch、Branch=None、currently disabled。Environment已儲存唯一作者審核、禁止bypass與main-only部署規則；沒有secrets／variables。未執行release、未啟用Pages、noindex不變。設定已完成，不要求作者重新操作同一輪控制台。

最後OAuth唯讀核對兩Worker保持所有入口及啟用關閉，D1 0留言且暫停；管理Worker AUD尚未部署，私人實際AUD與Access設定保留。使用者已確認Token撤銷，沒有再次存取該Token。

剩餘最小順序：另行授權將實際AUD接至停用Worker → 受控production接線與真實安全證據驗證（原兩項缺口保留）→ 正式預檢通過後產生綁定SHA的RELEASE_SERVICES_JSON並加入已建立Environment → 另行正式發布授權時切換Pages Actions Source、執行手動workflow並由作者審核。索引開關另有確認；任何門檻缺失即停止，不填假證據。不重寄已確認Gmail驗收信、不重做已接受staging流程。

## 本輪驗證

既有98項保障保留，新增5項production fail-closed、停用資源設定、SHA與公開欄位白名單、獨立授權及完整網站隔離build測試；共103項通過。真本地SQL驗證有效作者仍無法操作停用production、公開寫入不進DB、paused health不放行。合成full manifest僅存在測試記憶體與臨時建置，測完刪除，不冒充真實安全證據。

輸入／64串清冊／local預檢成功，check127檔零錯誤／警告、1個既有unused-import hint，114頁普通build成功；受影響測試最後再跑9項通過。正式文章、data、圖片與fixtures沒有變更。沒有新UI，本輪不重跑已接受的全站桌手機巡檢。首輪CI新增完整build與原內容fixture共享Astro快取造成競態，已將新增fixture改為獨立root／Astro與Vite快取；不改正式資料或放寬既有斷言。CI以本PR最新HEAD為準。

## 先前PR #23準備工具及歷史說明（最新狀態以上為準）

## 可執行工具

- `node scripts/launch/release.mjs build scripts/launch/release.example.json`：隔離`.release/site`，移除環境中PUBLIC設定，所有服務關閉；預設noindex，產生Git SHA及逐檔SHA256 manifest。`audit`可重新檢查輸出。普通build仍不解鎖索引。
- `.github/workflows/release.yml`：只接受workflow_dispatch、main、完整main歷史SHA及PUBLISH_STATIC_PRODUCTION字串。驗證及發布分job；僅發布job有Pages／OIDC權限。未執行。未來須由作者在GitHub Environment設定審核者後才使用。一般PR／push及RSS預覽不部署。
- `node scripts/launch/postflight.mjs https://quantummedic.github.io/fansi-notes/ noindex`：未來發布後檢查首頁、主要入口、robots、sitemap與404；只HTTP讀取、不執行分析。這次未執行遠端驗收。
- `python3 scripts/launch/database.py drill --directory /private/tmp/新的演練目錄`：真正SQLite dump／restore、內容一致及integrity_check；不重用已存在備份。
- `python3 scripts/launch/database.py commands --environment production --config 私人設定.json --directory repo外備份目錄`：檢查實際DB binding後，私下產生指定資料庫匯出命令，絕不自動執行遠端操作。復原先建立獨立recovery DB及其設定，再匯入、核對後另行授權切換，不覆蓋live DB。
- `node scripts/launch/worker-commands.mjs provision 私人設定.json repo外命令檔`：準備本專案production D1建立命令；`migrate`準備增量migration命令；`rollback`另需實際Worker版本UUID（每個Worker分別核實）。不執行命令。
- `node scripts/launch/content-check.mjs`：差異→展示輸入檢查→thread同步→check→build→test→差異，沒有commit/push/部署。

production樣板在`scripts/launch/production.example.json`，複製至repo外權限0600後填入實值。既有`check_interaction_config.mjs production PRIVATE.json`與`prepare-interaction-config.mjs PRIVATE.json production`沿用；新增獨立DB、正式site／分析及兩項真實安全證據門檻，不預填true。正式前台走Pages，不使用staging Access前台Worker；私人管理保持全部路徑Access＋後端JWT保護。

## 正式操作順序與停止條件

1. 另行授權後依#19→#20→#21→#22→本PR，逐次核對base/diff/CI，merge commit，遇衝突或CI失敗停止。
2. 核對GitHub Pages來源與Environment保護。本次connector不提供可用Pages設定讀取入口，未能確認帳號實際Pages設定；不可把程式目標當成已設定。目標固定quantummedic.github.io/fansi-notes，不改平台或DNS。
3. 決定此次是否採「靜態內容先發布、各服務關閉」候選；本PR發布流程只提供此安全候選，不代表作者已選擇取消留言。完整互動啟用仍須私人production預檢、真實資源及安全證據，再將經驗證公開設定明確接入發布流程；不得從環境偷帶staging值。
4. production D1／Worker／Turnstile／Access必須另行建立與核對，與staging不同DB、AUD和hostname；公開讀者免登入，管理精確Email且全部hostname保護。未核實真實非白名單拒絕與獨立瀏覽器自刪前，不啟用正式留言／管理寫入。
5. 私下備份與記錄目前Git SHA、manifest、兩個Worker版本與DB migration版本。套用增量migration前檢查相容性；不要把Git回退當成資料回退。
6. 作者授權索引與發布後才執行手動workflow。回退靜態站以同workflow指定以前已驗證且包含此流程的main SHA；更早版本需另行準備相容流程，不盲目執行。Worker獨立rollback；DB到獨立復原庫驗證後再切換。
7. postflight核對HTTPS、base與404；正式GoatCounter僅正式站用，驗收流量仍test站。Formspree沿用既有表單，不重寄。正式管理書籤只私下交付。

## SEO與素材

canonical／OG URL／sitemap統一既定origin與base，動態robots跟索引開關一致。轉址頁永久noindex；預覽與普通build維持noindex。移除把placeholder當OG正式分享圖的輸出，未找到本輪可明確認定適合社群分享的已核准品牌橫圖，列為待素材用途確認；沒有生成或下載圖片。現有favicon不變。不將缺圖當作網站不可閱讀。

## 安全證據仍未結案

作者本輪暫不追加測試：非白名單真實管理存取及獨立瀏覽器讀者自刪實測尚未完成。第一次約14:55手機LINE開啟的是一般staging文章；沒有非作者進入管理端的已確認證據。後續未收到OTP不是拒絕驗收通過。建立時保存兩個精確作者Allow政策證據，後端JWT與所有權測試通過，但當時authentication logs未取得；瀏覽器政策阻擋控制台導覽，不繞過、不重建Token。這些是正式互動啟用停止條件，不阻止本輪工程準備；也不是作者接受所有風險。

## 作者日常操作短表

|工作|操作|
|---|---|
|更新文章|依現有import-batch工具核准manifest；先看差異，不覆蓋舊work_id。跑content-check，預覽確認後另行授權發布。|
|補平台／RSS|更新同work_id與核准GUID；sync:podcast只預覽，人工分類／映射沿用；新thread同步後再核對差異。既有fixture測試保護去重與不覆寫。|
|查看／回覆留言|私人書籤→Access→集中管理→原文留言；production書籤尚未建立。|
|分析與收信|私人GoatCounter控制台；Formspree既有通知收件。沒有啟用公開Email備援。|
|服務故障|三個PUBLIC_*_ENABLED各自false後重新驗證建置；留言緊急先在私人管理暫停寫入。靜態候選全部關閉不影響閱讀。任何正式重發需授權。|
|回退|先保存現況與備份，不清庫；分別處理靜態SHA、Worker版本及DB recovery，不混為一次git reset。|

## production Access後續設定與讀回

- 新Token以本機隱藏輸入存repo外0600檔案；只用於本專案production管理Access。原OAuth 403是歷史狀態，本次設定成功不代表Wrangler取得額外權限。
- 核對既有team domain及唯一OTP provider；新增一個獨立production應用。讀回完整hostname、全部路徑、四小時session、HTTP-only cookie、停用preflight bypass／App Launcher；只有一條精確作者Email Allow，沒有Everyone、整個Email網域或Bypass。production AUD與staging不同。
- 前後對比其他Access應用內容一致。原始應用／政策／ID／AUD及白名單證據只在私人目錄，公開報告只記去識別結果。
- 後續OAuth唯讀核對兩Worker仍workers.dev=false、preview=false、activation=false，綁定獨立production D1；0留言、paused=1、moderation=1。本輪沒有Worker部署、遠端遷移或開入口；線上管理Worker的AUD仍空值、拒絕服務。
- 私人production預檢invalid=[]，ready=false；尚缺發布授權、production留言／Access真實實測與原兩項安全證據。沒有預填任何live驗證旗標。沒有新UI或程式修改；本次只更新此報告及CURRENT_STATE，CI以最新文件提交為準。
- 作者已確認撤銷 `fansi-access-production-setup`。此後不再使用該Token，不重新要求建立。

## PR #24已整合／Environment保護已設定

作者授權後以merge commit `745553452f229f359d17989d61dce1c582461e99` 合併PR #24，[main驗證CI成功](https://github.com/QuantumMedic/fansi-notes/actions/runs/43845649652)。合併工程樹與原PR HEAD完全一致；其後僅現況／驗收文件補記，沒有功能或正式內容變更。

Pages合併前後實際畫面均為Deploy from a branch、Branch=None、currently disabled。Environment已儲存唯一作者審核、禁止bypass與main-only部署規則；沒有secrets／variables。未執行release、未啟用Pages、noindex不變。設定已完成，不要求作者重新操作同一輪控制台。

最後OAuth唯讀核對兩Worker保持所有入口及啟用關閉，D1 0留言且暫停；管理Worker AUD尚未部署，私人實際AUD與Access設定保留。使用者已確認Token撤銷，沒有再次存取該Token。

剩餘最小順序：另行授權將實際AUD接至停用Worker → 受控production接線與真實安全證據驗證（原兩項缺口保留）→ 正式預檢通過後產生綁定SHA的RELEASE_SERVICES_JSON並加入已建立Environment → 另行正式發布授權時切換Pages Actions Source、執行手動workflow並由作者審核。索引開關另有確認；任何門檻缺失即停止，不填假證據。不重寄已確認Gmail驗收信、不重做已接受staging流程。

## 本輪驗證

輸入與64串清冊、服務local預檢通過；Astro check 121檔0錯誤／警告／提示，114頁普通build；98項測試通過（原94項保留，新增4項發布門檻／手動workflow／production隔離／真SQLite復原）。第一次沙箱限制本機監聽導致Worker測試EPERM，授權本機執行後98項全過，不修改斷言。另驗證隔離noindex與index候選建置，均未部署。CI以本PR最新HEAD為準。無可見版型變更，不重跑已接受的M5-F手機巡檢；未操作任何遠端DB或寄信。
