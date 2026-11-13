# 批次匯入準備

先在 Repository 外整理清冊；不要把真實待發稿放進本專案。範例 examples/import-manifest.synthetic.json 只有合成資料。

```sh
node scripts/import-batch.mjs examples/import-manifest.synthetic.json
node scripts/import-batch.mjs examples/import-manifest.synthetic.json --output /private/tmp/fansi-import-new
```

預設只驗證；指定 output 才產生完整 Markdown 與 publications.json，輸出目錄必須尚不存在、位於 Repo 外，拒絕覆寫。所有項目驗證成功才寫入暫存，最後 rename。記錄只包含數量，不列正文或個資。

清冊：version=1，items 陣列。每筆 kind=article 或 publication，metadata 使用現有 schema，public_authorization=true 代表已取得此次公開授權，不可由工具推定。article 另有 body（完整書面母稿）；可選 source_url 用來人工核對公開來源。文章包含 work_id、slug、系列、主要／次要主題、核准者、日期、版本與 website_approved。小說使用 publication_status、work_form、series／order，各自獨立；試讀與世界資料也必須可公開。

正式資料預設拒絕；M5-B 經作者另外授權後才用 --allow-public。此旗標不是授權證據，操作人需保留作者核准紀錄。CLI 不自動寫入 Repo、不修改 RSS／GUID 配對、不覆蓋現有作品。重複 ID、路徑穿越、私有額外欄位及無效日期會拒絕。既有作品更新需依 work_id 另做差異審閱；新批次與既有站點的 ID、slug、關聯衝突須在整合 PR 執行完整 catalog 建置驗證，不能直接覆蓋 publications.json。

未來清冊欄位可先用外部試算表盤點：kind、work_id、slug、title、source_url、網站公開授權、核准者、核准版本／日期、書面母稿來源、封面授權、content_type、主要主題、次要主題、publication_status、work_form、series、order、Podcast GUID／配對核准。小說不套文章九大主題；Podcast 關聯仍獨立核准。清冊空白範本見 examples/import-inventory.csv。


## M5-A 最後驗收：作品公開範圍

- 凡思維、深度文章與其他文字創作可以只有網站全文，沒有 Podcast、IG 或 Vocus；三者連結均選填。小故事、隨筆與短文由作者選既有作品系列與主題，不新增分類、不強迫錄音。
- `written_master: website-original` 表示獨立網站書面定稿；既有 IG／Vocus 共用稿維持 `ig-vocus`。這是來源辨識，不改雙母稿創作順序；兩者都需明確網站公開授權。
- 小說與出版定位為作者作品館。預設只有書封、簡介、出版資訊、購買連結，試讀／番外／世界觀均選填，不預設公開小說全文。
- 已公開且另行授權全文的短篇小說可使用 `work_form: short`、`publication_status: published` 與 `full_text: {approved:true, approved_by, approved_revision, text}`。沒有 full_text 不顯示全文；未核准、未公開或長篇小說使用此欄位會驗證失敗。全文以跳脫文字與段落呈現，不執行 HTML。
- 歷史作品一次性批次匯入；未來作品經既有 SOP 確認後逐篇同步。完成 SOP 不等於公開授權，工具操作才會寫入 GitHub。未授權稿件不能先放公開 Repo 再用欄位隱藏。
