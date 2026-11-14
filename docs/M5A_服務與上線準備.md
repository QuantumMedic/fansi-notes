# 第三方方案與上線準備

2026-11-13 查閱官方資料；價格與額度需啟用前再核對。未建立帳號、未付款、未啟用任何服務。

| 用途／方案 | 能力與限制 | 費用與決策 |
|---|---|---|
| 留言：Hyvor Talk | 訪客可用名字留言，Email 選填；可審核、回覆。訪客不能自行修改／刪除，需管理者處理 | Personal 官方顯示 €50 年繳、2,500 credits/月；需要作者批准付費與訪客資料政策 |
| 留言：Giscus | 免費、無廣告，資料在 GitHub Discussions；發言須 GitHub OAuth | 不符合唯一低門檻留言入口，不建議作唯一方案 |
| 私訊：Formspree | 代收表單、郵件通知、基本垃圾訊息防護；免費額度適合低量測試 | Free 50 次/月；Personal US$15 月繳或 US$120 年繳，匯出等能力依方案；需作者設定私人收件人 |
| 私訊：Formspark | HTML 表單端點、後台與郵件收件、垃圾訊息過濾、CSV／JSON 匯出 | 需核對當下付費額度；可作 Formspree 備選，啟用前測試中文及錯誤回應 |

建議供作者選擇：若接受付費與訪客留言政策，優先評估 Hyvor Talk；私人來信先評估 Formspree。這是方案建議，並非已選定或啟用。

來源：[Hyvor 訪客模式](https://hyvor.com/talk/docs/commenting)、[Hyvor 價格](https://hyvor.com/talk/pricing)、[Giscus](https://giscus.app/)、[Formspree 方案](https://formspree.io/plans/)、[Formspark](https://formspark.io/)。

## 尚待作者決定

留言服務／預算、是否允許訪客、預先審核或事後管理、刪除請求方式、通知與保留期限；私訊服務／收件者、合作分類、保留期限；正式網域與上線日期。私人收件地址與管理金鑰不可進公開 Repo。

## M5-B 接入契約

留言以固定 work_id 為討論識別，不以可改名標題建立重複討論。服務載入前告知第三方資料處理；未設定／封鎖／連線失敗要保留可讀狀態，不顯示假留言。作者回覆、審核、封鎖、匯出、刪除須在選定平台真人驗收。

聯絡送出時由核准 HTTPS 端點處理，必須驗證 Email／訊息、垃圾訊息防護、重複提交、送出中、成功、HTTP 錯誤、逾時與重試。服務確認成功前不能顯示送達。此階段 UI 只做本機格式檢查，無網路提交與持久儲存；無 JS 欄位停用。

## 部署準備（不啟用）

沿用 Astro site 與 /fansi-notes base。參考 [Astro GitHub Pages 官方指南](https://docs.astro.build/en/guides/deploy/github/)。目前 CI 只有 contents:read，輸出審閱 artifact；沒有可執行 deploy job。本次不增加 pages:write 或 id-token:write。

M5-B 先確認 PR 依賴依序合併、真實公開資料與無合成資料，再由作者批准 Pages environment／工作流程與網域。流程為 npm ci → check → build → test → 上傳 Pages artifact → 核准後 deploy。部署前取消 noindex 與 robots 阻擋；校驗 canonical、sitemap、RSS 不含審閱、測試或未核准頁。失敗不替換網站，回滾使用上個核准 commit 重建。正式發布後檢查 404、base 路徑、HTTPS、播放器同意載入、手機與輔助科技。
