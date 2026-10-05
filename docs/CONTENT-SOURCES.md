# Historical source review

The notes below document the earlier manual-featured-card iteration. Those cards and local case assets have now been removed from the current source and v3. Current cards use only the RSS JSON thumbnail, original title and date; no manually selected or rewritten content is displayed.

# Landing content sources

Reviewed in headless Chrome (installed Chromium build 1243), using the actual mobile Naver blog pages, on 2026-10-01 Asia/Seoul. The attached RSS snapshot contains 50 entries; the first 12 populate the existing latest-feed cache. Scheduled RSS collection remains unchanged. Featured cases are separate, so rotating RSS data does not delete the reviewed examples.

| Source | Content used | Local image |
|---|---|---|
| https://blog.naver.com/ablymotors/224412185380 | MINI Countryman steering/body vibration; engine/transmission mount inspection and replacement. No promise of identical results for other vehicles. | countryman-mounts.jpg: original and replacement mounts, image filename 900_20260914_101239.jpg |
| https://blog.naver.com/ablymotors/224377360086 | Mercedes S400 W222 noise over bumps; upper-arm inspection/replacement. | s400-upper-arms.jpg: replacement upper arms, 900_20260813_112001.jpg |
| https://blog.naver.com/ablymotors/224400745981 | Grand Carnival engine warning and DPF inspection/cleaning explanation. Body is largely explanatory, so card explicitly calls it a guide, not a measured successful repair. | carnival-dpf.jpg: engine bay, 900_20260824_093822.jpg |
| https://blog.naver.com/ablymotors/224428115892 | MINI Clubman engine/transmission/differential oil and coolant service. Checked against RSS; latest list now displays the original RSS title. | None |

Original image URLs, retrieved from each post's actual image elements:

- `countryman-mounts.jpg`: https://mblogthumb-phinf.pstatic.net/MjAyNjA5MTRfNTAg/MDAxNzg5Mzg3NTE5NTQ1.RYhAzV82WMswAkavUqoGo0yuqxL-QeKu83roiwlZbtkg.VqMiLpJXDEIrycksg1jExSz9zmJei00S36sHhPzvhxMg.JPEG/900_20260914_101239.jpg?type=w800

- `s400-upper-arms.jpg`: https://mblogthumb-phinf.pstatic.net/MjAyNjA4MTNfOTkg/MDAxNzg2NTkyODY0NDQ5.VUn6rbiyy3hXaE41E7eGVfoxsaAwv3Q0EKzGzwUPt9Ug.LbaOVhCJcjycnZ1ti96dclqbvEpuRcB-SMCQ9gJCBjwg.JPEG/900_20260813_112001.jpg?type=w800

- `carnival-dpf.jpg`: https://mblogthumb-phinf.pstatic.net/MjAyNjA4MjVfNDYg/MDAxNzg3NjI2NTIwMDgx.4bOIk9X0DNcCg-zm2Pi3aezxjDfPywCEEYeePffMyxMg.n0B93blORwLNx7GndSG07MClfC_ZtfFX28UKExfV94Mg.JPEG/900_20260824_093822.jpg?type=w800

The images were visually checked together and copied without removing overlays or manufacturing content. Existing workshop photos and logo remain from the repository. Dates come from the supplied RSS, not inferred from image filenames. `src/data/repairCases.js` contains manually reviewed presentation only; original blog links and RSS titles remain intact. Only the four posts above were inspected in Chrome. All latest-feed titles now render verbatim from JSON; the previous manual title overrides were removed to keep existing and future posts consistent with scheduled RSS updates.

`public/assets/images/hero.webp` is an optimized derivative of the existing `6.jpg` storefront photo (1920px maximum width, Chrome canvas WebP quality 0.84; approximately 191 KiB versus 1.5 MiB). No generated imagery was used.
