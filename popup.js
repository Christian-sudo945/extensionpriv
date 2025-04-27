let isEnabled = false;
let currentWinner = '';

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggleBtn');
    const addBtn = document.getElementById('addBtn');
    const setWinnerBtn = document.getElementById('setWinner');
    const customNameInput = document.getElementById('customName');
    const winnerSelect = document.getElementById('winnerSelect');
    const status = document.getElementById('status');

    function loadNames() {
        chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
            if (!tabs[0].url?.includes('wheelofnames.com')) {
                winnerSelect.innerHTML = '<option value="">Go to wheelofnames.com</option>';
                setWinnerBtn.disabled = true;
                addBtn.disabled = true;
                customNameInput.disabled = true;
                return;
            }

            try {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'getNames' }, (response) => {
                    if (chrome.runtime.lastError || !response) {
                        status.textContent = 'Waiting for wheel...';
                        setTimeout(loadNames, 1000);
                        return;
                    }

                    if (response.names?.length > 0) {
                        winnerSelect.innerHTML = response.names
                            .map(name => `<option value="${name}">${name}</option>`)
                            .join('');
                        
                        if (currentWinner) {
                            winnerSelect.value = currentWinner;
                        }

                        setWinnerBtn.disabled = false;
                        addBtn.disabled = false;
                        customNameInput.disabled = false;
                    }
                });
            } catch (error) {
                setTimeout(loadNames, 1000);
            }
        });
    }

    chrome.storage.local.get(['enabled', 'winner'], (data) => {
        isEnabled = data.enabled || false;
        currentWinner = data.winner || '';
        toggleBtn.textContent = isEnabled ? 'Disable' : 'Enable';
        toggleBtn.className = isEnabled ? 'active' : '';
        status.textContent = isEnabled ? 'Active' : 'Disabled';
        status.className = `status ${isEnabled ? 'active' : ''}`;
        loadNames();
    });

    customNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addBtn.click();
    });

    addBtn.addEventListener('click', async () => {
        const name = customNameInput.value.trim();
        if (!name) return;

        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, { 
            type: 'addCustomName',
            name: name
        });

        customNameInput.value = '';
        setTimeout(loadNames, 500);
    });

    toggleBtn.addEventListener('click', async () => {
        isEnabled = !isEnabled;
        chrome.storage.local.set({ enabled: isEnabled });
        
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, { 
            type: 'toggle',
            enabled: isEnabled
        });
        
        toggleBtn.textContent = isEnabled ? 'Disable' : 'Enable';
        toggleBtn.className = isEnabled ? 'active' : '';
        status.textContent = isEnabled ? 'Active' : 'Disabled';
        status.className = `status ${isEnabled ? 'active' : ''}`;
    });

    setWinnerBtn.addEventListener('click', async () => {
        const winner = winnerSelect.value;
        if (!winner) return;
        
        currentWinner = winner;
        chrome.storage.local.set({ winner });
        
        const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
        chrome.tabs.sendMessage(tab.id, {
            type: 'setWinner',
            winner: winner
        });
        
        status.textContent = 'Winner set!';
        status.className = 'status active';
    });

    setInterval(loadNames, 2000);
});