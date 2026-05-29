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
    document.getElementById('timezone').innerText = Intl.DateTimeFormat().resolvedOptions().timeZone;
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
        document.getElementById('batteryLevel').innerHTML = '🔋 N/A';
    }
}
getBatteryInfo();

// ========== SIDEBAR ==========
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
const downloaderPage = document.getElementById('downloaderPage');
const closeDownloader = document.getElementById('closeDownloader');

function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
}

menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
});
overlay.addEventListener('click', closeSidebar);

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
    item.addEventListener('click', () => {
        currentPlatform = item.getAttribute('data-platform');
        currentType = item.getAttribute('data-type') || '';
        const platformName = item.textContent.trim();
        platformBadge.innerHTML = `<span class="platform-badge">📱 ${platformName}</span>`;
        toolsTitle.innerHTML = `<i class="${item.querySelector('i').className}"></i> ${platformName}`;
        
        if (currentPlatform === 'youtube') {
            toolsDesc.innerHTML = currentType === 'mp3' ? 'Download MP3 dari YouTube' : 'Download MP4 dari YouTube (coming soon)';
        } else if (currentPlatform === 'tiktok') {
            toolsDesc.innerHTML = 'Download video TikTok tanpa watermark';
        } else {
            toolsDesc.innerHTML = 'Download dari Pinterest (coming soon)';
        }
        
        urlInput.value = '';
        resultContainer.style.display = 'none';
        closeSidebar();
        downloaderPage.classList.add('open');
    });
});

closeDownloader.addEventListener('click', () => {
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

// ========== MUSIC PLAYER (1 LAGU, LOOP) ==========
const audio = new Audio();
audio.src = 'https://cdnn.ikyyxd.my.id/storage/068dcbc9ab9df63571349928818c1226.mp3?preview=true';
audio.loop = true;

const musicCover = document.getElementById('musicCover');
const playPauseBtn = document.getElementById('playPauseBtn');
const playPauseIcon = document.getElementById('playPauseIcon');
const currentTimeSpan = document.getElementById('currentTime');
const durationSpan = document.getElementById('duration');
const progressBar = document.getElementById('musicProgress');
const progressFill = document.getElementById('progressFill');
const overlayPlayIcon = document.getElementById('overlayPlayIcon');
const musicOverlay = document.getElementById('musicOverlay');

let isPlaying = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateProgress() {
    const current = audio.currentTime;
    const duration = audio.duration;
    if (!isNaN(duration)) {
        currentTimeSpan.innerText = formatTime(current);
        durationSpan.innerText = formatTime(duration);
        const percent = (current / duration) * 100;
        progressBar.value = percent;
        progressFill.style.width = percent + '%';
    }
}

function togglePlay() {
    if (isPlaying) {
        audio.pause();
        musicCover.classList.remove('spinning');
        playPauseIcon.className = 'fas fa-play';
        overlayPlayIcon.className = 'fas fa-play';
        isPlaying = false;
    } else {
        audio.play().catch(e => console.log('Autoplay dicegah'));
        musicCover.classList.add('spinning');
        playPauseIcon.className = 'fas fa-pause';
        overlayPlayIcon.className = 'fas fa-pause';
        isPlaying = true;
    }
}

playPauseBtn.addEventListener('click', togglePlay);
musicOverlay.addEventListener('click', togglePlay);

progressBar.addEventListener('input', (e) => {
    const duration = audio.duration;
    if (!isNaN(duration)) {
        const seekTime = (e.target.value / 100) * duration;
        audio.currentTime = seekTime;
        progressFill.style.width = e.target.value + '%';
    }
});

audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('loadedmetadata', updateProgress);
audio.addEventListener('ended', () => {
    // Loop sudah otomatis karena audio.loop = true
    musicCover.classList.add('spinning');
    playPauseIcon.className = 'fas fa-pause';
    isPlaying = true;
});

// ========== API DOWNLOADER ==========
async function downloadTikTok(url) {
    try {
        const apiUrl = `https://api.nexray.eu.cc/downloader/tiktok?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.status) {
            const r = data.result;
            resultContent.innerHTML = `
                <video controls poster="${r.cover}" style="width:100%; border-radius:16px">
                    <source src="${r.data}" type="video/mp4">
                </video>
                <div class="caption-text">📝 ${r.title || 'No caption'}</div>
                <div class="result-stats">
                    <div>👁️ ${r.stats?.views}</div>
                    <div>❤️ ${r.stats?.likes}</div>
                    <div>💬 ${r.stats?.comment}</div>
                    <div>📤 ${r.stats?.share}</div>
                </div>
                <div class="download-links">
                    <a href="${r.data}" download class="btn-small"><i class="fas fa-download"></i> Download Video</a>
                </div>
            `;
            resultContainer.style.display = 'block';
            statusDiv.innerHTML = '✅ Sukses!';
        } else {
            statusDiv.innerHTML = '❌ Gagal ambil video';
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}`;
    }
}

async function downloadYoutubeMP3(url) {
    try {
        const apiUrl = `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent(url)}`;
        const res = await fetch(apiUrl);
        const data = await res.json();
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
            statusDiv.innerHTML = '✅ MP3 siap!';
        } else {
            statusDiv.innerHTML = '❌ Gagal ambil MP3';
        }
    } catch(e) {
        statusDiv.innerHTML = `❌ Error: ${e.message}`;
    }
}

function downloadYoutubeMP4(url) {
    resultContent.innerHTML = `<div style="text-align:center;padding:2rem;"><i class="fab fa-youtube" style="font-size:2rem;"></i><p>Fitur MP4 menyusul!</p></div>`;
    resultContainer.style.display = 'block';
    statusDiv.innerHTML = '⏳ Fitur MP4 segera hadir';
}

function downloadPinterest(url) {
    resultContent.innerHTML = `<div style="text-align:center;padding:2rem;"><i class="fab fa-pinterest" style="font-size:2rem;"></i><p>Fitur Pinterest menyusul!</p></div>`;
    resultContainer.style.display = 'block';
    statusDiv.innerHTML = '⏳ Fitur Pinterest segera hadir';
}

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!currentPlatform) {
        statusDiv.innerHTML = '⚠️ Pilih platform dulu';
        return;
    }
    if (!url) {
        statusDiv.innerHTML = '❌ Masukkan URL';
        return;
    }
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Memproses...';
    resultContainer.style.display = 'none';
    
    if (currentPlatform === 'tiktok') await downloadTikTok(url);
    else if (currentPlatform === 'youtube' && currentType === 'mp3') await downloadYoutubeMP3(url);
    else if (currentPlatform === 'youtube' && currentType === 'mp4') downloadYoutubeMP4(url);
    else if (currentPlatform === 'pinterest') downloadPinterest(url);
    else statusDiv.innerHTML = '❌ Platform tidak dikenal';
});

// Config Links
document.getElementById('telegramBtn').href = 'https://t.me/xazechannel';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/YourLink';