(function () {
  'use strict';

  // ---------- Settings (edit these) ----------
  var QR_SIZE = 280;                // MOD 5: bigger code
  var DOWNLOAD_NAME = 'qr-code.png';
  var HISTORY_KEY = 'qr-history';   // FEATURE 3
  var MAX_HISTORY = 5;

  // ---------- Elements ----------
  var input = document.getElementById('input');
  var msg = document.getElementById('msg');
  var result = document.getElementById('result');
  var qrBox = document.getElementById('qr');
  var makeBtn = document.getElementById('make');
  var clearBtn = document.getElementById('clear');
  var downloadBtn = document.getElementById('download');
  var copyBtn = document.getElementById('copy');                 // FEATURE 2
  var fgInput = document.getElementById('fgColor');              // FEATURE 1
  var bgInput = document.getElementById('bgColor');              // FEATURE 1
  var historyBox = document.getElementById('historyBox');        // FEATURE 3
  var historyList = document.getElementById('history');          // FEATURE 3
  var clearHistoryBtn = document.getElementById('clearHistory'); // FEATURE 3

  // ---------- Helpers ----------
  function showError(text) {
    msg.textContent = text;
    result.hidden = true;
  }

  function reset() {
    msg.textContent = '';
    qrBox.innerHTML = '';
  }

  function flash(btn, text) {
    var old = btn.textContent;
    btn.textContent = text;
    setTimeout(function () { btn.textContent = old; }, 1500);
  }

  // MOD 4: add https:// to things like "example.com"
  function normalizeLink(text) {
    var looksLikeDomain = /^(?![a-z][a-z0-9+.-]*:)(?:[a-z0-9-]+\.)+[a-z]{2,}(?:[\/?#]\S*)?$/i;
    return looksLikeDomain.test(text) ? 'https://' + text : text;
  }

  // ---------- History (FEATURE 3) ----------
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveHistory(list) {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); }
    catch (e) { /* storage unavailable: ignore */ }
  }

  function renderHistory() {
    var list = loadHistory();
    historyBox.hidden = list.length === 0;
    historyList.innerHTML = '';
    list.forEach(function (text) {
      var li = document.createElement('li');
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
      btn.title = text;
      btn.addEventListener('click', function () {
        input.value = text;
        generate(false);
      });
      li.appendChild(btn);
      historyList.appendChild(li);
    });
  }

  function addHistory(text) {
    var list = loadHistory().filter(function (t) { return t !== text; });
    list.unshift(text);
    saveHistory(list.slice(0, MAX_HISTORY));
    renderHistory();
  }

  // ---------- Actions ----------
  // shouldSave = true only when the person clicks the button (not while typing)
  function generate(shouldSave) {
    var text = normalizeLink(input.value.trim());
    reset();

    if (!text) {
      showError('Enter a link or some text first.');
      return;
    }
    if (typeof QRCode === 'undefined') {
      showError('The QR library did not load. Check your connection and reload.');
      return;
    }

    try {
      new QRCode(qrBox, {
        text: text,
        width: QR_SIZE,
        height: QR_SIZE,
        colorDark: fgInput.value,    // FEATURE 1
        colorLight: bgInput.value,   // FEATURE 1
        correctLevel: QRCode.CorrectLevel.M
      });
      qrBox.style.background = bgInput.value;
      result.hidden = false;
      if (shouldSave) addHistory(text);
    } catch (err) {
      console.error(err);
      if (/overflow/i.test(String(err && err.message))) {
        showError('That text is too long for a QR code. Shorten it and try again.');
      } else {
        showError('Something went wrong. Open the browser console (F12) to see the error.');
      }
    }
  }

  function clearAll() {
    input.value = '';
    reset();
    result.hidden = true;
    input.focus();
  }

  function download() {
    var canvas = qrBox.querySelector('canvas');
    if (!canvas) return;
    var a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = DOWNLOAD_NAME;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // FEATURE 2
  function copyImage() {
    var canvas = qrBox.querySelector('canvas');
    if (!canvas) return;
    if (!navigator.clipboard || !window.ClipboardItem) {
      msg.textContent = 'Copying images is not supported here. Use Download instead.';
      return;
    }
    canvas.toBlob(function (blob) {
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        .then(function () { flash(copyBtn, 'Copied!'); })
        .catch(function () {
          msg.textContent = 'Could not copy the image. Use Download instead.';
        });
    }, 'image/png');
  }

  // ---------- Events ----------
  makeBtn.addEventListener('click', function () { generate(true); });
  clearBtn.addEventListener('click', clearAll);
  downloadBtn.addEventListener('click', download);
  copyBtn.addEventListener('click', copyImage);

  clearHistoryBtn.addEventListener('click', function () {
    saveHistory([]);
    renderHistory();
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) generate(true);
  });

  // FEATURE 1: redraw when a color changes
  [fgInput, bgInput].forEach(function (picker) {
    picker.addEventListener('input', function () {
      if (!result.hidden) generate(false);
    });
  });

  // Show saved history on page load
  renderHistory();
})();
