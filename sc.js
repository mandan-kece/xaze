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

// ========== MUSIC PLAYER PREVIEW (TERPISAH) ==========
const audioPreview = new Audio();
// Ganti URL MP3 sesuai keinginan lo
audioPreview.src = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3';
audioPreview.loop = false;

const musicCover = document.getElementById('musicCover');
const musicTitle = document.getElementById('musicTitle');
const musicArtist = document.getElementById('musicArtist');
const musicDurationText = document.getElementById('musicDurationText');
const musicProgressSmall = document.getElementById('musicProgressSmall');
const musicPlayBtn = document.getElementById('musicPlayBtn');
const musicPlayIcon = document.getElementById('musicPlayIcon');

let isMusicPlaying = false;

// Info lagu (bisa lo ganti sendiri)
const songList = [
    { title: 'Lofi Study Beats', artist: 'Chillhop Music', cover: 'https://cdn.pixabay.com/photo/2016/12/18/13/45/vinyl-1915773_640.png', url: 'https://cdnn.ikyyxd.my.id/storage/068dcbc9ab9df63571349928818c1226.mp3?preview=true' },
    { title: 'Jazz Night', artist: 'Coffee Shop Jazz', cover: 'https://cdn.pixabay.com/photo/2013/07/13/11/46/record-158540_640.png', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { title: 'Electronic Dreams', artist: 'Synthwave Pro', cover: 'https://cdn.pixabay.com/photo/2014/04/03/11/53/record-312209_640.png', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
];

let currentSongIndex = 0;

function loadSong(index) {
    const song = songList[index];
    musicTitle.textContent = song.title;
    musicArtist.textContent = song.artist;
    musicCover.src = song.cover;
    audioPreview.src = song.url;
    audioPreview.currentTime = 0;
    if (isMusicPlaying) {
        audioPreview.play().catch(e => console.log('Autoplay dicegah'));
        musicCover.classList.add('spinning');
    } else {
        musicCover.classList.remove('spinning');
    }
    updateMusicTimer();
}

function updateMusicTimer() {
    const current = audioPreview.currentTime;
    const duration = audioPreview.duration;
    
    if (isNaN(duration)) {
        musicDurationText.textContent = '00:00 / 00:00';
        musicProgressSmall.value = 0;
        return;
    }
    
    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    
    musicDurationText.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
    musicProgressSmall.value = (current / duration) * 100;
}

audioPreview.addEventListener('timeupdate', updateMusicTimer);
audioPreview.addEventListener('loadedmetadata', updateMusicTimer);

musicProgressSmall.addEventListener('input', (e) => {
    const duration = audioPreview.duration;
    if (!isNaN(duration)) {
        audioPreview.currentTime = (e.target.value / 100) * duration;
    }
});

musicPlayBtn.addEventListener('click', () => {
    if (isMusicPlaying) {
        audioPreview.pause();
        musicCover.classList.remove('spinning');
        musicPlayIcon.className = 'fas fa-play';
        isMusicPlaying = false;
    } else {
        audioPreview.play().catch(e => {
            console.log('Autoplay dicegah browser, user harus klik manual');
        });
        musicCover.classList.add('spinning');
        musicPlayIcon.className = 'fas fa-pause';
        isMusicPlaying = true;
    }
});

audioPreview.addEventListener('ended', () => {
    // Ganti ke lagu berikutnya
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    loadSong(currentSongIndex);
    audioPreview.play().catch(e => console.log('Auto next gagal'));
    musicCover.classList.add('spinning');
    musicPlayIcon.className = 'fas fa-pause';
    isMusicPlaying = true;
});

// Load lagu pertama
loadSong(0);

// Klik cover untuk ganti lagu (opsional)
musicCover.addEventListener('click', () => {
    currentSongIndex = (currentSongIndex + 1) % songList.length;
    loadSong(currentSongIndex);
    if (isMusicPlaying) {
        audioPreview.play();
        musicCover.classList.add('spinning');
    }
});

// Config Links (ganti sesuai keinginan)
document.getElementById('telegramBtn').href = 'https://t.me/xazechannel';
document.getElementById('whatsappBtn').href = 'https://chat.whatsapp.com/YourLink';