// === Accessibility Features for GAPURA EMAS (Full Page Voice Mode – Text Only) ===
document.addEventListener("DOMContentLoaded", function () {
  initAccessibilityFeatures();
});

function initAccessibilityFeatures() {
  const fabContainer = document.querySelector(".fab-container");
  if (!fabContainer) return;

  // Tambahkan markup FAB jika belum ada
  if (!fabContainer.querySelector(".fab-menu")) {
    fabContainer.innerHTML = `
      <button class="fab" aria-haspopup="true" aria-expanded="false" aria-label="Aksesibilitas">
        <i class="fas fa-universal-access"></i>
      </button>

      <div class="fab-menu" role="menu" aria-hidden="true">
        <h4>Aksesibilitas</h4>

        <div class="fab-item">
          <span>🔊 Mode Suara</span>
          <button id="voice-switch" class="fab-switch" role="switch" aria-checked="false">
            <span class="knob"></span>
          </button>
        </div>

        <div class="fab-item">
          <span>Ukuran Teks</span>
          <div class="fab-textsize-controls">
            <button id="decreaseText" class="text-size-btn" aria-label="Perkecil">
              <i class="fas fa-minus"></i>
            </button>
            <span id="textSizeLabel" class="text-size-label">Normal</span>
            <button id="increaseText" class="text-size-btn" aria-label="Perbesar">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>

        <div class="fab-item">
          <span>Pertebal Huruf</span>
          <button id="bold-switch" class="fab-switch" role="switch" aria-checked="false">
            <span class="knob"></span>
          </button>
        </div>
      </div>
    `;
  }

  const fabButton = fabContainer.querySelector(".fab");
  const fabMenu = fabContainer.querySelector(".fab-menu");
  const voiceSwitch = document.getElementById("voice-switch");
  const boldSwitch = document.getElementById("bold-switch");
  const decreaseText = document.getElementById("decreaseText");
  const increaseText = document.getElementById("increaseText");
  const textSizeLabel = document.getElementById("textSizeLabel");

  // === Helper: Speech ===
  const speak = (text, interrupt = true) => {
    if (!("speechSynthesis" in window)) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "id-ID";
      utterance.rate = 1;
      utterance.pitch = 1;
      if (interrupt) window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech error:", err);
    }
  };

  const setSwitch = (el, on) => {
    if (!el) return;
    el.classList.toggle("on", on);
    el.setAttribute("aria-checked", on ? "true" : "false");
  };

  // === Load Preferences ===
  const prefVoice = localStorage.getItem("pref_voice") === "true";
  const prefBold = localStorage.getItem("pref_bold") === "true";
  let currentFontSize = parseInt(localStorage.getItem("pref_font_size")) || 16;

  setSwitch(voiceSwitch, prefVoice);
  setSwitch(boldSwitch, prefBold);
  if (prefBold) document.body.classList.add("bold-mode");
  document.documentElement.style.fontSize = currentFontSize + "px";
  updateTextSizeLabel(currentFontSize);

  // === Toggle FAB Menu ===
  fabButton.addEventListener("click", (e) => {
    e.stopPropagation();
    const isActive = fabMenu.classList.toggle("active");
    fabMenu.setAttribute("aria-hidden", isActive ? "false" : "true");
    fabButton.setAttribute("aria-expanded", isActive ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!fabContainer.contains(e.target)) {
      fabMenu.classList.remove("active");
      fabMenu.setAttribute("aria-hidden", "true");
      fabButton.setAttribute("aria-expanded", "false");
    }
  });

  // === Voice Mode (Full Page, Text Only) ===
  let hoverListeners = [];
  let soundEnabled = prefVoice;

  function enableReadingMode() {
    disableReadingMode(); // Hindari duplikasi event listener

    // Seleksi elemen teks saja (tanpa gambar, ikon, atau dekorasi)
    const textElements = Array.from(
      document.querySelectorAll(
        "header *, main *, footer *, section *, article *, nav *, aside *, p, h1, h2, h3, h4, h5, h6, a, button, li, span, label, strong, em, div"
      )
    ).filter((el) => {
      const tag = el.tagName.toLowerCase();
      if (["img", "svg", "path", "hr", "canvas", "video", "audio", "i", "icon"].includes(tag)) return false;
      const text = el.innerText?.trim();
      return text && text.length > 0;
    });

    textElements.forEach((el) => {
      const onHover = () => {
        focusText(el);
        speak(el.innerText.trim());
      };
      const onClick = () => {
        focusText(el);
        speak(el.innerText.trim());
        navigator.vibrate?.(40);
      };

      el.addEventListener("mouseenter", onHover);
      el.addEventListener("click", onClick);
      hoverListeners.push({ el, onHover, onClick });
    });
  }

  function disableReadingMode() {
    hoverListeners.forEach(({ el, onHover, onClick }) => {
      el.removeEventListener("mouseenter", onHover);
      el.removeEventListener("click", onClick);
      el.classList.remove("reading-focus");
    });
    hoverListeners = [];
    window.speechSynthesis.cancel();
  }

  function focusText(element) {
    document.querySelectorAll(".reading-focus").forEach((el) => el.classList.remove("reading-focus"));
    element.classList.add("reading-focus");
    setTimeout(() => element.classList.remove("reading-focus"), 2000);
  }

  // === Voice Switch ===
  voiceSwitch.addEventListener("click", function () {
    const enabled = !this.classList.contains("on");
    setSwitch(this, enabled);
    localStorage.setItem("pref_voice", enabled);
    soundEnabled = enabled;

    if (enabled) {
      enableReadingMode();
      speak("Mode suara diaktifkan");
    } else {
      disableReadingMode();
      speak("Mode suara dimatikan");
    }
  });

  // === Text Size ===
  function updateTextSizeLabel(size) {
    let label = "Normal";
    if (size < 16) label = "Kecil";
    else if (size > 16 && size <= 18) label = "Besar";
    else if (size > 18 && size <= 20) label = "Lebih Besar";
    else if (size > 20) label = "Sangat Besar";
    textSizeLabel.textContent = label;
  }

  decreaseText.addEventListener("click", () => {
    if (currentFontSize > 12) {
      currentFontSize -= 2;
      document.documentElement.style.fontSize = currentFontSize + "px";
      localStorage.setItem("pref_font_size", currentFontSize);
      updateTextSizeLabel(currentFontSize);
      if (soundEnabled) speak(`Ukuran teks ${textSizeLabel.textContent}`);
    }
  });

  increaseText.addEventListener("click", () => {
    if (currentFontSize < 24) {
      currentFontSize += 2;
      document.documentElement.style.fontSize = currentFontSize + "px";
      localStorage.setItem("pref_font_size", currentFontSize);
      updateTextSizeLabel(currentFontSize);
      if (soundEnabled) speak(`Ukuran teks ${textSizeLabel.textContent}`);
    }
  });

  // === Bold Mode ===
  boldSwitch.addEventListener("click", function () {
    const enabled = !this.classList.contains("on");
    setSwitch(this, enabled);
    document.body.classList.toggle("bold-mode", enabled);
    localStorage.setItem("pref_bold", enabled);
    if (soundEnabled) speak(enabled ? "Huruf tebal diaktifkan" : "Huruf tebal dimatikan");
  });

  // Aktifkan kembali mode suara jika sebelumnya aktif
  if (prefVoice) enableReadingMode();
}
