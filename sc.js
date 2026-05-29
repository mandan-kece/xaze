// ========== SLIDESHOW ==========
let slides = document.querySelectorAll('#slideshow .slide');
let currentSlide = 0;
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}
setInterval(nextSlide, 5000);

// ========== JAM ==========
function updateClock() {
    const now = new Date();
    document.getElementById('liveClock').innerText = now.toLocaleTimeString('id-ID');
    document.getElementById('timezone').innerText = new Intl.DateTimeFormat().resolvedOptions().timeZone;
}
setInterval(updateClock, 1000);
updateClock();

// ========== IP ADDRESS ==========
async function fetchIP() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        document.getElementById('ipAddress').innerText = data.ip;
    } catch(e) { document.getElementById('ipAddress').innerText = '192.168.x.x'; }
}
fetchIP();

// ========== BATTERY ==========
function getBatteryInfo() {
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            function updateBatt() {
                let level = Math.floor(battery.level * 100);
                let icon = battery.charging ? '⚡🔋' : '🔋';
                document.getElementById('batteryLevel').innerHTML = `${icon} ${level}% ${battery.charging ? '(Mengisi)' : ''}`;
            }
            updateBatt();
            battery.addEventListener('levelchange', updateBatt);
            battery.addEventListener('chargingchange', updateBatt);
        });
    } else {
        document.getElementById('batteryLevel').innerHTML = '🔋 Baterai: N/A';
    }
}
getBatteryInfo();

// ========== SIDEBAR ==========
const menuBtn = document.getElementById('menuBtn');
const sidebarEl = document.getElementById('sidebar');
const overlayEl = document.getElementById('overlay');
const downloaderPage = document.getElementById('downloaderPage');
const closeDownloaderBtn = document.getElementById('closeDownloader');

function closeSidebar() {
    sidebarEl.classList.remove('open');
    overlayEl.classList.remove('show');
}

menuBtn.addEventListener('click', () => {
    sidebarEl.classList.toggle('open');
    overlayEl.classList.toggle('show');
});
overlayEl.addEventListener('click', closeSidebar);

const menuItems = document.querySelectorAll('.menu-item');
const platformBadge = document.getElementById('selectedPlatformBadge');
let currentPlatform = '';
let currentFile = null;

// Elemen UI
const urlInput = document.getElementById('urlInput');
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const downloadBtn = document.getElementById('downloadActionBtn');
const statusDiv = document.getElementById('downloadStatus');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');
const toolsTitle = document.getElementById('toolsTitle');
const toolsDesc = document.getElementById('toolsDesc');

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        currentPlatform = item.getAttribute('data-platform');
        const platformName = item.textContent.trim();
        
        platformBadge.innerHTML = `<span class="platform-badge">📱 Tools: ${platformName}</span>`;
        toolsTitle.innerHTML = `<i class="${item.querySelector('i').className}"></i> ${platformName}`;
        
        // Reset UI
        urlInput.style.display = 'none';
        uploadArea.style.display = 'none';
        fileInput.style.display = 'none';
        resultContainer.style.display = 'none';
        urlInput.value = '';
        currentFile = null;
        
        // Tampilkan input sesuai platform
        if (['tiktok', 'youtube', 'snackvideo', 'videy', 'instagram', 'facebook'].includes(currentPlatform)) {
            urlInput.style.display = 'block';
            urlInput.placeholder = 'Masukan link video di sini...';
            toolsDesc.innerHTML = 'Tempel link video, klik proses untuk download';
        } else if (currentPlatform === 'hdenhancer') {
            uploadArea.style.display = 'block';
            fileInput.style.display = 'block';
            toolsDesc.innerHTML = 'Upload foto buram, akan diubah jadi HD';
        } else if (currentPlatform === 'removebg') {
            uploadArea.style.display = 'block';
            fileInput.style.display = 'block';
            toolsDesc.innerHTML = 'Upload foto, background akan otomatis dihapus';
        }
        
        closeSidebar();
        downloaderPage.classList.add('open');
    });
});

closeDownloaderBtn.addEventListener('click', () => {
    downloaderPage.classList.remove('open');
});

// ========== THEME TOGGLE ==========
const themeBtn = document.getElementById('themeBtn');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    const icon = themeBtn.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
});

// ========== UPLOAD AREA ==========
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', (e) => e.preventDefault());
uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    currentFile = e.dataTransfer.files[0];
    statusDiv.innerHTML = `📷 File siap: ${currentFile.name}`;
});
fileInput.addEventListener('change', (e) => {
    currentFile = e.target.files[0];
    statusDiv.innerHTML = `📷 File siap: ${currentFile.name}`;
});

// ========== API FUNCTIONS ==========

// TikTok Downloader
async function downloadTikTok(url) {
    try {
        const apiUrl = `https://api.nexray.eu.cc/downloader/tiktok?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status) {
            const r = data.result;
            resultContent.innerHTML = `
                <video controls poster="${r.cover}" style="width:100%; border-radius:16px">
                    <source src="${r.data}" type="video/mp4">
                </video>
                <div class="caption-text">${r.title || 'Tidak ada caption'}</div>
                <div class="result-stats">
                    <div>👁️ ${r.stats?.views}</div>
                    <div>❤️ ${r.stats?.likes}</div>
                    <div>💬 ${r.stats?.comment}</div>
                    <div>📤 ${r.stats?.share}</div>
                </div>
                <div class="download-links">
                    <a href="${r.data}" download class="btn-small">⬇️ Download Video</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ Sukses!';
        }
    } catch(e) { statusDiv.innerHTML = `❌ Error: ${e.message}`; }
}

// YouTube MP3 Downloader
async function downloadYoutube(url) {
    try {
        const apiUrl = `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status) {
            const r = data.result;
            resultContent.innerHTML = `
                <div class="youtube-result">
                    <img src="${r.thumbnail}" class="youtube-thumb">
                    <div class="youtube-info">
                        <div class="youtube-title">🎵 ${r.title}</div>
                        <div class="youtube-duration">⏱️ ${r.duration}</div>
                    </div>
                </div>
                <audio controls class="audio-player" src="${r.mp3}"></audio>
                <div class="download-links">
                    <a href="${r.mp3}" download class="btn-small">⬇️ Download MP3</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ MP3 siap!';
        }
    } catch(e) { statusDiv.innerHTML = `❌ Error: ${e.message}`; }
}

// Snack Video Downloader (API placeholder)
async function downloadSnackVideo(url) {
    statusDiv.innerHTML = '🔄 API Snack Video sedang dalam pengembangan...';
    resultContent.innerHTML = `
        <div style="text-align:center; padding:2rem;">
            <i class="fas fa-tools" style="font-size:3rem;"></i>
            <p>Fitur Snack Video akan segera hadir!</p>
            <p>API sedang disiapkan</p>
        </div>
    `;
    resultContainer.style.display = 'block';
}

// Videy Downloader (API placeholder)
async function downloadVidey(url) {
    statusDiv.innerHTML = '🔄 API Videy sedang dalam pengembangan...';
    resultContent.innerHTML = `
        <div style="text-align:center; padding:2rem;">
            <i class="fas fa-tools" style="font-size:3rem;"></i>
            <p>Fitur Videy akan segera hadir!</p>
            <p>API sedang disiapkan</p>
        </div>
    `;
    resultContainer.style.display = 'block';
}

// HD Photo Enhancer (DeepAI)
async function enhancePhoto(file) {
    const formData = new FormData();
    formData.append('image', file);
    
    statusDiv.innerHTML = '<div class="loading-spinner"></div> Memproses ke HD...';
    
    try {
        const response = await fetch('https://api.deepai.org/api/torch-srgan', {
            method: 'POST',
            headers: { 'api-key': 'quickstart-QUdJIGlzIGNvbWluZy4uLi4K' },
            body: formData
        });
        const data = await response.json();
        
        if (data.output_url) {
            resultContent.innerHTML = `
                <div class="result-compare">
                    <div>
                        <p><strong>Sebelum</strong></p>
                        <img src="${URL.createObjectURL(file)}" class="image-preview">
                    </div>
                    <div>
                        <p><strong>Sesudah (HD)</strong></p>
                        <img src="${data.output_url}" class="image-preview">
                    </div>
                </div>
                <div class="download-links">
                    <a href="${data.output_url}" download="enhanced.jpg" class="btn-small">⬇️ Download HD Photo</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ Foto berhasil di-HD-kan!';
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}`;
        resultContent.innerHTML = `<p style="color:red;">Gagal memproses. Coba lagi.</p>`;
        resultContainer.style.display = 'block';
    }
}

// Background Remover (Remove.bg)
async function removeBackground(file) {
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'auto');
    
    statusDiv.innerHTML = '<div class="loading-spinner"></div> Menghapus background...';
    
    try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: { 'X-Api-Key': 'YOUR_REMOVE_BG_API_KEY' },
            body: formData
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            resultContent.innerHTML = `
                <div class="result-compare">
                    <div>
                        <p><strong>Original</strong></p>
                        <img src="${URL.createObjectURL(file)}" class="image-preview">
                    </div>
                    <div>
                        <p><strong>Background Removed</strong></p>
                        <img src="${url}" class="image-preview">
                    </div>
                </div>
                <div class="download-links">
                    <a href="${url}" download="nobg.png" class="btn-small">⬇️ Download No BG</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ Background berhasil dihapus!';
        } else {
            throw new Error('Gagal hapus background');
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}. Coba API key lain.`;
        resultContent.innerHTML = `<p style="color:red;">Gunakan API key Remove.bg yang valid</p>`;
        resultContainer.style.display = 'block';
    }
}

// ========== MAIN PROCESS ==========
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!currentPlatform) {
        statusDiv.innerHTML = '⚠️ Pilih tools dulu dari menu ☰';
        return;
    }
    
    resultContainer.style.display = 'none';
    
    // Video Downloaders
    if (currentPlatform === 'tiktok' && url) await downloadTikTok(url);
    else if (currentPlatform === 'youtube' && url) await downloadYoutube(url);
    else if (currentPlatform === 'snackvideo' && url) await downloadSnackVideo(url);
    else if (currentPlatform === 'videy' && url) await downloadVidey(url);
    
    // Photo Tools
    else if (currentPlatform === 'hdenhancer' && currentFile) await enhancePhoto(currentFile);
    else if (currentPlatform === 'removebg' && currentFile) await removeBackground(currentFile);
    
    else {
        statusDiv.innerHTML = '❌ Masukkan URL atau pilih file terlebih dahulu!';
    }
});

// Config Links
document.getElementById('telegramBtn').href = 'https://t.me/LinkGroupKamu';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/Dq6B4ba0yhnJJEAij5rqFb';