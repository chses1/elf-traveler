# 精靈旅人－桃花園

桃園市 13 區地方特色 × 精靈收集養成 × 回合制問答戰鬥的教育冒險遊戲原型。

這是一個純前端靜態網站，可以直接放到 GitHub Pages 發布，不需要安裝套件、不需要建置流程，也不需要後端伺服器。

## 目前功能

- 首頁、登入畫面與桃園市 13 區探索地圖
- 每區一隻守護精靈，共 13 隻
- 每區地方介紹與 10 題四選一題目，共 130 題
- 回合制答題戰鬥、能量累積、角色技能與大招
- 隊伍選擇、戰勝收服精靈、金幣獎勵
- 圖鑑、神社升級、最終 Boss 挑戰
- 使用 `localStorage` 儲存同一台瀏覽器中的遊戲進度

## 隱私說明

登入時輸入的 5 位數字學號只會儲存在使用者瀏覽器的 `localStorage`，用來區分同一台裝置上的遊戲進度。這個版本沒有帳號系統、沒有雲端資料庫，也不會把學號或進度上傳到任何伺服器。

## 本機開啟

### macOS 快速開啟

在 Finder 中雙擊 `開啟遊戲.command`，它會啟動本機預覽伺服器並自動打開瀏覽器。

這個檔案只是本機便利工具，不是 GitHub Pages 必需檔案。

### 手動開啟

在專案資料夾執行：

```bash
python3 -m http.server 4174
```

然後打開：

```txt
http://localhost:4174
```

## 發布到 GitHub Pages

1. 在 GitHub 建立公開 repository。
2. 將本專案所有檔案上傳到 repository 根目錄。
3. 到 repository 的 `Settings` → `Pages`。
4. 在 `Build and deployment` 選擇：
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
5. 儲存後等待 GitHub Pages 部署完成。

詳細步驟請看 [GitHub Pages 發布指南](docs/github-pages.md)。

## 專案結構

```txt
docs/                 企劃、發布與檢核文件
img/                  遊戲實際使用的圖片素材
src/
  data/               行政區、精靈、題目、角色技能與初始狀態
  systems/            戰鬥與進度儲存邏輯
  styles/             介面樣式
assets/               未來音效、圖示與素材預留資料夾
index.html            GitHub Pages 首頁入口
開啟遊戲.command      macOS 本機快速預覽工具
```

## 上傳前檢查

請依照 [發布前檢查表](docs/release-checklist.md) 走一次主要流程，確認首頁、地圖、戰鬥、圖鑑、神社與手機畫面都能正常使用。

## 授權

本專案目前未加入開源授權檔。公開 repository 代表可以被瀏覽，但不代表他人自動取得重製、散布或改作授權。若未來要開放他人改作，請再新增明確授權。
