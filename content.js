let selectedWinner = '';
let isEnabled = false;
let wheelApp = null;

function initializeWheel() {
    const app = document.querySelector('div[data-v-fda5df40]');
    if (!app) return null;
    
    const wheel = {
        element: app,
        spinButton: app.querySelector('svg[data-v-05dd3f0e]'),
        entries: () => Array.from(document.querySelectorAll('div.entry-text')).map(e => e.textContent.trim()),
        spin: null
    };

    if (wheel.spinButton && !wheel.spinButton.__intercepted) {
        const spinContainer = wheel.spinButton.closest('div');
        if (spinContainer) {
            const originalClick = spinContainer.onclick;
            spinContainer.onclick = function(e) {
                if (isEnabled && selectedWinner) {
                    e.preventDefault();
                    e.stopPropagation();
                    forceWin();
                    return false;
                }
                return originalClick?.call(this, e);
            };
            wheel.spinButton.__intercepted = true;
        }
    }

    document.addEventListener('keydown', e => {
        if ((e.ctrlKey && e.key === 'Enter') && isEnabled && selectedWinner) {
            e.preventDefault();
            forceWin();
        }
    });

    return wheel;
}

function forceWin() {
    if (!wheelApp) return;
    
    const entries = wheelApp.entries();
    const winnerIndex = entries.indexOf(selectedWinner);
    if (winnerIndex === -1) return;

    const wheelElement = document.querySelector('g.wheel');
    if (!wheelElement) return;

    const totalEntries = entries.length;
    const spins = 8;
    const targetAngle = (360 * spins) - (360 / totalEntries * winnerIndex);
    
    let startTime = null;
    const duration = 5000;

    const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easing = 1 - Math.pow(1 - progress, 3);
        const currentAngle = targetAngle * easing;
        
        wheelElement.style.transform = `rotate(${currentAngle}deg)`;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                const winnerDisplay = document.querySelector('.winner-text');
                if (winnerDisplay) {
                    winnerDisplay.textContent = selectedWinner;
                }
            }, 100);
        }
    };

    requestAnimationFrame(animate);
}

function getAllNames() {
    if (!wheelApp) return [];
    const entries = wheelApp.entries();
    const textarea = document.querySelector('textarea');
    if (textarea) {
        const textareaNames = textarea.value.split('\n')
            .map(n => n.trim())
            .filter(n => n);
        return [...new Set([...entries, ...textareaNames])];
    }
    return entries;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!wheelApp) wheelApp = initializeWheel();
    
    switch (message.type) {
        case 'getNames':
            sendResponse({ names: getAllNames() });
            break;
        case 'setWinner':
            selectedWinner = message.winner;
            break;
        case 'toggle':
            isEnabled = message.enabled;
            break;
        case 'addCustomName':
            const textarea = document.querySelector('textarea');
            if (textarea) {
                const currentNames = textarea.value.split('\n').filter(n => n.trim());
                currentNames.push(message.name);
                textarea.value = currentNames.join('\n');
                const event = new Event('input', { bubbles: true });
                textarea.dispatchEvent(event);
            }
            break;
    }
});

chrome.storage.local.get(['enabled', 'winner'], (data) => {
    isEnabled = data.enabled || false;
    selectedWinner = data.winner || '';
});

const observer = new MutationObserver(() => {
    if (!wheelApp) {
        wheelApp = initializeWheel();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

if (document.readyState === 'complete') {
    wheelApp = initializeWheel();
}