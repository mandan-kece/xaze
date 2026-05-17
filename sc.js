const API_DOWNLOAD = "https://api-faa.my.id/faa/tiktok";
const API_CAPTION = "https://api.nexray.eu.cc/downloader/tiktok";

const urlInput = document.getElementById('tiktokUrl');
const processBtn = document.getElementById('processBtn');
const inputPanel = document.getElementById('inputPanel');
const loadingDiv = document.getElementById('loadingIndicator');
const resultContainer = document.getElementById('resultContainer');
let currentVideoUrl = null;

function formatNumberShort(num) {
    if (!num) return '0';
    if (typeof num === 'string') {
        if (num.includes('K') || num.includes('M')) return num;
        num = parseInt(num.replace(/[^0-9]/g, '')) || 0;
    }
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
    return num.toString();
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

async function fetchCaptionData(tiktokUrl) {
    try {
        const response = await fetch(`${API_CAPTION}?url=${encodeURIComponent(tiktokUrl)}`);
        const data = await response.json();
        if (data && data.status && data.result) return data.result;
        return null;
    } catch (err) {
        console.warn("Caption error:", err);
        return null;
    }
}

async function handleDownloadProcess() {
    const url = urlInput.value.trim();
    if (!url) {
        alert("Masukkan link TikTok dulu.");
        return;
    }

    loadingDiv.style.display = 'block';
    resultContainer.style.display = 'none';
    resultContainer.innerHTML = '';
    processBtn.disabled = true;

    try {
        const videoResponse = await fetch(`${API_DOWNLOAD}?url=${encodeURIComponent(url)}`);
        const videoData = await videoResponse.json();
        const isSuccess = videoData.status === "benar" || videoData.status === true;
        if (!isSuccess || !videoData.result) throw new Error("Gagal mengambil video.");
        const resVideo = videoData.hasil || videoData.result;
        let rawVideoUrl = resVideo?.alternatives?.nowm_hd || resVideo?.alternatives?.nowm || resVideo?.data || resVideo?.video;
        if (!rawVideoUrl) throw new Error("Link video tidak ditemukan.");
        currentVideoUrl = rawVideoUrl;

        const captionDetail = await fetchCaptionData(url);
        let title = "TikTok Video";
        let views = "0", likes = "0", comments = "0", shares = "0", saves = "0", downloads = "0";
        let authorName = "Kreator TikTok", authorUsername = "", authorAvatar = "";
        let musicTitle = "", musicAuthor = "";
        let takenDate = "", duration = "";
        let coverImg = "";

        if (captionDetail) {
            title = captionDetail.title || title;
            const stats = captionDetail.stats || {};
            views = formatNumberShort(stats.views);
            likes = formatNumberShort(stats.likes);
            comments = formatNumberShort(stats.comment);
            shares = formatNumberShort(stats.share);
            saves = formatNumberShort(stats.save);
            downloads = formatNumberShort(stats.download);
            const authorInfo = captionDetail.author || {};
            authorName = authorInfo.nickname || authorInfo.fullname || "Pengguna TikTok";
            authorUsername = authorInfo.unique_id || authorInfo.username || "";
            authorAvatar = authorInfo.avatar || "";
            const musicInfo = captionDetail.music_info || {};
            musicTitle = musicInfo.title || "";
            musicAuthor = musicInfo.author || "";
            takenDate = captionDetail.taken_at || "";
            duration = captionDetail.duration || "";
            coverImg = captionDetail.cover || "";
        }

        resultContainer.innerHTML = `
            <div class="video-preview">
                <video controls src="${escapeHtml(currentVideoUrl)}" poster="${escapeHtml(coverImg)}"></video>
            </div>
            <div class="caption-glass">
                <div class="caption-title">📌 ${escapeHtml(title.substring(0, 130))}${title.length > 130 ? '…' : ''}</div>
                <div class="stats-grid">
                    <span class="stat-badge">👁️ ${views}</span>
                    <span class="stat-badge">❤️ ${likes}</span>
                    <span class="stat-badge">💬 ${comments}</span>
                    <span class="stat-badge">↗️ ${shares}</span>
                    <span class="stat-badge">📥 ${saves}</span>
                    <span class="stat-badge">⬇️ ${downloads}</span>
                </div>
                <div class="author-section">
                    ${authorAvatar ? `<img src="${escapeHtml(authorAvatar)}" class="author-avatar-mini" onerror="this.style.display='none'">` : `<div class="author-avatar-mini" style="background:#3A5670; display:flex; align-items:center; justify-content:center;">X</div>`}
                    <div>
                        <div class="author-name">${escapeHtml(authorName)}</div>
                        ${authorUsername ? `<div style="font-size:0.65rem; color:#cdedff;">@${escapeHtml(authorUsername)}</div>` : ''}
                    </div>
                </div>
                ${musicTitle ? `<div class="music-row">🎵 ${escapeHtml(musicTitle)} ${musicAuthor ? `- ${escapeHtml(musicAuthor)}` : ''}</div>` : ''}
                <div class="extra-detail">
                    <span>📅 ${takenDate || '—'}</span>
                    <span>⏱️ ${duration || '—'}</span>
                </div>
                <div class="button-group">
                    <button class="download-btn-result" id="realDownloadBtn">⬇️ SIMPAN VIDEO (tanpa watermark)</button>
                    <div class="reset-download" id="resetDownloadBtn">↺ UNDUH VIDEO LAIN</div>
                    <div class="join-group-btn" id="joinGroupBtn">💬 JOIN GROUP XAZE</div>
                </div>
            </div>
        `;

        resultContainer.style.display = 'block';
        inputPanel.classList.add('hide-panel');

        document.getElementById('realDownloadBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentVideoUrl) {
                const a = document.createElement('a');
                a.href = currentVideoUrl;
                a.download = 'xaze_tiktok.mp4';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            } else {
                alert("Video tidak tersedia");
            }
        });

        document.getElementById('resetDownloadBtn')?.addEventListener('click', () => {
            resultContainer.style.display = 'none';
            inputPanel.classList.remove('hide-panel');
            urlInput.value = '';
            currentVideoUrl = null;
            processBtn.disabled = false;
        });

        document.getElementById('joinGroupBtn')?.addEventListener('click', () => {
            window.open('https://chat.whatsapp.com/Dq6B4ba0yhnJJEAij5rqFb', '_blank');
        });

    } catch (err) {
        console.error(err);
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `<div style="background:rgba(0,0,0,0.5); backdrop-filter:blur(6px); padding:16px; border-radius:28px; text-align:center; color:#FFC0C0;">⚠️ Gagal: ${escapeHtml(err.message)}</div>`;
    } finally {
        loadingDiv.style.display = 'none';
        processBtn.disabled = false;
    }
}

processBtn.addEventListener('click', handleDownloadProcess);
urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleDownloadProcess(); });

// SALJU
const canvas = document.getElementById('snow-canvas');
let ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
let snowflakes = [];

function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function initSnow(count = 120) {
    snowflakes = [];
    for (let i = 0; i < count; i++) {
        snowflakes.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.8 + 0.6,
            speedY: Math.random() * 0.6 + 0.3,
            speedX: (Math.random() - 0.5) * 0.15,
            opacity: Math.random() * 0.5 + 0.15
        });
    }
}

function drawSnow() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    for (let flake of snowflakes) {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 250, 250, ${flake.opacity})`;
        ctx.fill();
        flake.y += flake.speedY;
        flake.x += flake.speedX;
        if (flake.y > height) {
            flake.y = -5;
            flake.x = Math.random() * width;
        }
        if (flake.x > width + 10) flake.x = -10;
        if (flake.x < -10) flake.x = width + 10;
    }
    requestAnimationFrame(drawSnow);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    initSnow(110);
});
resizeCanvas();
initSnow(115);
drawSnow();