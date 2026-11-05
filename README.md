# PhotoEdit

照片留白、調整尺寸與批次匯出工具。正式入口只有 **[`index.html`](index.html)**，不需安裝 Python、Node.js 或其他工具。下載這個 HTML，直接用瀏覽器開啟即可；ZIP 程式庫已內嵌，離線也能使用。

## 使用方式

1. 開啟 `index.html`，選擇或拖入照片。
2. 分別設定比例、解析度、壓縮與背景，查看即時構圖預覽。
3. 勾選 JPEG、PNG，或兩種格式一起輸出。
4. 選擇 ZIP、資料夾或逐張下載，按「處理並下載」。

所有影像處理都在瀏覽器本機完成，沒有照片上傳服務，也沒有外部 CDN、追蹤碼或字型需求。只有常用顏色會儲存於瀏覽器；照片與其餘設定不會永久保存。

## 預設與各項設定

| 設定 | 預設 | 說明 |
| --- | --- | --- |
| 照片比例 | 4:5 直幅 | 延續 v3；以增加背景補足畫布，不裁切、不拉伸照片。另有原比例、1:1、3:4、9:16、1.91:1、3:2、16:9 與自訂比例。 |
| 解析度 | 保持原始照片像素 | 照片本身不縮放，畫布可能因補背景而變大；也可選畫布寬 1080 px、自訂寬度、自訂長邊。 |
| 輸出壓縮 | 關閉 | JPEG 使用瀏覽器最高品質（quality = 1），開啟後可調 1–100%。不改變像素尺寸，不表示檔案縮小至某個百分比。 |
| 背景 | 純黑 `#000000` | 可設任意純色、RGB、收藏常用色或改用模糊照片背景，與比例和解析度獨立。 |
| 輸出格式 | JPEG | 可複選 JPEG、PNG；每張照片會產生各自的檔案。 |
| 儲存方式 | ZIP | ZIP 只打包、不降低照片品質。 |

例如 6000 × 4000 的橫幅照片，預設輸出為 **6000 × 7500**，原始照片置中、上下補黑；若解析度選擇 1080 px，才會縮放到 1080 × 1350 的畫布。

「原始像素」不等於原檔複製。照片會經過瀏覽器解碼與 Canvas 重繪；JPEG 即使品質 100% 仍屬有損重新編碼。PNG 無損保存的是此次畫布的像素，並不能還原來源 JPEG 已經失去的細節。EXIF、GPS、原始 ICC、HDR／高位元深度等不保證保留；本工具適合分享輸出，不取代攝影原檔保存。非整數尺寸會取整數，比例可能有一個像素的誤差。

## Instagram 與輸出格式

預設保留 JPEG，避免將原本 JPEG 工作流程強制換成 PNG。PNG 作為可選的無損副本，可以和 JPEG 同時匯出。

2026-11-06 查核時，Instagram 官方說明與 Meta 開發者文件受到存取限制，**未完成一般 App／網頁上傳 PNG 的官方確認**。也未使用使用者帳號進行實際上傳測試。不能將 API、廣告投放、一般 App 上傳的規範混為一談，或保證任何格式上傳後不被重新壓縮。此工具保留使用者選擇，沒有替你向 IG 發文。

待查來源：[Instagram 照片解析度說明](https://help.instagram.com/1631821640426723)、[Meta 內容發布文件](https://developers.facebook.com/docs/instagram-platform/content-publishing/)。

## GitHub Pages

部署只需要 `index.html`。本專案另附 `.github/workflows/pages.yml`，會把 `index.html`、`.nojekyll`、第三方授權說明打包，歷史 Python／HTML 與測試不會放進網站。

首次設定：在 GitHub 儲存庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**。將變更推送至 `main`，或在 Actions 手動執行 **Deploy PhotoEdit to GitHub Pages**。正式網址為：

[https://h6rst0n.github.io/PhotoEdit/](https://h6rst0n.github.io/PhotoEdit/)

2026-11-06 已啟用並部署成功：[部署紀錄](https://github.com/H6rst0n/PhotoEdit/actions/runs/42118702159)。已驗證 HTTP 200、線上 HTML 與本機 SHA-256 一致，以及載入後離線匯出 JPEG／PNG ZIP。後續修改 `index.html` 並推送到 `main` 會自動部署。設定依據：[GitHub 官方自訂 Pages workflow 說明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## 專案結構

```text
index.html                 唯一持續維護的應用程式（含樣式、程式與 ZIP 函式庫）
README.md                  使用與部署說明
CHANGELOG.md               改版紀錄
THIRD_PARTY_NOTICES.md      內嵌函式庫授權
.nojekyll                  靜態頁面標記
.github/workflows/pages.yml  GitHub Pages 部署
archive/html/              原始 v2、v3 HTML，完整封存
archive/python/            原始 Python、模組、安裝批次檔與舊 README
archive/SHA256SUMS          原始封存檔案雜湊
archive/README.md           封存與舊版本說明
tests/browser.cjs          開發用瀏覽器回歸測試
```

未來直接修改 `index.html`，不再建立 `v4.html`、`v5.html` 等平行入口。舊版檔案的根目錄路徑已移至 archive；若原本有舊版書籤，請改用正式入口。

## 支援範圍與限制

- 建議使用近期版本 Chrome／Edge；其他瀏覽器可使用 ZIP／逐張下載。資料夾輸出依瀏覽器能力與權限而定，取消選取不會造成介面卡住。
- HEIC、RAW、特殊影像格式是否能讀取依瀏覽器而定；無法讀取會列出失敗檔案，其他照片繼續處理。動畫圖片僅作靜態照片處理。
- 輸出單邊最多 16,384 px、總像素最多 6,400 萬；這是應用程式限制，不保證裝置能處理到上限。手機或記憶體不足時請降低解析度。
- ZIP 累積影像資料上限 512 MiB，超過會回報未完整匯出的照片，已成功的檔案仍會打包；大量原尺寸照片宜分批或使用資料夾輸出。
- 同名輸出會加編號。資料夾模式會檢查既有檔案以避免覆寫；請勿在同時執行的其他程式中寫入相同輸出名稱。
- 多檔逐張下載可能受瀏覽器限制；完成訊息代表已送交瀏覽器下載，請確認實際下載結果。
- 構圖預覽會縮小，且不預覽 JPEG 壓縮瑕疵；實際匯出採用完整設定尺寸。

## 開發驗證（一般使用者不需要）

使用 Node.js 20+ 與 Playwright Chromium。在獨立開發環境安裝 Playwright，執行：

```sh
npm install --no-save --package-lock=false playwright
npx playwright install chromium
node tests/browser.cjs
```

可用 `PLAYWRIGHT_MODULE` 指定既有 Playwright 路徑。測試直接開啟本機 HTML、將瀏覽器設成離線，檢查尺寸、背景像素、實際 ZIP CRC 與 JPEG／PNG 簽章、品質差異、同名檔案、輸入驗證、損壞檔案恢復與手機寬度。資料夾 API 權限／取消／寫入測試使用模擬物件，並非已驗證所有瀏覽器的原生資料夾對話框。
