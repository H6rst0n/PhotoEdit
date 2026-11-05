# 驗證紀錄

2026-11-06，在 WSL 的 Playwright Chromium 執行 `tests/browser.cjs`，開啟 `file://` 單檔並切換離線。

已通過：

- 預設 4:5／原始像素／壓縮關閉／黑底／JPEG。
- 橫幅、直幅、奇數尺寸、1080 寬、自訂寬與自訂長邊的輸出尺寸。
- 預覽黑底像素為 RGBA `(0, 0, 0, 255)`。
- 實際離線 ZIP 下載、CRC 檢查、JPEG／PNG 簽章及解碼尺寸。
- 同時輸出兩種格式、重複名稱自動編號。
- 同一畫布降低 JPEG 品質後檔案變小；PNG 在相同壓縮設定變動下位元組完全一致。
- 比例、解析度、背景透過介面獨立操作；無效尺寸、未選格式會阻止匯出。
- 損壞圖片回報錯誤，其餘有效圖片繼續匯出；介面恢復可用。
- 資料夾輸出的同名檢查、取消與權限拒絕（模擬 API）。
- localStorage 被禁止時仍可初始化。
- 1280 px 桌面與 390 px 手機布局截圖檢視；手機無水平溢出。
- 正式頁面無外部網路請求、無未捕捉的 JavaScript 錯誤。

限制：未實測實體手機／Safari／Firefox、原生資料夾權限對話框、極限記憶體負載與 Instagram 帳號上傳。

## GitHub Pages 上線驗證

- 原倉庫：`H6rst0n/PhotoEdit`，應用程式提交 `b10e50dfd2dd844020adbab28fedd7c2aed022a8`。
- [Actions run 42118702159](https://github.com/H6rst0n/PhotoEdit/actions/runs/42118702159) 的 deploy job 全部步驟成功。
- 正式網址：https://h6rst0n.github.io/PhotoEdit/ ，HTTP 200。
- 回傳的 HTML 與本機 `index.html` SHA-256 相同。
- Playwright 從正式網址載入後切成離線，實際輸出同一張照片的 JPEG 與 PNG，ZIP CRC 驗證成功。
- 正式頁面無未捕捉的 JavaScript 錯誤。
