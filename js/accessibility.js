// Enhanced Accessibility System for GAPURA EMAS
// Version 2.0 - Streamlined Edition

document.addEventListener("DOMContentLoaded", function () {
  initAccessibilityFeatures();
  initSmartVoiceReader();
  initKeyboardNavigation();
});

function initAccessibilityFeatures() {
  const fabContainer = document.querySelector(".fab-container");
  if (!fabContainer) return;

  // Add enhanced FAB menu markup
  if (!fabContainer.querySelector(".fab-menu")) {
    fabContainer.innerHTML = `
            <button class="fab" aria-haspopup="true" aria-expanded="false" aria-label="Menu Aksesibilitas">
                <i class="fas fa-universal-access main-icon" aria-hidden="true"></i>
                <span class="fab-close-icon" aria-hidden="true">
                    <i class="fas fa-times"></i>
                </span>
            </button>

            <div class="fab-menu" role="menu" aria-hidden="true">
                <div class="fab-menu-header">
                    <h4><i class="fas fa-universal-access"></i> Aksesibilitas</h4>
                    <button class="reset-btn" id="resetAll" title="Reset Semua Pengaturan">
                        <i class="fas fa-undo"></i>
                    </button>
                </div>

                <!-- Voice Mode -->
                <div class="fab-item" role="menuitem" data-feature="voice">
                    <div class="fab-item-label">
                        <i class="fas fa-volume-up"></i>
                        <span>Mode Suara</span>
                    </div>
                    <button id="voice-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle Mode Suara">
                        <span class="knob"></span>
                    </button>
                </div>

                <!-- Text Size -->
                <div class="fab-item" role="menuitem" data-feature="textsize">
                    <div class="fab-item-label">
                        <i class="fas fa-text-height"></i>
                        <span>Ukuran Teks</span>
                    </div>
                    <div class="fab-textsize-controls" role="group" aria-label="Kontrol Ukuran Teks">
                        <button id="decreaseText" class="text-size-btn" title="Perkecil Teks" aria-label="Perkecil Teks">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span id="textSizeLabel" aria-live="polite" class="text-size-label">100%</span>
                        <button id="increaseText" class="text-size-btn" title="Perbesar Teks" aria-label="Perbesar Teks">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- Bold Text -->
                <div class="fab-item" role="menuitem" data-feature="bold">
                    <div class="fab-item-label">
                        <i class="fas fa-bold"></i>
                        <span>Pertebal Huruf</span>
                    </div>
                    <button id="bold-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle Pertebal Huruf">
                        <span class="knob"></span>
                    </button>
                </div>

                <!-- Letter Spacing -->
                <div class="fab-item" role="menuitem" data-feature="letterspacing">
                    <div class="fab-item-label">
                        <i class="fas fa-text-width"></i>
                        <span>Jarak Huruf</span>
                    </div>
                    <div class="fab-textsize-controls" role="group" aria-label="Kontrol Jarak Huruf">
                        <button id="decreaseLetterSpacing" class="text-size-btn" title="Kurangi Jarak" aria-label="Kurangi Jarak Huruf">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span id="letterSpacingLabel" aria-live="polite" class="text-size-label">Normal</span>
                        <button id="increaseLetterSpacing" class="text-size-btn" title="Tambah Jarak" aria-label="Tambah Jarak Huruf">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <!-- Dyslexia Friendly Font -->
                <div class="fab-item" role="menuitem" data-feature="dyslexia">
                    <div class="fab-item-label">
                        <i class="fas fa-font"></i>
                        <span>Font Disleksia</span>
                    </div>
                    <button id="dyslexia-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle Font Disleksia">
                        <span class="knob"></span>
                    </button>
                </div>


            </div>
        `;
  }

  // Initialize all controls
  const fabButton = fabContainer.querySelector(".fab");
  const fabMenu = fabContainer.querySelector(".fab-menu");
  const voiceSwitch = document.getElementById("voice-switch");
  const boldSwitch = document.getElementById("bold-switch");
  const dyslexiaSwitch = document.getElementById("dyslexia-switch");
  const resetBtn = document.getElementById("resetAll");

  // Speech synthesis helper
  const speak = (text, interrupt = true) => {
    if (!("speechSynthesis" in window)) return;

    try {
      if (interrupt) {
        window.speechSynthesis.cancel();
      }

      const cleanText = text.replace(/\s+/g, " ").trim();
      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "id-ID";
      utterance.rate = 1.0;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("Speech error:", err);
    }
  };

  // Helper function for switches
  const setSwitch = (el, on) => {
    if (!el) return;
    if (on) {
      el.classList.add("on");
      el.setAttribute("aria-checked", "true");
    } else {
      el.classList.remove("on");
      el.setAttribute("aria-checked", "false");
    }
  };

  // Load all preferences
  const prefs = {
    voice: localStorage.getItem("pref_voice") === "true",
    bold: localStorage.getItem("pref_bold") === "true",
    dyslexia: localStorage.getItem("pref_dyslexia") === "true",
    fontSize: parseInt(localStorage.getItem("pref_font_size")) || 16,
    letterSpacing: parseFloat(localStorage.getItem("pref_letter_spacing")) || 0,
  };

  // Initialize all states
  setSwitch(voiceSwitch, prefs.voice);
  setSwitch(boldSwitch, prefs.bold);
  setSwitch(dyslexiaSwitch, prefs.dyslexia);

  if (prefs.bold) document.body.classList.add("bold-mode");
  if (prefs.dyslexia) document.body.classList.add("dyslexia-font");

  document.documentElement.style.fontSize = prefs.fontSize + "px";
  document.body.style.letterSpacing = prefs.letterSpacing + "px";

  updateTextSizeLabel(prefs.fontSize);
  updateLetterSpacingLabel(prefs.letterSpacing);

  // FAB Menu Toggle
  if (fabButton && fabMenu) {
    fabButton.addEventListener("click", function (e) {
      e.stopPropagation();
      const isActive = fabMenu.classList.toggle("active");
      fabMenu.setAttribute("aria-hidden", isActive ? "false" : "true");
      fabButton.setAttribute("aria-expanded", isActive ? "true" : "false");

      if (isActive && prefs.voice) {
        speak("Menu aksesibilitas dibuka");
      }
    });

    document.addEventListener("click", function (e) {
      if (
        !fabContainer.contains(e.target) &&
        fabMenu.classList.contains("active")
      ) {
        fabMenu.classList.remove("active");
        fabMenu.setAttribute("aria-hidden", "true");
        fabButton.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Voice Mode Toggle
  if (voiceSwitch) {
    voiceSwitch.addEventListener("click", function () {
      const enabled = !this.classList.contains("on");
      setSwitch(this, enabled);
      localStorage.setItem("pref_voice", enabled);
      prefs.voice = enabled;

      if (enabled) {
        speak(
          "Mode suara diaktifkan. Arahkan kursor ke teks untuk mendengarkan pembacaan."
        );
        enableSmartVoiceReading();
      } else {
        speak("Mode suara dinonaktifkan");
        disableSmartVoiceReading();
      }
    });
  }

  // Text Size Controls
  let currentFontSize = prefs.fontSize;

  function updateTextSizeLabel(size) {
    const label = document.getElementById("textSizeLabel");
    if (label) {
      const percentage = Math.round((size / 16) * 100);
      label.textContent = percentage + "%";
    }
  }

  document
    .getElementById("decreaseText")
    ?.addEventListener("click", function () {
      if (currentFontSize > 12) {
        currentFontSize -= 2;
        document.documentElement.style.fontSize = currentFontSize + "px";
        localStorage.setItem("pref_font_size", currentFontSize);
        updateTextSizeLabel(currentFontSize);

        if (prefs.voice) {
          speak(
            `Ukuran teks ${Math.round((currentFontSize / 16) * 100)} persen`
          );
        }
      }
    });

  document
    .getElementById("increaseText")
    ?.addEventListener("click", function () {
      if (currentFontSize < 24) {
        currentFontSize += 2;
        document.documentElement.style.fontSize = currentFontSize + "px";
        localStorage.setItem("pref_font_size", currentFontSize);
        updateTextSizeLabel(currentFontSize);

        if (prefs.voice) {
          speak(
            `Ukuran teks ${Math.round((currentFontSize / 16) * 100)} persen`
          );
        }
      }
    });

  // Letter Spacing Controls
  let currentLetterSpacing = prefs.letterSpacing;

  function updateLetterSpacingLabel(spacing) {
    const label = document.getElementById("letterSpacingLabel");
    if (label) {
      if (spacing <= 0) label.textContent = "Normal";
      else if (spacing <= 1) label.textContent = "Sedang";
      else if (spacing <= 2) label.textContent = "Lebar";
      else label.textContent = "Sangat Lebar";
    }
  }

  document
    .getElementById("decreaseLetterSpacing")
    ?.addEventListener("click", function () {
      if (currentLetterSpacing > 0) {
        currentLetterSpacing -= 0.5;
        document.body.style.letterSpacing = currentLetterSpacing + "px";
        localStorage.setItem("pref_letter_spacing", currentLetterSpacing);
        updateLetterSpacingLabel(currentLetterSpacing);

        if (prefs.voice) speak("Jarak huruf dikurangi");
      }
    });

  document
    .getElementById("increaseLetterSpacing")
    ?.addEventListener("click", function () {
      if (currentLetterSpacing < 3) {
        currentLetterSpacing += 0.5;
        document.body.style.letterSpacing = currentLetterSpacing + "px";
        localStorage.setItem("pref_letter_spacing", currentLetterSpacing);
        updateLetterSpacingLabel(currentLetterSpacing);

        if (prefs.voice) speak("Jarak huruf ditambah");
      }
    });

  // Bold Text Toggle
  boldSwitch?.addEventListener("click", function () {
    const enabled = !this.classList.contains("on");
    setSwitch(this, enabled);
    document.body.classList.toggle("bold-mode", enabled);
    localStorage.setItem("pref_bold", enabled);

    if (prefs.voice) {
      speak(enabled ? "Huruf tebal diaktifkan" : "Huruf tebal dinonaktifkan");
    }
  });

  // Dyslexia Font Toggle
  dyslexiaSwitch?.addEventListener("click", function () {
    const enabled = !this.classList.contains("on");
    setSwitch(this, enabled);
    document.body.classList.toggle("dyslexia-font", enabled);
    localStorage.setItem("pref_dyslexia", enabled);

    if (prefs.voice) {
      speak(
        enabled ? "Font disleksia diaktifkan" : "Font disleksia dinonaktifkan"
      );
    }
  });

  // Reset All Settings
  resetBtn?.addEventListener("click", function () {
    if (confirm("Reset semua pengaturan aksesibilitas?")) {
      localStorage.removeItem("pref_voice");
      localStorage.removeItem("pref_bold");
      localStorage.removeItem("pref_dyslexia");
      localStorage.removeItem("pref_font_size");
      localStorage.removeItem("pref_letter_spacing");

      location.reload();
    }
  });

  // Initialize voice reading if enabled
  if (prefs.voice) {
    setTimeout(() => enableSmartVoiceReading(), 500);
  }
}

// Smart Voice Reader Implementation
function initSmartVoiceReader() {
  window.smartVoiceReader = {
    isEnabled: false,
    currentElement: null,
    hoverTimeout: null,
    readDelay: 500,
  };
}

function enableSmartVoiceReading() {
  if (!window.smartVoiceReader) return;
  window.smartVoiceReader.isEnabled = true;

  const readableElements = getReadableElements();
  readableElements.forEach((element) => {
    element.addEventListener("mouseenter", handleElementHover);
    element.addEventListener("mouseleave", handleElementLeave);
  });

  document.body.setAttribute("data-voice-reader", "enabled");
}

function disableSmartVoiceReading() {
  if (!window.smartVoiceReader) return;
  window.smartVoiceReader.isEnabled = false;

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }

  const readableElements = getReadableElements();
  readableElements.forEach((element) => {
    element.removeEventListener("mouseenter", handleElementHover);
    element.removeEventListener("mouseleave", handleElementLeave);
  });

  if (window.smartVoiceReader.hoverTimeout) {
    clearTimeout(window.smartVoiceReader.hoverTimeout);
  }

  document.body.removeAttribute("data-voice-reader");
}

function getReadableElements() {
  const selectors = [
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "a",
    "button",
    "li",
    "td",
    "th",
    "span",
    "label",
    "legend",
    ".card-title",
    ".card-text",
    ".text-content",
    '[role="heading"]',
    '[role="article"]',
  ];

  const elements = document.querySelectorAll(selectors.join(", "));

  return Array.from(elements).filter((el) => {
    if (el.closest(".fab-menu, .fab-container")) return false;
    const text = getCleanText(el);
    if (!text || text.length < 2) return false;
    if (el.offsetParent === null) return false;
    return true;
  });
}

function handleElementHover(event) {
  if (!window.smartVoiceReader.isEnabled) return;

  const element = event.currentTarget;
  element.classList.add("voice-readable-element");

  if (window.smartVoiceReader.hoverTimeout) {
    clearTimeout(window.smartVoiceReader.hoverTimeout);
  }

  window.smartVoiceReader.hoverTimeout = setTimeout(() => {
    window.smartVoiceReader.currentElement = element;
    readElementText(element);
  }, window.smartVoiceReader.readDelay);
}

function handleElementLeave(event) {
  const element = event.currentTarget;
  element.classList.remove("voice-readable-element");

  if (window.smartVoiceReader.hoverTimeout) {
    clearTimeout(window.smartVoiceReader.hoverTimeout);
  }
}

function readElementText(element) {
  if (!("speechSynthesis" in window)) return;

  const text = getCleanText(element);
  if (!text) return;

  window.speechSynthesis.cancel();

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    utterance.rate = 1.0;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Error reading text:", err);
  }
}

function getCleanText(element) {
  const clone = element.cloneNode(true);

  const excludedTags = clone.querySelectorAll(
    "script, style, svg, img, canvas, video, audio, iframe"
  );
  excludedTags.forEach((tag) => tag.remove());

  const icons = clone.querySelectorAll(
    '.fa, .fas, .far, .fab, .fal, [class*="icon-"]'
  );
  icons.forEach((icon) => icon.remove());

  let text = clone.textContent || "";

  text = text
    .replace(/\s+/g, " ")
    .replace(/[\n\r\t]/g, " ")
    .trim()
    .replace(/^[•\-\*\>\#]+\s*/g, "")
    .replace(/^\d+\.\s*/g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/\{.*?\}/g, "");

  return text;
}

// Enhanced Keyboard Navigation
function initKeyboardNavigation() {
  document.addEventListener("keydown", function (e) {
    // Alt + A: Toggle menu
    if (e.altKey && e.key.toLowerCase() === "a") {
      e.preventDefault();
      document.querySelector(".fab")?.click();
    }

    // Alt + V: Toggle voice mode
    if (e.altKey && e.key.toLowerCase() === "v") {
      e.preventDefault();
      document.getElementById("voice-switch")?.click();
    }

    // Alt + +: Increase text size
    if (e.altKey && (e.key === "+" || e.key === "=")) {
      e.preventDefault();
      document.getElementById("increaseText")?.click();
    }

    // Alt + -: Decrease text size
    if (e.altKey && e.key === "-") {
      e.preventDefault();
      document.getElementById("decreaseText")?.click();
    }

    // Escape: Close menu
    if (e.key === "Escape") {
      const fabMenu = document.querySelector(".fab-menu");
      if (fabMenu?.classList.contains("active")) {
        fabMenu.classList.remove("active");
        fabMenu.setAttribute("aria-hidden", "true");
        document.querySelector(".fab")?.setAttribute("aria-expanded", "false");
        document.querySelector(".fab")?.focus();
      }
    }
  });
}
