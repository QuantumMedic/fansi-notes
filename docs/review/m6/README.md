# M6 受控驗證（2026-11-17）

## 本輪目前結果

PR #25以merge commit `0fe555729dbb290b90a68fd6f0df8cdb39906366`合併，工程樹與原HEAD一致；[main CI成功](https://github.com/QuantumMedic/fansi-notes/actions/runs/43902233778)。本輪獨立分支`prep/m6-controlled-verification`，Pages實際畫面仍停用。以下是當下驗證窗口狀態；不代表已公開官網或所有安全項目已通過。

|項目|證據／結果|
|---|---|
|保護通道|原受保護前台→固定私有service binding→production公開Worker；前後端均驗簽章、issuer、AUD、期限及精確Email。原production管理AUD不變。|
|入口與期限|production公開Worker網址關閉；管理網址僅限Access作者，preview全關。獨立最長4小時租期，本次台灣時間11/17 04:06到期。PRODUCTION_SERVICES_ACTIVE持續false，沒有偽造正式啟用／驗收旗標。|
|資料與Turnstile|production D1從0留言／paused=1開始；窗口內允許少量合成資料，不搬staging留言。正式widget只增加現有前台的精確hostname；後端origin／hostname亦精確匹配。|
|已實際觀察|目前作者登入可開管理頁並讀到0筆；前台可讀0／0。真實service binding health回configured=true及accepting_comments=true。未登入四種入口均Access302，公開production API404。|
|後續真實入庫觀察|前台顯示「留言已送出」；真正production D1保存1則公開主留言及1則已驗證作者回覆，父子關係正確，孤立回覆0。未從staging搬入，也未用fixture代替。|
|仍待真實證據|瀏覽器重整／自刪並保留作者回覆、非白名單真實管理拒絕、另一瀏覽器所有權。既有SSO有效登入不冒稱這輪重新輸入過OTP；沒收到OTP不算拒絕通過。|
|郵件與分析|本輪隔離前台關閉聯絡與分析，避免重寄既已實收的信或污染任何統計。原功能及設定不變。|
|資料保護|src/content、src/data、public、thread清冊均與合併main無差異。原106項測試保障保留。|

## 工具與精確復原邊界

- `scripts/prepare-verification-window.mjs`：從原私人production／staging設定及官方Access讀回證據生成驗證配置；限制本專案名稱、獨立DB、精確前台hostname／政策、最長4小時，拒絕寬鬆或不匹配資料。不改原設定，不生成LIVE旗標。
- `scripts/verification-operation.mjs snapshot|prepare|open|readback|restore|watch <repo外plan.json>`：OAuth僅在記憶體使用，不讀撤銷Token。先保存資源／widget／DB快照，驗證原庫空且paused、公開入口關閉；先部署拒絕寫入狀態及雲端到期排程，核對後才開窗口。錯誤嘗試復原，禁止重複使用已開／已復原的計畫。實值、時間、設定、bookmarks及日誌只在私人本地檔案，不放PR。
- 私人plan欄位：`authorized`、`production`、`productionEvidence`、`staging`、`frontendEvidence`、`siteConfig`（原前台配置）、`assetsDirectory`（已檢查的隔離Astro建置）、`start`／`end`（毫秒）。所有來源都是已存在的真實設定；不含虛構ID。三Worker配置保留正常正式開關false。
- `services/comments/verification-*.mjs`是驗證專用包裝，不改既有正式public/admin handler。前台只代理固定讀取／發表／自刪路徑，不能代理管理API或任意網址；手動redirect模式拒絕全部3xx。後端再次驗前台JWT，不能只依賴入口或service binding名稱保密。
- `verification-window.sql`只在指定驗證DB暫時安裝租期表及觸發器；期限到後INSERT／UPDATE／DELETE及解除paused都拒絕，避免慢請求跨期限寫入。雲端cron另設paused=1。驗證包每次請求也檢查期限，無須等cron傳播或本機清理。
- 私人本機watch到期依序暫停D1、關閉production管理hostname、恢復原Worker／前台及widget、私下備份測試留言、依實際ID先刪回覆再刪主留言並移除臨時SQL、恢復原paused／moderation及移除暫時public allowlist secret。保留第一次備份；發現另一租期、DB或正式啟用旗標改變時停止覆寫。完成後讀回；不把程式內恢復意圖當作已完成證據。
- **Mac離線的界限**：雲端期限與SQL拒絕仍有效，私人控制台設定（含臨時Turnstile hostname）的完整復原可能延後到本機恢復連線。監督程序有限重試，原始證據私下留存。未讀回`restored`前，此項仍待核實；不宣稱永久雲端憑證自動代管，未新增或上傳控制台Token。

## 實測發現與修復

1. 同一受保護前台切換DB時，舊staging瀏覽器憑證會呈現不存在的待審提示。新增只供驗證建置的`PUBLIC_COMMENTS_STORAGE_SCOPE=verification-<start>`；正常build不設定，既有憑證、pending請求及網站版型不變。新增測試確認不讀取／覆蓋／刪除原憑證。
2. 真實Workers的Request不支援`redirect:error`（Node mock未暴露此差異）。改成manual並拒絕3xx，新增回歸檢查；修復後真實私有通道health及留言讀取成功。錯誤日誌只保留去識別類型與短訊息，原始tail私下保存並已停止。

## 測試與待作者確認

本地112項測試通過，6項新測試覆蓋租期上下界／停用、精確JWT與所有管理入口、限定binding路徑及redirect、真實本地SQL到期與暫停、設定證據拒絕、瀏覽器憑證隔離；原106項未刪除／放寬。輸入／64串清冊／local預檢通過，check135檔0錯誤0警告及1個既有hint，普通build114頁。三Worker dry-run及真實部署讀回成功。[PR #26首個工程CI通過](https://github.com/QuantumMedic/fansi-notes/actions/runs/43907791501)，後續只有本段真實入庫紀錄更新；最新CI見PR。前台與管理實際畫面只存私人驗收目錄，沒有網址列或公開管理連結。

作者操作已集中提出：發表合成留言、重整確認、管理回覆、另一瀏覽器沒有自刪權限、主留言刪除後保留回覆；另以非白名單真實帳號確認不能看到管理內容。沒有實際結果就繼續待驗，不反覆索取帳號或Token。窗口結束後先核對復原；全部必要證據完成，才另行授權合併本輪PR及正式啟用／發布。正式hostname的Turnstile／CORS仍屬發布後必做冒煙檢查及失敗停止條件。

## 以下為前輪歷史驗收（停用與待授權描述只指當時）

# M6 production 接線（2026-11-16）

本輪從已整合main `37fb8838e6cc2b3c4d763ea6a05280474338207d` 建立 `prep/m6-production-wiring`。作者授權免費production資源準備；後續已接受並授權PR #24合併，但仍未授權公開網站或開放讀者寫入。原網站、文章與視覺不變。

## PR #25 AUD接線收尾（歷史）

基線main `3d7f0ba`，獨立分支`prep/m6-admin-aud-verification`。本次只有停用設定產生器、精確測試與這兩份進度／驗收文件變更，無UI修改。作者已撤銷Token，沒有再要求Token或使用已撤銷憑證。

- **已實際部署**：從既有私人設定與Access官方讀回證據取得真正AUD，僅部署現有production管理Worker；dry-run及遠端部署成功。部署後OAuth讀回AUD／issuer與配置相同，其他bindings（包含精確作者Email的secret binding與D1）完全保留。公開Worker設定前後相同。
- **保持停用**：兩Worker `workers.dev=false`、`preview_urls=false`、`PRODUCTION_SERVICES_ACTIVE=false`；D1仍0留言、`paused=1`、`moderation=1`。沒有遷移、寫入留言、改Access政策、改Turnstile、啟用Pages或執行release。部署日誌／前後快照／版本均只存既有私人目錄。
- **證據界限**：實際AUD與先前保存的官方應用ID、hostname、OTP provider、精確Email Allow政策核對一致。本次OAuth嘗試即時讀Access仍403；不冒稱已重新核實雲端政策現況。未進行真實登入，原兩項安全待驗不變。
- **修正**：`node scripts/prepare-production-inactive.mjs 私人設定.json 私人access-admin-verified.json`。有AUD時須具匹配的官方讀回資料及已核實旗標；檢查應用、AUD、獨立於staging、hostname全路徑、精確Email、單一Allow及無Bypass。不完整或不匹配會在任何輸出寫入前停止。初始沒有AUD且未宣稱政策已核實時，仍允許產生拒絕服務設定。CLI不印AUD、Email或私有網址。

本輪驗證：106項測試全綠（保留原103項，新增3項AUD保留／拒絕／不覆寫回歸）；輸入、64串清冊、local預檢通過；check 128檔零錯誤／警告、1個既有hint；build 114頁。管理Worker dry-run與實際部署後讀回通過。精準測試第一次受本機sandbox禁止監聽限制，完整套件在允許本機測試程序的環境通過，未放寬斷言。沒有UI改動，不新增重複截圖。最新CI見獨立PR。

## PR #25當時的受控驗證契約（歷史；現已授權，實作見上）

**現有依賴確實存在**：full release與啟用設定產生器都要求LIVE_COMMENTS_VERIFIED等真實證據；production API停止、D1暫停且Turnstile只允許正式hostname，所以今天不能透過普通前台取得production發表證據。`check-live-services.mjs`還要求公開API健康且接受留言。不能拿staging結果、合成fixture或設定讀回冒充production通過，也不能為此先公開Pages。

建議一次性授權的最小驗證窗口（本輪只定義契約，尚未建立）：

1. 使用既有受Access保護的HTTPS驗證前台，備份原配置，不重建整站。先確認它的Access為精確作者白名單；先前非作者曾開啟一般staging前台的疑點未釐清前，不能直接假定足夠保護。可由作者一次提供目前政策畫面核對；不要求新的Access Token。政策不符即停止，不能開驗證寫入。
2. 以前台Worker的**私有HTTP service binding**連至現有production留言Worker；production留言Worker的workers.dev與preview維持關閉，不開公開API。驗證路由必須伺服器驗證真實前台Access JWT（簽章／issuer／AUD／期限／精確作者），只轉發固定留言API路徑／方法；沒有任意代理、secret query或test-bypass。保留真Turnstile、限流、刪除憑證、參數化SQL等後端保障；不能把前台登入當成讀者留言所有權。此小型驗證路由尚待授權後實作及測試。
3. 作者一次授權後，production Turnstile只暫增該**精確驗證hostname**，production Worker的origin與hostname校驗僅暫增同一來源；保留正式hostname，不用萬用允許、dummy key或偽造hostname。使用真production sitekey／secret取得驗證token。這是受限測試配置，不可把它輸出成正式release manifest。
4. 只有通道驗證通過後，另行以窗口授權設定production activation=true、D1限時解除暫停；只允許上述受控通道進入，少量明示合成留言按ID記錄。**目前啟用產生器不支援此窗口，不能手改LIVE旗標來通過它**；下一輪須增加獨立的窗口設定／預檢，綁定作者明確授權、實際通道／來源／DB、到期與復原條件，不能讓公開請求打開窗口。這不是production正式啟用授權。
5. production管理Worker依現有Access保護短暫開啟管理hostname及activation；繼續逐次JWT／精確Email驗證、不共用前台AUD。作者完成一次真實OTP及非白名單拒絕驗證；兩個獨立瀏覽器驗證讀者憑證所有權。這些缺乏真實操作證據時仍阻擋，不要求本輪重做。
6. 驗證結束或任何失敗：先恢復D1 paused=1，再關閉activation／管理入口；移除驗證service binding與臨時hostname／origin，恢復受控前台配置；讀回所有開關，按記錄清理僅本輪合成資料，不能整庫清空。窗口到期也須自動fail closed，復原不依賴聊天繼續運行。正式與測試資料不混用；不送正式分析、不重寄Formspree信。

**證據與正式hostname分開**：受控窗口可驗證實際production程式／DB／Turnstile／管理權限與持久化，記錄使用的測試hostname、版本及恢復後差異；通過才可填對應LIVE_*，不是證明GitHub Pages正式hostname已實測。正式hostname的TLS／跨來源／Turnstile前台最終相容性只能在日後經授權發布後補測，列為必做冒煙檢查及立即回退條件。若作者要求正式hostname也必須事前實測，必須另行授權真正受限的該hostname驗證設施；本輪沒有此設施，不能聲稱完全等價或解除門檻。

**最終發布順序**：窗口證據與兩項安全證據完成 → 恢復正式精確來源／hostname並重新預檢（不帶臨時來源）→ 作者另行核准production啟用及網站發布 → 備份／版本記錄／產生綁定正式main SHA的manifest → 開production管理及公開留言服務、健康檢查（這一步明確需要公開寫入授權）→ 將manifest置於已保護Environment → Pages改Actions Source、手動full release與作者審核 → 正式hostname冒煙檢查。失敗即暫停留言或停用故障服務、依版本回退；索引解除仍獨立確認。任何政策／權限／證據／健康缺失都停止，不先解鎖Pages來湊證據。

技術依據：[Cloudflare私有Service bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/service-bindings/)允許不對公開網路開放的Worker由指定binding呼叫，但Access context不會自動傳遞，故入口仍需驗JWT；[Turnstile hostname管理](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/)允許明確配置驗證hostname。本方案是在既有服務上的受控驗證設計，**尚未實作或線上驗證，不是本輪已完成項目**。

## 實際資源與狀態

|項目|本輪實際結果|啟用狀態|
|---|---|---|
|production D1 `fansi-comments`|已建立，與staging不同ID；0001／0002遷移成功；讀回0則留言、paused=1、moderation=1；初始空庫備份在repo外|已配置／寫入停用|
|公開留言Worker `fansi-comments`|已上傳既有程式＋production停用閘門，綁定production DB；secret私下匯入|workers.dev=false、preview_urls=false、PRODUCTION_SERVICES_ACTIVE=false；沒有公開入口|
|私人管理Worker `fansi-comments-admin`|已上傳，綁定production DB；精確帳號secret私下保存；原JWT簽章／issuer／audience／期限驗證保留|workers.dev=false、preview_urls=false、啟用false；真正AUD已部署讀回，無可用管理頁|
|production Turnstile|獨立widget/site key，精確hostname為quantummedic.github.io，managed模式、no_clearance|已配置，尚未在正式前台驗證|
|production Access|本次短期受限Token建立獨立管理應用；精確作者Email、只允許既有OTP、完整hostname所有路徑；實際AUD已保存私人設定|既有設定讀回證據匹配、AUD已部署；即時政策重讀403、未驗真實登入，管理入口仍關閉|
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

1. **Cloudflare Access設定已完成**：作者另行提供短期受限Token後，已建立並讀回精確作者Email＋OTP的production管理應用；不重建組織、不修改staging或其他應用，public API與Pages不加作者登入。實際AUD僅保存私人設定，本輪未部署；本輪AUD已接至停用Worker，後續仍須另行授權受控真實驗證。作者已確認撤銷設定Token，本輪沒有再次使用。
2. **GitHub Settings → Environments → github-pages（已完成）**：本輪已實際建立並儲存，部署只允許Branch main（1 branch／0 tags），required reviewer為QuantumMedic，禁止管理員bypass。Prevent self-review維持關閉，唯一作者仍須明確核准自己的發布。prepare與deploy使用同一Environment，可能各要求一次審核；本輪沒有執行工作流程測試。
3. 在該Environment建立`RELEASE_SERVICES_JSON` secret，內容來自完成私人預檢後的白名單manifest；不把Cloudflare secrets、白名單或管理網址上傳GitHub。生成：`node scripts/launch/service-release.mjs 私人production設定.json repo外manifest.json`。目前此命令應拒絕，不能手工把待驗旗標改true。
4. **GitHub Settings → Pages → Build and deployment**：另行發布授權時才切換Source為GitHub Actions，維持既定`https://quantummedic.github.io/fansi-notes/`；不要選main分支式自動發布、不改DNS或買網域。本輪未動設定。
5. 安全證據與production真實接線完成後，另行授權啟用Workers與DB寫入；先確認管理Access所有可達hostname，再開workers.dev，preview持續關閉。網站公開前依序做正式預檢、備份、manifest、手動workflow與發布後檢查。正式管理書籤需另外驗證後私下交付。

## 明確停止條件

目前production preflight為not-configured：缺M6_DEPLOY_APPROVED、LIVE_COMMENTS_VERIFIED、LIVE_ACCESS_VERIFIED、NON_ALLOWLIST_ADMIN_VERIFIED、INDEPENDENT_BROWSER_DELETE_VERIFIED。未擅自填true。

非白名單真實管理存取／獨立瀏覽器自刪仍待驗；作者本輪暫不追加操作。第一次其他Email開啟一般staging文章不是已確認管理入侵；無OTP也不是拒絕通過。不能為本輪接線暫時移除限制；Access設定權限阻擋已解除，真實安全及發布門檻仍保留；不能把政策讀回當成登入實測。

## production Access前輪設定紀錄（AUD未部署等指當時）

- 新Token以本機隱藏輸入存repo外0600檔案；只用於本專案production管理Access。原OAuth 403是歷史狀態，本次設定成功不代表Wrangler取得額外權限。
- 核對既有team domain及唯一OTP provider；新增一個獨立production應用。讀回完整hostname、全部路徑、四小時session、HTTP-only cookie、停用preflight bypass／App Launcher；只有一條精確作者Email Allow，沒有Everyone、整個Email網域或Bypass。production AUD與staging不同。
- 前後對比其他Access應用內容一致。原始應用／政策／ID／AUD及白名單證據只在私人目錄，公開報告只記去識別結果。
- 後續OAuth唯讀核對兩Worker仍workers.dev=false、preview=false、activation=false，綁定獨立production D1；0留言、paused=1、moderation=1。本輪沒有Worker部署、遠端遷移或開入口；線上管理Worker的AUD仍空值、拒絕服務。
- 私人production預檢invalid=[]，ready=false；尚缺發布授權、production留言／Access真實實測與原兩項安全證據。沒有預填任何live驗證旗標。沒有新UI或程式修改；本次只更新此報告及CURRENT_STATE，CI以最新文件提交為準。
- 作者已確認撤銷 `fansi-access-production-setup`。此後不再使用該Token，不重新要求建立。

## PR #24已整合／Environment保護已設定（前輪紀錄）

作者授權後以merge commit `745553452f229f359d17989d61dce1c582461e99` 合併PR #24，[main驗證CI成功](https://github.com/QuantumMedic/fansi-notes/actions/runs/43845649652)。合併工程樹與原PR HEAD完全一致；其後僅現況／驗收文件補記，沒有功能或正式內容變更。

Pages合併前後實際畫面均為Deploy from a branch、Branch=None、currently disabled。Environment已儲存唯一作者審核、禁止bypass與main-only部署規則；沒有secrets／variables。未執行release、未啟用Pages、noindex不變。設定已完成，不要求作者重新操作同一輪控制台。

最後OAuth唯讀核對兩Worker保持所有入口及啟用關閉，D1 0留言且暫停；管理Worker AUD尚未部署，私人實際AUD與Access設定保留。使用者已確認Token撤銷，沒有再次存取該Token。

剩餘最小順序：另行授權將實際AUD接至停用Worker → 受控production接線與真實安全證據驗證（原兩項缺口保留）→ 正式預檢通過後產生綁定SHA的RELEASE_SERVICES_JSON並加入已建立Environment → 另行正式發布授權時切換Pages Actions Source、執行手動workflow並由作者審核。索引開關另有確認；任何門檻缺失即停止，不填假證據。不重寄已確認Gmail驗收信、不重做已接受staging流程。

## PR #24原驗證紀錄（本輪新增驗證見頂部）

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

## production Access前輪設定紀錄（AUD未部署等指當時）

- 新Token以本機隱藏輸入存repo外0600檔案；只用於本專案production管理Access。原OAuth 403是歷史狀態，本次設定成功不代表Wrangler取得額外權限。
- 核對既有team domain及唯一OTP provider；新增一個獨立production應用。讀回完整hostname、全部路徑、四小時session、HTTP-only cookie、停用preflight bypass／App Launcher；只有一條精確作者Email Allow，沒有Everyone、整個Email網域或Bypass。production AUD與staging不同。
- 前後對比其他Access應用內容一致。原始應用／政策／ID／AUD及白名單證據只在私人目錄，公開報告只記去識別結果。
- 後續OAuth唯讀核對兩Worker仍workers.dev=false、preview=false、activation=false，綁定獨立production D1；0留言、paused=1、moderation=1。本輪沒有Worker部署、遠端遷移或開入口；線上管理Worker的AUD仍空值、拒絕服務。
- 私人production預檢invalid=[]，ready=false；尚缺發布授權、production留言／Access真實實測與原兩項安全證據。沒有預填任何live驗證旗標。沒有新UI或程式修改；本次只更新此報告及CURRENT_STATE，CI以最新文件提交為準。
- 作者已確認撤銷 `fansi-access-production-setup`。此後不再使用該Token，不重新要求建立。

## PR #24已整合／Environment保護已設定（前輪紀錄）

作者授權後以merge commit `745553452f229f359d17989d61dce1c582461e99` 合併PR #24，[main驗證CI成功](https://github.com/QuantumMedic/fansi-notes/actions/runs/43845649652)。合併工程樹與原PR HEAD完全一致；其後僅現況／驗收文件補記，沒有功能或正式內容變更。

Pages合併前後實際畫面均為Deploy from a branch、Branch=None、currently disabled。Environment已儲存唯一作者審核、禁止bypass與main-only部署規則；沒有secrets／variables。未執行release、未啟用Pages、noindex不變。設定已完成，不要求作者重新操作同一輪控制台。

最後OAuth唯讀核對兩Worker保持所有入口及啟用關閉，D1 0留言且暫停；管理Worker AUD尚未部署，私人實際AUD與Access設定保留。使用者已確認Token撤銷，沒有再次存取該Token。

剩餘最小順序：另行授權將實際AUD接至停用Worker → 受控production接線與真實安全證據驗證（原兩項缺口保留）→ 正式預檢通過後產生綁定SHA的RELEASE_SERVICES_JSON並加入已建立Environment → 另行正式發布授權時切換Pages Actions Source、執行手動workflow並由作者審核。索引開關另有確認；任何門檻缺失即停止，不填假證據。不重寄已確認Gmail驗收信、不重做已接受staging流程。

## PR #24原驗證紀錄（本輪新增驗證見頂部）

輸入與64串清冊、服務local預檢通過；Astro check 121檔0錯誤／警告／提示，114頁普通build；98項測試通過（原94項保留，新增4項發布門檻／手動workflow／production隔離／真SQLite復原）。第一次沙箱限制本機監聽導致Worker測試EPERM，授權本機執行後98項全過，不修改斷言。另驗證隔離noindex與index候選建置，均未部署。CI以本PR最新HEAD為準。無可見版型變更，不重跑已接受的M5-F手機巡檢；未操作任何遠端DB或寄信。
