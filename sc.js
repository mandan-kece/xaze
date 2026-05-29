// ========== SLIDESHOW (5 detik, tanpa teks) ==========
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

// Ketika klik menu item (platform) -> tutup sidebar, buka halaman downloader
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

// Tutup halaman downloader
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

// ========== DOWNLOADER TIKTOK REAL ==========
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
                
                <div class="caption-text">
                    <i class="fas fa-quote-left"></i> ${caption}
                </div>
                
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
    
    let detectedPlatform = currentPlatform;
    if (url.includes('tiktok.com')) detectedPlatform = 'tiktok';
    else if (url.includes('instagram.com')) detectedPlatform = 'instagram';
    else if (url.includes('facebook.com') || url.includes('fb.watch')) detectedPlatform = 'facebook';
    else if (url.includes('youtu.be') || url.includes('youtube.com')) detectedPlatform = 'youtube';
    
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Memproses link...';
    resultContainer.style.display = 'none';
    
    if (detectedPlatform === 'tiktok') {
        await downloadTikTok(url);
    } else if (detectedPlatform === 'instagram') {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ API Instagram belum tersedia, menyusul!</span>';
    } else if (detectedPlatform === 'facebook') {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ API Facebook belum tersedia, menyusul!</span>';
    } else if (detectedPlatform === 'youtube') {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ API YouTube belum tersedia, menyusul!</span>';
    } else {
        statusDiv.innerHTML = '<span style="color:orange;">⚠️ Platform belum didukung! Coba TikTok dulu.</span>';
    }
});

// Config Link Telegram & WhatsApp
document.getElementById('telegramBtn').href = 'https://t.me/LinkGroupKamu';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/Dq6B4ba0yhnJJEAij5rqFb';