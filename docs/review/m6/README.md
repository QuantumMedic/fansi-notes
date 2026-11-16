# M6 上線準備（2026-11-16）

M6上線準備已實作；正式部署與互動啟用待另行授權及必要條件。本PR base為PR #22。未合併、未部署、未建立production、未改Access、未重寄信或新增費用。作者已接受網站操作與視覺，非阻擋細節延後。

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

## 本輪驗證

輸入與64串清冊、服務local預檢通過；Astro check 121檔0錯誤／警告／提示，114頁普通build；98項測試通過（原94項保留，新增4項發布門檻／手動workflow／production隔離／真SQLite復原）。第一次沙箱限制本機監聽導致Worker測試EPERM，授權本機執行後98項全過，不修改斷言。另驗證隔離noindex與index候選建置，均未部署。CI以本PR最新HEAD為準。無可見版型變更，不重跑已接受的M5-F手機巡檢；未操作任何遠端DB或寄信。
