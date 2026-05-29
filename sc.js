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

// ========== IP ==========
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
const toolsTitle = document.getElementById('toolsTitle');
const toolsDesc = document.getElementById('toolsDesc');
const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadActionBtn');
const statusDiv = document.getElementById('downloadStatus');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');

let currentPlatform = '';
let currentType = '';

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        currentPlatform = item.getAttribute('data-platform');
        currentType = item.getAttribute('data-type') || '';
        const platformName = item.textContent.trim();
        
        platformBadge.innerHTML = `<span class="platform-badge">📱 ${platformName}</span>`;
        toolsTitle.innerHTML = `<i class="${item.querySelector('i').className}"></i> ${platformName}`;
        
        if (currentPlatform === 'youtube') {
            toolsDesc.innerHTML = currentType === 'mp3' ? 'Download audio MP3 dari YouTube' : 'Download video MP4 dari YouTube';
        } else if (currentPlatform === 'tiktok') {
            toolsDesc.innerHTML = 'Download video TikTok tanpa watermark';
        } else if (currentPlatform === 'pinterest') {
            toolsDesc.innerHTML = 'Download gambar/video dari Pinterest';
        }
        
        urlInput.value = '';
        resultContainer.style.display = 'none';
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

// ========== API TIKTOK ==========
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
                <div class="caption-text">📝 ${r.title || 'Tidak ada caption'}</div>
                <div class="result-stats">
                    <div>👁️ ${r.stats?.views || 'N/A'}</div>
                    <div>❤️ ${r.stats?.likes || 'N/A'}</div>
                    <div>💬 ${r.stats?.comment || 'N/A'}</div>
                    <div>📤 ${r.stats?.share || 'N/A'}</div>
                </div>
                <div class="download-links">
                    <a href="${r.data}" download class="btn-small"><i class="fas fa-download"></i> Download Video</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ Sukses! Video siap download.';
        } else {
            statusDiv.innerHTML = '❌ Gagal ambil video. Cek link lagi.';
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}`;
    }
}

// ========== API YOUTUBE MP3 ==========
async function downloadYoutubeMP3(url) {
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
                    <a href="${r.mp3}" download class="btn-small"><i class="fas fa-download"></i> Download MP3</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ MP3 siap download!';
        } else {
            statusDiv.innerHTML = '❌ Gagal ambil MP3. Cek link YouTube.';
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}`;
    }
}

// ========== API YOUTUBE MP4 (placeholder) ==========
async function downloadYoutubeMP4(url) {
    statusDiv.innerHTML = '🔄 Mencari video...';
    resultContent.innerHTML = `
        <div style="text-align:center; padding:2rem;">
            <i class="fab fa-youtube" style="font-size:3rem; color:#ff0000;"></i>
            <p style="margin-top:1rem;"><strong>Fitur YouTube MP4</strong></p>
            <p>Sedang dalam pengembangan. API MP4 akan segera hadir!</p>
            <p style="margin-top:1rem; font-size:0.8rem;">Sementara gunakan MP3 dulu ya 👍</p>
        </div>
    `;
    resultContainer.style.display = 'block';
    statusDiv.innerHTML = '⏳ Fitur MP4 menyusul!';
}

// ========== API PINTEREST (placeholder) ==========
async function downloadPinterest(url) {
    statusDiv.innerHTML = '🔄 Mencari media...';
    resultContent.innerHTML = `
        <div style="text-align:center; padding:2rem;">
            <i class="fab fa-pinterest" style="font-size:3rem; color:#e60023;"></i>
            <p style="margin-top:1rem;"><strong>Pinterest Downloader</strong></p>
            <p>API sedang dalam persiapan</p>
            <p style="margin-top:1rem; font-size:0.8rem;">Akan segera hadir! 🔥</p>
        </div>
    `;
    resultContainer.style.display = 'block';
    statusDiv.innerHTML = '⏳ Fitur Pinterest menyusul!';
}

// ========== MAIN PROCESS ==========
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!currentPlatform) {
        statusDiv.innerHTML = '⚠️ Pilih platform dulu dari menu ☰';
        return;
    }
    
    if (!url) {
        statusDiv.innerHTML = '❌ Masukkan URL dulu!';
        return;
    }
    
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Memproses...';
    resultContainer.style.display = 'none';
    
    if (currentPlatform === 'tiktok') {
        await downloadTikTok(url);
    } 
    else if (currentPlatform === 'youtube') {
        if (currentType === 'mp3') {
            await downloadYoutubeMP3(url);
        } else {
            await downloadYoutubeMP4(url);
        }
    }
    else if (currentPlatform === 'pinterest') {
        await downloadPinterest(url);
    }
    else {
        statusDiv.innerHTML = '❌ Platform tidak dikenal';
    }
});

// Config Links (ganti sesuai keinginan)
document.getElementById('telegramBtn').href = 'https://t.me/xazechannel';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/YourLink';