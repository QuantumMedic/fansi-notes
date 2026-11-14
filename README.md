# 凡思筆記 × 作者個人品牌

M0–M2 繁體中文網站原型。僅含虛構測試資料與占位插畫，尚未啟用公開部署。原始交接文件保持不變；產品規格請從 [開發交接包](README_從這裡開始.md) 開始。

## 本機操作

使用 `.nvmrc` 指定的 Node 版本與 npm。

```sh
npm ci
npm run dev -- --host 127.0.0.1
# http://localhost:4321/fansi-notes/
npm run check
npm run build
npm test
npm run preview -- --host 127.0.0.1
```

Astro 靜態輸出至 `dist/`，統一透過 `src/data/site.ts` 的 `url()` 處理 `/fansi-notes/`。資料集合以 `synthetic: true`、`publication_status: demo` 和 `demo-` ID 限制本階段內容。這是原型檢查，無法代替人工檢查每次 diff，不應將私人稿件放入任何分支。正式資料模型及同步留至 M3。

設計 token 位於 `src/styles/global.css`；字體使用本機繁體中文 serif/sans fallback，不下載第三方字體。公開署名、社群連結及服務設定集中於 `src/data/site.ts`。服務未選定時只有誠實空狀態，不存在收件端點。網站不載入外部播放器或追蹤。

CI 僅執行型別、建置、路由、base 路徑與合成資料檢查，保存建置 artifact 供審查；沒有 deploy workflow、Pages 寫入權限或 RSS 排程。原型所有頁面 noindex，robots 禁止索引。正式部署須另經作者批准，再接上 Pages 工作流程。

M0／M1：設計系統、基本路由、資料 schema、標題／摘要搜尋骨架、無後端的服務界面。M2：接續的獨立 PR 加入故事書互動、桌機及手機驗證。M3–M5 不在本次範圍。

待作者確認：署名、Logo、正式分層插畫、文章／書封公開授權、社群網址、留言及聯絡服務。無世界觀核准資料時不建立世界頁；無真實單集與書籍時不建立虛構正式資料。

技術核對來源：[Astro 安裝](https://docs.astro.build/en/install-and-setup/)、[Content Collections](https://docs.astro.build/en/guides/content-collections/)、[GitHub Pages base](https://docs.astro.build/en/guides/deploy/github/)。依 npm 實際可安裝版本與 lockfile 固定依賴。

## M2 視覺與互動審閱

完整畫面與測試紀錄見 [M2 驗收](docs/review/M2.md)。首頁分層 SVG 位於 `src/assets/storybook.svg`，入口及動態邏輯在 `src/components/Storybook.astro`。預設尊重系統減少動態，也可在首頁手動關閉。五個連結始終是靜態 HTML，手機不依賴 hover。全部自動檢查共 7 項；Lighthouse、實機觸控及螢幕閱讀器尚未量測。

M0–M2 完成後等待視覺確認，請勿直接匯入私稿、啟用部署或開始後續內容同步。

macOS 也可雙擊 `開啟本機預覽.command`。有 Node 與依賴時會啟動本機伺服器；本次交付的本機環境另附已忽略、不提交 Git 的 `.local-runtime/`。其他電腦請先安裝 `.nvmrc` 的 Node 版本。按 Control+C 結束預覽。
