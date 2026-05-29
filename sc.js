// ========== SLIDESHOW (5 detik) ==========
let slides = document.querySelectorAll('#slideshow .slide');
let currentSlide = 0;
function nextSlide() {
    slides[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add('active');
}
setInterval(nextSlide, 5000);

// ========== JAM REAL TIME ==========
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
    } catch(e) { document.getElementById('ipAddress').innerText = '192.168.x.x (lokal)'; }
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
        document.getElementById('batteryLevel').innerHTML = '🔋 Baterai: N/A (desktop)';
    }
}
getBatteryInfo();

// ========== SIDEBAR & DOWNLOADER PAGE ==========
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

menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const platform = item.getAttribute('data-platform');
        currentPlatform = platform;
        platformBadge.innerHTML = `<span class="platform-badge">📱 Platform: ${platform.toUpperCase()}</span>`;
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
    if(document.body.classList.contains('dark')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
});

// ========== DOWNLOADER ==========
const downloadBtn = document.getElementById('downloadActionBtn');
const urlInput = document.getElementById('urlInput');
const statusDiv = document.getElementById('downloadStatus');
const resultContainer = document.getElementById('resultContainer');
const resultContent = document.getElementById('resultContent');

// Fungsi download TikTok
async function downloadTikTok(url) {
    try {
        const apiUrl = `https://api.nexray.eu.cc/downloader/tiktok?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === true) {
            const r = data.result;
            const caption = r.title ? r.title.replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            }) : 'Tidak ada caption';
            
            resultContent.innerHTML = `
                <video controls poster="${r.cover}">
                    <source src="${r.data}" type="video/mp4">
                    Browser tidak support video.
                </video>
                <div class="caption-text"><i class="fas fa-quote-left"></i> ${caption}</div>
                <div class="result-stats">
                    <div><i class="fas fa-eye"></i> ${r.stats?.views || 'N/A'}</div>
                    <div><i class="fas fa-heart"></i> ${r.stats?.likes || 'N/A'}</div>
                    <div><i class="fas fa-comment"></i> ${r.stats?.comment || 'N/A'}</div>
                    <div><i class="fas fa-share"></i> ${r.stats?.share || 'N/A'}</div>
                    <div><i class="fas fa-download"></i> ${r.stats?.download || 'N/A'}</div>
                </div>
                <div style="margin: 10px 0; font-size: 0.8rem;">
                    <i class="fas fa-user"></i> <strong>${r.author?.nickname || r.author?.fullname || 'Unknown'}</strong><br>
                    <i class="fas fa-clock"></i> Upload: ${r.taken_at || 'Tidak diketahui'}<br>
                    <i class="fas fa-music"></i> Musik: ${r.music_info?.title || 'Tidak diketahui'}
                </div>
                <div class="download-links">
                    <a href="${r.data}" download class="btn-small"><i class="fas fa-download"></i> Download Video</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = `<span style="color: green;">✅ Sukses! Video ditemukan.</span>`;
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            statusDiv.innerHTML = `<span style="color: red;">❌ Gagal: ${data.message || 'Link tidak valid'}</span>`;
            resultContainer.style.display = 'none';
        }
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: red;">❌ Error: ${error.message}</span>`;
        resultContainer.style.display = 'none';
    }
}

// ========== FUNGSI YOUTUBE MP3 (BARU) ==========
async function downloadYoutubeMP3(url) {
    try {
        const apiUrl = `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.status === true) {
            const r = data.result;
            
            resultContent.innerHTML = `
                <div class="youtube-result">
                    <img src="${r.thumbnail}" class="youtube-thumb" alt="thumbnail">
                    <div class="youtube-info">
                        <div class="youtube-title"><i class="fab fa-youtube"></i> ${r.title}</div>
                        <div class="youtube-duration"><i class="far fa-clock"></i> ${r.duration}</div>
                    </div>
                </div>
                <audio controls class="audio-player">
                    <source src="${r.mp3}" type="audio/mpeg">
                    Browser tidak support audio.
                </audio>
                <div class="download-links" style="margin-top: 1rem;">
                    <a href="${r.mp3}" download class="btn-small"><i class="fas fa-download"></i> Download MP3</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = `<span style="color: green;">✅ Sukses! MP3 siap download.</span>`;
            resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            statusDiv.innerHTML = `<span style="color: red;">❌ Gagal: ${data.message || 'Link YouTube tidak valid'}</span>`;
            resultContainer.style.display = 'none';
        }
    } catch (error) {
        statusDiv.innerHTML = `<span style="color: red;">❌ Error: ${error.message}</span>`;
        resultContainer.style.display = 'none';
    }
}

// Main download process
downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
        statusDiv.innerHTML = '<span style="color:red;">❌ Masukkan URL dulu!</span>';
        resultContainer.style.display = 'none';
        return;
    }
    
    if (!currentPlatform) {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ Pilih platform dulu dari menu ☰</span>';
        resultContainer.style.display = 'none';
        return;
    }
    
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Memproses link...';
    resultContainer.style.display = 'none';
    
    // YouTube MP3
    if (currentPlatform === 'youtube' || url.includes('youtu.be') || url.includes('youtube.com')) {
        await downloadYoutubeMP3(url);
    }
    // TikTok
    else if (currentPlatform === 'tiktok' || url.includes('tiktok.com')) {
        await downloadTikTok(url);
    }
    else if (currentPlatform === 'instagram') {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ API Instagram belum tersedia, menyusul!</span>';
    }
    else if (currentPlatform === 'facebook') {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ API Facebook belum tersedia, menyusul!</span>';
    }
    else {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ Platform belum didukung! Coba YouTube atau TikTok.</span>';
    }
});

// Config Link Telegram & WhatsApp
document.getElementById('telegramBtn').href = 'https://t.me/LinkGroupKamu';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/Dq6B4ba0yhnJJEAij5rqFb';