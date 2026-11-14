# M0–M5-A整合驗收（2026-11-14）

作者已驗收視覺精修並授權依序merge commit合併。全部PR已改以main為合併目標且完成；保留原分支供追溯。

| PR | merge commit |
|---|---|
| #1 | 6988158ae7bd618d225b1ab1853c4a1d83792821 |
| #2 | ce8d7fd0b7f42c3ecb1ce42aad039d3862f2ad50 |
| #3 | 8870300b8cc685568bf0f6296cefffdb867d69a3 |
| #4 | d1694de9d701fb6259e64c9fb572fa0577947751 |
| #5 | b69d6cd6ce877a9c13d43a109a0da5d7c34a4dd0 |
| #6 | 6823642b8d375485e5cbd19bb88f11f1e4c9238d |
| #7 | 32093dce852dc839a5fa9561c29759a29c26b293 |

每一步先確認前一步main CI通過，再驗證下一份PR。重定基底後，git merge-tree --write-tree所得tree與階段分支tree完全一致，且檢視變更檔案及工作流程差異。沒有衝突或強制合併。

PR #2、#3重新執行驗證工作。PR #4舊工作重跑長時間排隊，透過關閉再重開同一PR觸發針對新基底的新CI；#4–#7均在新CI成功後才合併。沒有以略過失敗或管理員強制方式合併。新CI可從各PR Checks查閱。

最終整合tree與PR #7完全相同：636dc8323837fba4ae9d237d685ae1c101df97c7。main重新執行 npm run check、npm run build、npm test：0錯誤／警告／提示、54頁、35/35測試通過。文件更新只改CURRENT_STATE與本驗收紀錄，網站程式與測試資料不變。

部署檢查：公開Repository API has_pages=false、deployments空陣列；所有階段workflow變更只有唯讀建置及審閱artifact。沒有deploy-pages、第三方部署指令或寫入權限。合併後RSS排程可開始執行，但只產出審閱artifact，不推送、不部署。

本輪M5-B僅盤點來源。清冊位於本機Repository之外；沒有新增真實正文、書封、作者資料或正式配對。等待作者核准首批內容及公開範圍。
