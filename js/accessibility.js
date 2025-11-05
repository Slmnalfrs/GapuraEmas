// Accessibility features for GAPURA EMAS
document.addEventListener("DOMContentLoaded", function () {
    initAccessibilityFeatures();
});

function initAccessibilityFeatures() {
    const fabContainer = document.querySelector('.fab-container');
    if (!fabContainer) return;

    // Add FAB menu markup if not present
    if (!fabContainer.querySelector('.fab-menu')) {
        fabContainer.innerHTML = `
            <button class="fab" aria-haspopup="true" aria-expanded="false" aria-label="Aksesibilitas">
                <i class="fas fa-universal-access"></i>
            </button>

            <div class="fab-menu" role="menu" aria-hidden="true">
                <h4>Aksesibilitas</h4>

                <div class="fab-item" role="menuitem">
                    <span>Mode Suara</span>
                    <button id="voice-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0">
                        <span class="knob"></span>
                    </button>
                </div>

                <div class="fab-item" role="menuitem">
                    <span>Ukuran Teks</span>
                    <div class="fab-textsize-controls" role="group" aria-label="Kontrol Ukuran Teks">
                        <button id="decreaseText" class="text-size-btn" title="Perkecil Teks" aria-label="Perkecil">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span id="textSizeLabel" aria-live="polite" class="text-size-label">Normal</span>
                        <button id="increaseText" class="text-size-btn" title="Perbesar Teks" aria-label="Perbesar">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div class="fab-item" role="menuitem">
                    <span>Pertebal Huruf</span>
                    <button id="bold-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0">
                        <span class="knob"></span>
                    </button>
                </div>
            </div>
        `;
    }

    const fabButton = fabContainer.querySelector('.fab');
    const fabMenu = fabContainer.querySelector('.fab-menu');
    const voiceSwitch = document.getElementById('voice-switch');
    const boldSwitch = document.getElementById('bold-switch');
    const decreaseText = document.getElementById('decreaseText');
    const increaseText = document.getElementById('increaseText');
    const textSizeLabel = document.getElementById('textSizeLabel');

    // Speech synthesis helper
    const speak = (text, interrupt = true) => {
        if (!('speechSynthesis' in window)) return;
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'id-ID';
            if (interrupt) window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.warn('Speech error:', err);
        }
    };

    // Helper function for switches
    const setSwitch = (el, on) => {
        if (!el) return;
        if (on) {
            el.classList.add('on');
            el.setAttribute('aria-checked', 'true');
        } else {
            el.classList.remove('on');
            el.setAttribute('aria-checked', 'false');
        }
    };

    // Load preferences
    const prefVoice = localStorage.getItem('pref_voice') === 'true';
    const prefBold = localStorage.getItem('pref_bold') === 'true';
    let currentFontSize = parseInt(localStorage.getItem('pref_font_size')) || 16;

    // Initialize states
    setSwitch(voiceSwitch, prefVoice);
    setSwitch(boldSwitch, prefBold);
    if (prefBold) document.body.classList.add('bold-mode');
    document.documentElement.style.fontSize = currentFontSize + 'px';
    updateTextSizeLabel(currentFontSize);

    // Toggle FAB menu
    if (fabButton && fabMenu) {
        fabButton.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = fabMenu.classList.toggle('active');
            fabMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            fabButton.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!fabContainer.contains(e.target)) {
                fabMenu.classList.remove('active');
                fabMenu.setAttribute('aria-hidden', 'true');
                fabButton.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Voice mode
    if (voiceSwitch) {
        voiceSwitch.addEventListener('click', function() {
            const enabled = !this.classList.contains('on');
            setSwitch(this, enabled);
            localStorage.setItem('pref_voice', enabled);
            
            if (enabled) {
                speak('Mode suara diaktifkan');
            } else {
                speak('Mode suara dinonaktifkan');
            }
        });
    }

    // Text size controls
    function updateTextSizeLabel(size) {
        if (textSizeLabel) {
            let label = 'Normal';
            if (size < 16) label = 'Kecil';
            else if (size > 16 && size <= 18) label = 'Besar';
            else if (size > 18 && size <= 20) label = 'Lebih Besar';
            else if (size > 20) label = 'Sangat Besar';
            textSizeLabel.textContent = label;
        }
    }

    if (decreaseText) {
        decreaseText.addEventListener('click', function() {
            if (currentFontSize > 12) {  // Minimum size
                currentFontSize -= 2;
                document.documentElement.style.fontSize = currentFontSize + 'px';
                localStorage.setItem('pref_font_size', currentFontSize);
                updateTextSizeLabel(currentFontSize);
                if (voiceSwitch && voiceSwitch.classList.contains('on')) {
                    speak(`Ukuran teks: ${textSizeLabel.textContent}`);
                }
            }
        });
    }

    if (increaseText) {
        increaseText.addEventListener('click', function() {
            if (currentFontSize < 24) {  // Maximum size
                currentFontSize += 2;
                document.documentElement.style.fontSize = currentFontSize + 'px';
                localStorage.setItem('pref_font_size', currentFontSize);
                updateTextSizeLabel(currentFontSize);
                if (voiceSwitch && voiceSwitch.classList.contains('on')) {
                    speak(`Ukuran teks: ${textSizeLabel.textContent}`);
                }
            }
        });
    }

    // Bold text toggle
    if (boldSwitch) {
        boldSwitch.addEventListener('click', function() {
            const enabled = !this.classList.contains('on');
            setSwitch(this, enabled);
            document.body.classList.toggle('bold-mode', enabled);
            localStorage.setItem('pref_bold', enabled);
            if (voiceSwitch && voiceSwitch.classList.contains('on')) {
                speak(enabled ? 'Huruf tebal diaktifkan' : 'Huruf tebal dinonaktifkan');
            }
        });
    }
}