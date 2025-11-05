// Accessibility features for GAPURA EMAS - Enhanced Version
document.addEventListener("DOMContentLoaded", function () {
    initAccessibilityFeatures();
    initSmartVoiceReader();
});

function initAccessibilityFeatures() {
    const fabContainer = document.querySelector('.fab-container');
    if (!fabContainer) return;

    // Add FAB menu markup if not present
    if (!fabContainer.querySelector('.fab-menu')) {
        fabContainer.innerHTML = `
            <button class="fab" aria-haspopup="true" aria-expanded="false" aria-label="Menu Aksesibilitas">
                <i class="fas fa-universal-access"></i>
            </button>

            <div class="fab-menu" role="menu" aria-hidden="true">
                <h4>Aksesibilitas</h4>

                <div class="fab-item" role="menuitem">
                    <span>Mode Suara</span>
                    <button id="voice-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle Mode Suara">
                        <span class="knob"></span>
                    </button>
                </div>

                <div class="fab-item" role="menuitem">
                    <span>Ukuran Teks</span>
                    <div class="fab-textsize-controls" role="group" aria-label="Kontrol Ukuran Teks">
                        <button id="decreaseText" class="text-size-btn" title="Perkecil Teks" aria-label="Perkecil Teks">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span id="textSizeLabel" aria-live="polite" class="text-size-label">Normal</span>
                        <button id="increaseText" class="text-size-btn" title="Perbesar Teks" aria-label="Perbesar Teks">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>

                <div class="fab-item" role="menuitem">
                    <span>Pertebal Huruf</span>
                    <button id="bold-switch" class="fab-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle Pertebal Huruf">
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

    // Speech synthesis helper - Enhanced with moderate speed
    const speak = (text, interrupt = true) => {
        if (!('speechSynthesis' in window)) {
            console.warn('Speech Synthesis tidak didukung di browser ini');
            return;
        }
        
        try {
            if (interrupt) {
                window.speechSynthesis.cancel();
            }
            
            // Clean text from unnecessary characters
            const cleanText = text.replace(/\s+/g, ' ').trim();
            if (!cleanText) return;
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            utterance.lang = 'id-ID';
            utterance.rate = 1.0; // Normal speed with slight boost
            utterance.pitch = 1;
            utterance.volume = 1;
            
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

    // Update button states based on font size
    updateButtonStates();

    // Toggle FAB menu with animation
    if (fabButton && fabMenu) {
        fabButton.addEventListener('click', function (e) {
            e.stopPropagation();
            const isActive = fabMenu.classList.toggle('active');
            fabMenu.setAttribute('aria-hidden', isActive ? 'false' : 'true');
            fabButton.setAttribute('aria-expanded', isActive ? 'true' : 'false');
            
            if (isActive && voiceSwitch.classList.contains('on')) {
                speak('Menu aksesibilitas dibuka');
            }
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (!fabContainer.contains(e.target) && fabMenu.classList.contains('active')) {
                fabMenu.classList.remove('active');
                fabMenu.setAttribute('aria-hidden', 'true');
                fabButton.setAttribute('aria-expanded', 'false');
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && fabMenu.classList.contains('active')) {
                fabMenu.classList.remove('active');
                fabMenu.setAttribute('aria-hidden', 'true');
                fabButton.setAttribute('aria-expanded', 'false');
                fabButton.focus();
            }
        });
    }

    // Voice mode toggle
    if (voiceSwitch) {
        voiceSwitch.addEventListener('click', function() {
            const enabled = !this.classList.contains('on');
            setSwitch(this, enabled);
            localStorage.setItem('pref_voice', enabled);
            
            if (enabled) {
                speak('Mode suara diaktifkan. Arahkan kursor ke teks untuk mendengarkan pembacaan.');
                enableSmartVoiceReading();
            } else {
                speak('Mode suara dinonaktifkan');
                disableSmartVoiceReading();
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

    function updateButtonStates() {
        if (decreaseText) {
            decreaseText.disabled = currentFontSize <= 12;
        }
        if (increaseText) {
            increaseText.disabled = currentFontSize >= 24;
        }
    }

    if (decreaseText) {
        decreaseText.addEventListener('click', function() {
            if (currentFontSize > 12) {  // Minimum size
                currentFontSize -= 2;
                document.documentElement.style.fontSize = currentFontSize + 'px';
                localStorage.setItem('pref_font_size', currentFontSize);
                updateTextSizeLabel(currentFontSize);
                updateButtonStates();
                
                if (voiceSwitch && voiceSwitch.classList.contains('on')) {
                    speak(`Ukuran teks ${textSizeLabel.textContent}`);
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
                updateButtonStates();
                
                if (voiceSwitch && voiceSwitch.classList.contains('on')) {
                    speak(`Ukuran teks ${textSizeLabel.textContent}`);
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

    // Initialize voice reading if enabled
    if (prefVoice) {
        setTimeout(() => enableSmartVoiceReading(), 500);
    }
}

// Smart Voice Reader - Only reads text content
function initSmartVoiceReader() {
    window.smartVoiceReader = {
        isEnabled: false,
        currentElement: null,
        hoverTimeout: null,
        readDelay: 600, // Reduced delay for faster response
    };
}

function enableSmartVoiceReading() {
    if (!window.smartVoiceReader) return;
    
    window.smartVoiceReader.isEnabled = true;
    
    // Add hover listeners to all readable elements
    const readableElements = getReadableElements();
    
    readableElements.forEach(element => {
        element.addEventListener('mouseenter', handleElementHover);
        element.addEventListener('mouseleave', handleElementLeave);
    });
    
    // Mark as initialized
    document.body.setAttribute('data-voice-reader', 'enabled');
}

function disableSmartVoiceReading() {
    if (!window.smartVoiceReader) return;
    
    window.smartVoiceReader.isEnabled = false;
    
    // Stop any ongoing speech
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    // Remove hover listeners
    const readableElements = getReadableElements();
    readableElements.forEach(element => {
        element.removeEventListener('mouseenter', handleElementHover);
        element.removeEventListener('mouseleave', handleElementLeave);
    });
    
    // Clear timeout if any
    if (window.smartVoiceReader.hoverTimeout) {
        clearTimeout(window.smartVoiceReader.hoverTimeout);
    }
    
    document.body.removeAttribute('data-voice-reader');
}

function getReadableElements() {
    // Select only text-containing elements, excluding visual elements
    const selectors = [
        'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'a', 'button', 'li', 'td', 'th',
        'span', 'label', 'legend',
        '.card-title', '.card-text', '.text-content',
        '[role="heading"]', '[role="article"]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    // Filter out elements that shouldn't be read
    return Array.from(elements).filter(el => {
        // Skip if inside FAB menu
        if (el.closest('.fab-menu, .fab-container')) return false;
        
        // Skip if no visible text
        const text = getCleanText(el);
        if (!text || text.length < 2) return false;
        
        // Skip if hidden
        if (el.offsetParent === null) return false;
        
        return true;
    });
}

function handleElementHover(event) {
    if (!window.smartVoiceReader.isEnabled) return;
    
    const element = event.currentTarget;
    
    // Add visual indicator class (speaker icon only)
    element.classList.add('voice-readable-element');
    
    // Clear previous timeout
    if (window.smartVoiceReader.hoverTimeout) {
        clearTimeout(window.smartVoiceReader.hoverTimeout);
    }
    
    // Set new timeout to read after delay
    window.smartVoiceReader.hoverTimeout = setTimeout(() => {
        window.smartVoiceReader.currentElement = element;
        readElementText(element);
    }, window.smartVoiceReader.readDelay);
}

function handleElementLeave(event) {
    const element = event.currentTarget;
    
    // Remove visual indicator
    element.classList.remove('voice-readable-element');
    
    // Clear timeout if user moves away quickly
    if (window.smartVoiceReader.hoverTimeout) {
        clearTimeout(window.smartVoiceReader.hoverTimeout);
    }
}

function readElementText(element) {
    if (!('speechSynthesis' in window)) return;
    
    const text = getCleanText(element);
    if (!text) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Speak the text with normal speed
    try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0; // Normal speed
        utterance.pitch = 1;
        utterance.volume = 1;
        
        window.speechSynthesis.speak(utterance);
    } catch (err) {
        console.warn('Error reading text:', err);
    }
}

function getCleanText(element) {
    // Clone element to avoid modifying original
    const clone = element.cloneNode(true);
    
    // Remove script and style elements
    const excludedTags = clone.querySelectorAll('script, style, svg, img, canvas, video, audio, iframe');
    excludedTags.forEach(tag => tag.remove());
    
    // Remove icon elements
    const icons = clone.querySelectorAll('.fa, .fas, .far, .fab, .fal, [class*="icon-"]');
    icons.forEach(icon => icon.remove());
    
    // Get only direct text, not from children if element is a container
    let text = '';
    
    // For headings, paragraphs, buttons, links - read full text
    if (element.matches('h1, h2, h3, h4, h5, h6, p, button, a, label, legend')) {
        text = clone.textContent || '';
    } 
    // For list items, table cells - read full text
    else if (element.matches('li, td, th')) {
        text = clone.textContent || '';
    }
    // For spans and other elements, be more selective
    else {
        text = clone.textContent || '';
    }
    
    // Clean up the text
    text = text
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/[\n\r\t]/g, ' ') // Remove newlines and tabs
        .trim();
    
    // Remove common non-readable patterns
    text = text
        .replace(/^[•\-\*\>\#]+\s*/g, '') // Remove bullet points
        .replace(/^\d+\.\s*/g, '') // Remove numbered list markers
        .replace(/\[.*?\]/g, '') // Remove bracketed content
        .replace(/\{.*?\}/g, ''); // Remove braced content
    
    return text;
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Alt + A to toggle menu
    if (e.altKey && e.key === 'a') {
        e.preventDefault();
        const fabButton = document.querySelector('.fab');
        if (fabButton) fabButton.click();
    }
    
    // Alt + V to toggle voice mode
    if (e.altKey && e.key === 'v') {
        e.preventDefault();
        const voiceSwitch = document.getElementById('voice-switch');
        if (voiceSwitch) voiceSwitch.click();
    }
});