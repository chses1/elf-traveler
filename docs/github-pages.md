# GitHub Pages 發布指南

這個專案是純前端靜態網站，入口檔是根目錄的 `index.html`。發布到 GitHub Pages 時不需要安裝套件、不需要執行建置指令。

## 第一次上傳

1. 到 GitHub 建立新的公開 repository。
2. 將本專案根目錄的所有檔案上傳到 repository。
3. 確認 repository 根目錄可以看到：
   - `index.html`
   - `src/`
   - `img/`
   - `.nojekyll`
   - `README.md`
4. 確認 GitHub 預設分支是 `main`。

## 啟用 GitHub Pages

1. 進入 repository 的 `Settings`。
2. 左側選單點選 `Pages`。
3. 在 `Build and deployment` 設定：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. 按下 `Save`。
5. 等待 GitHub 顯示發布網址，通常格式會像：

```txt
https://你的帳號.github.io/你的repo名稱/
```

第一次發布可能需要等待數分鐘。

## 更新網站

之後只要把修改後的檔案 commit 並 push 到 `main` 分支，GitHub Pages 會自動重新部署。部署完成後，重新整理公開網址即可看到新版。

如果看不到最新畫面，可以嘗試：

- 等待 1 到 5 分鐘再重新整理
- 用瀏覽器強制重新整理
- 確認 `Settings` → `Pages` 沒有顯示部署錯誤

## 注意事項

- 不要把 `index.html` 移出根目錄，GitHub Pages 會用它當首頁。
- 不要搬動 `src/` 和 `img/`，目前程式與樣式都使用這些相對路徑。
- `.nojekyll` 請保留，讓 GitHub Pages 原樣發布靜態檔案。
- 學號與遊戲進度只保存在使用者瀏覽器的 `localStorage`，不會同步到 GitHub 或雲端。
