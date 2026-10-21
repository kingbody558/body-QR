# QR Code Maker

Paste a link or text, click **Generate QR code**, then download the PNG.

## Structure
```
qr-code-maker/
├── index.html      page structure
├── css/style.css   styles (colors are variables at the top)
└── js/script.js    logic (size and colors are settings at the top)
```

## Run it
Open `index.html` in a browser. No build step needed.

## Notes
- The QR library loads from a CDN (cdnjs). For offline use, download
  `qrcode.min.js` into a `js/` folder and change the `<script src>` in `index.html`.
