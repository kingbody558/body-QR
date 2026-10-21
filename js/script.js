(function () {
  'use strict';

  // ---------- Settings (edit these) ----------
  var QR_SIZE = 240;                 // pixels
  var DARK_COLOR = '#000000';
  var LIGHT_COLOR = '#ffffff';
  var DOWNLOAD_NAME = 'qr-code.png';
  var LIVE_DELAY = 400;
  // ---------- Elements ----------
  var input = document.getElementById('input');
  var msg = document.getElementById('msg');
  var result = document.getElementById('result');
  var qrBox = document.getElementById('qr');
  var makeBtn = document.getElementById('make');
  var clearBtn = document.getElementById('clear');
  var downloadBtn = document.getElementById('download');
  var LIVE_DELAY = 400;
  // ---------- Helpers ----------
  function showError(text) {
    msg.textContent = text;
    result.hidden = true;
  }

  function reset() {
    msg.textContent = '';
    qrBox.innerHTML = '';
  }

  // ---------- Actions ----------
  function generate() {
    var text = input.value.trim();
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
        colorDark: DARK_COLOR,
        colorLight: LIGHT_COLOR,
        correctLevel: QRCode.CorrectLevel.M
      });
      result.hidden = false;
    } catch (err) {
      showError('That text is too long for a QR code. Shorten it and try again.');
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

  // ---------- Events ----------
  makeBtn.addEventListener('click', generate);
  clearBtn.addEventListener('click', clearAll);
  downloadBtn.addEventListener('click', download);
 input.addEventListener('input', function () {
  clearTimeout(liveTimer);
  if (!input.value.trim()) {
    reset();
    result.hidden = true;
    return;
  }
  liveTimer = setTimeout(function () { generate(false); }, LIVE_DELAY);
});
