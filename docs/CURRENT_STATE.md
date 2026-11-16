# CURRENT_STATE｜唯一目前有效網站狀態

## 真實 staging 接線（2026-11-16，進行中）

- 作者已完成 Cloudflare Zero Trust Free、One-time PIN、既有 Formspree 表單及收件通知、GoatCounter 正式／測試兩站的私人控制台設定；不再要求註冊，也不以作者已完成的付款資料步驟作為阻擋。
- 本輪已授權本專案免費 staging 資源、受控部署與 D1 增量遷移、一封合成來信及隔離分析事件。仍禁止 production、合併、付費升級、公開私人管理網址／白名單／密鑰。
- 最新分支基線 `d72d6e538a322012fddab66f2e73f10a7789f744`，Wrangler 4.162.0；官方裝置 OAuth 已由作者完成，帳號已核對。已建立本專案免費 staging D1 與 Turnstile；尚未部署 Worker 或前台。
- 已匿名實測兩個 GoatCounter 控制台，皆顯示登入表單，未顯示統計；本輪未送分析事件。Formspree 收件設定由作者確認，尚未寄驗收信或確認 Gmail 實收。
- 私人 staging 設定保存在 Repository 外、目錄 0700／檔案 0600；Account ID、D1 ID、workers.dev 子網域與 Turnstile key 皆來自實際 API 結果；Access team domain 仍待補權限核對，未虛構 AUD。
- 本輪本地 91 項測試全數通過（保留原 90 項）、check 114 檔零錯誤／警告／提示、114 頁 build 成功；正式內容資料與雜湊基準不變。GitHub CI 待本輪提交驗證。新增受控 staging 前台與權限測試；所有資產先驗 JWT、精確帳號及 audience，缺設定拒絕，保持 /fansi-notes/ 與 noindex。本輪真 Turnstile、持久留言、自刪、Access OTP、管理回覆、Gmail 實收與測試統計仍待實測；不宣稱 M5-E 已驗收。
- D1 僅套用現有 0001／0002 增量遷移，實查留言數為 0；沒有搬入本地示範留言。Turnstile managed widget 僅允許測試前台 hostname，secret 只在私人設定。
- Access 應用建立回應 403 `auth.forbidden`；現有 Wrangler OAuth 缺 Access Apps and Policies 寫入權限與組織讀取權限。已提供限目前帳號的短期 Token 與本機隱藏輸入方式；未重試繞過、未虛填 ACCESS_POLICY_VERIFIED。
- `prepare-staging-site.mjs` 將既有 build 放在 Repository 外，逐檔排除私人設定；獨立前台 Worker 要求 run_worker_first／Access 驗證，preview_urls=false。設定產生器仍先要求完整政策預檢；migration 使用限定 DB 的私人設定，不放寬既有 production 要求。



本輪公開管理入口移除：程式與本地權限測試已完成；90項測試、check零錯誤／警告／提示、114頁build、輸入檢查／服務預檢、兩個Worker dry-run通過。正式Access政策與真實登入尚待接線驗證；GitHub CI以PR #21最新HEAD為準。


**留言介面與管理體驗已實作／本地及CI測試通過／待作者視覺驗收與免費帳號設定、真實接線。** 工程提交 `e5ef26b3d22a0309a1e538675de6784fb2dba7d2`：[CI #123 全綠](https://github.com/QuantumMedic/fansi-notes/actions/runs/43800453776)，88項測試通過；未合併或部署。

更新：2026-11-16。**作者已表示主要展示驗收良好，下一批採零訂閱費互動服務。** 本分支已實作免費互動程式，本地與測試結果見下；未建立外部帳號、未送真信、未啟用正式分析，未合併或部署。

## 本輪最新決定：私人書籤管理

公開HTML與JavaScript停止產生作者登入、作者專用回覆連結及管理網址。舊PUBLIC_COMMENTS_ADMIN_URL即使留在環境也忽略。作者保存私人管理書籤，Access驗證後集中管理；只保留管理頁返回原文的單向導航。認證與公開留言功能不變。正式Access政策、帳號及真實登入仍待接線驗證。

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

## M5-E互動服務：本地已實作，帳號已準備、待 CLI 授權及真實接線

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
