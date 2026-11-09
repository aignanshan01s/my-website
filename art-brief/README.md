# 補圖需求包：505 張單字插畫

多益詞旅有 505 個單字目前沒有插畫，詞卡改顯示例句。這個資料夾是交給其他 AI 生圖用的完整需求。

## 檔案

| 檔案 | 內容 |
| :--- | :--- |
| `prompts.csv` | 505 列，Excel 可直接開。欄位：編號、檔名、單字、詞性、分數段、場景類別、英英釋義、畫面描述、完整提示詞、負面提示詞、中文（給你核對用，不要給 AI） |
| `prompts.jsonl` | 同樣內容，一行一筆 JSON，給能批次讀檔的 AI 或程式用（不含中文） |
| `style-refs/` | 8 張原作插畫，當畫風參考圖一起上傳 |

## 交給 AI 的步驟

1. **先試 20 張**：上傳 `style-refs/` 的參考圖，貼下面的「給生圖 AI 的說明」，再給 `prompts.csv` 前 20 列的 `prompt`。
2. **對照參考圖確認畫風**：顏色、紋理、人物畫法要像。不像就調整後重試，畫風定了再做其餘的。
3. **檔名照 `filename` 欄**，例如 `0003-subject.png`，全部放進 `art-brief/returned/` 資料夾，或打包成 zip 傳給我。
4. **交回後我會處理**：逐張檢查有沒有字、畫面和字義連不連得起來、畫風一不一致。合格的縮成網站用的尺寸，併進插畫圖集，詞卡就會改顯示圖片。不合格的會列出來請你重畫。

## 給生圖 AI 的說明（直接複製貼上）

```
You will make 505 square illustrations for an English vocabulary website.
Each picture must help a learner guess the meaning of one English word.

STYLE (keep it the same for every picture; match the attached reference images):
Mid-century modern editorial illustration in the style of 1950s-60s travel posters:
flat color shapes with a soft gouache and risograph grain texture, warm limited palette
of cream, navy blue, terracotta orange, mustard yellow, olive and sage green, dusty sky
blue and warm wood brown. Simple stylized people with small features, rosy cheeks and
neat hair, wearing tidy work clothes. Gentle daylight, soft shadows, calm cheerful mood.
Background details such as potted plants, round arched windows, a pale sun disc and
Mediterranean hills. Full-bleed square scene, one clear main action in the center.

RULES
- Size: 1024 x 1024 pixels, square, PNG, no transparency.
- Absolutely no text, letters, numbers, signs with words, logos or watermarks.
  If a scene mentions a document, screen or sign, show blank lines or simple icons.
- Keep the main action inside the middle 70% of the image; it will also be shown
  as a 192 x 192 thumbnail, so it must read at a small size.
- One clear idea per picture. No clutter, no frames, no borders.
- People: friendly adults of different backgrounds, workplace-appropriate, nothing scary.
- Not photorealistic, not 3D, no neon, no heavy black outlines.

FOR EACH ROW: use the "prompt" field (it already contains the style + scene),
avoid everything in "negative_prompt", and save the file with the exact "filename".
```

## 規格一覽

- **尺寸**：1024 × 1024 PNG，正方形，不透明背景。網站會縮成 512（大圖）和 192（縮圖）。
- **構圖**：主角放在畫面中間七成的範圍內，縮成小圖也看得懂。
- **禁止**：任何文字、字母、數字、商標、浮水印、邊框；寫實照片風、3D、霓虹色。
- **抽象字**：已改寫成具體情境，例如 postpone 畫成把月曆上的會議卡片往後移，surge 畫成海面突然湧起大浪。
- **數量**：各分數段 400／600／800／990 分別是 83／119／128／175 張。

## 注意

- **授權**：參考圖是 Word Atlas 的插畫（CC BY 4.0），只能當畫風參考，不能直接拿來改。新生成的圖能不能放上網站，要看你用的生圖服務的使用條款，一般付費方案都可以商用。
- **畫風一致**：每次對話最好都附上參考圖。換新對話或換服務時，先重畫一兩張舊的確認畫風沒跑掉。
- **畫面描述可以改**：覺得哪個畫面不好，直接改 `scene`，或告訴我，我幫你改。
