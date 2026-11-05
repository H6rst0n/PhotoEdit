# 歷史版本封存

此目錄僅保留歷史來源。正式入口為根目錄的 `index.html`，未來不在這裡迭代。

- `html/`：v2、v3 原始 HTML。
- `python/`：原始 Python、模組、setup.bat、README.txt，保留相對位置。
- `SHA256SUMS`：從儲存庫根目錄執行 `sha256sum -c archive/SHA256SUMS` 可檢查封存原始碼是否保持原貌；不含僅保留在本機的 Python 快取。

搬移時逐檔驗證 SHA-256，未改寫來源文字。舊 Python 快取仍保留在本機，但不再納入新的版本控制；快取不影響執行且可由 Python 重建。舊 HTML 仍保留原本的 CDN 依賴；只有正式入口保證不需 CDN。
