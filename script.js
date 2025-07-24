document.addEventListener('DOMContentLoaded', function() {
    const youtubeUrlInput = document.getElementById('youtubeUrl');
    const searchBtn = document.getElementById('searchBtn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const videoTitle = document.getElementById('videoTitle');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoDescription = document.getElementById('videoDescription');
    const videoTimestamp = document.getElementById('videoTimestamp');
    const videoAgo = document.getElementById('videoAgo');
    const downloadType = document.getElementById('downloadType');
    const downloadQuality = document.getElementById('downloadQuality');
    const downloadBtn = document.getElementById('downloadBtn');

    let currentVideoData = null;

    downloadType.addEventListener('change', function() {
        populateQualityOptions();
    });

    function populateQualityOptions() {
        const format = downloadType.value;
        const qualitySelect = downloadQuality;
        qualitySelect.innerHTML = "";
        
        const options = format === "mp4"
            ? [144, 360, 480, 720, 1080, 1440]
            : [128, 256, 320];

        for (const q of options) {
            const opt = document.createElement("option");
            opt.value = q;
            opt.textContent = format === "mp4" ? `${q}p` : `${q}kbps`;
            qualitySelect.appendChild(opt);
        }
    }

    populateQualityOptions();

    searchBtn.addEventListener('click', function() {
        const url = youtubeUrlInput.value.trim();
        
        if (!url) {
            alert('Please enter a YouTube URL');
            return;
        } //special note:- This needs to be updated.
        
        if (!isValidYouTubeUrl(url)) {
            alert('Please enter a valid YouTube URL');
            return;
        }
        
        fetchVideoInfo(url);
    });

    downloadBtn.addEventListener('click', function() {
        if (!currentVideoData) return;
        
        downloadMedia();
    });

    function downloadMedia() {
        const format = downloadType.value;
        const quality = downloadQuality.value;
        const videoUrl = currentVideoData.result.data.url;
        
        const api = format === "mp4"
            ? `https://shamika-api.vercel.app/download/ytmp4?url=${encodeURIComponent(videoUrl)}&quality=${quality}`
            : `https://shamika-api.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}&quality=${quality}`;

        loading.style.display = 'block';
        downloadBtn.disabled = true;
        
        fetch(api)
            .then(res => res.json())
            .then(data => {
                if (!data.status) throw new Error("Failed to fetch download link");
                
                // Create a hidden iframe for downloading
                const iframe = document.createElement('iframe');
                iframe.src = data.result.download.url;
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
                
                // Remove the iframe after some time
                setTimeout(() => {
                    document.body.removeChild(iframe);
                }, 5000);
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Download failed: ' + err.message);
            })
            .finally(() => {
                loading.style.display = 'none';
                downloadBtn.disabled = false;
            });
    }

    function isValidYouTubeUrl(url) {
        const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
        return pattern.test(url);
    }

    function fetchVideoInfo(url) {
        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        
        const encodedUrl = encodeURIComponent(url);
        const apiUrl = `https://shamika-api.vercel.app/download/ytmp4?url=${encodedUrl}&quality=360`;
        
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if (data.status) {
                    currentVideoData = data;
                    displayVideoInfo(data);
                } else {
                    throw new Error('Failed to fetch video info');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to fetch video info. Please try again.');
            })
            .finally(() => {
                loading.style.display = 'none';
            });
    }

    function displayVideoInfo(data) {
        const metadata = data.result.data;
        
        videoTitle.textContent = metadata.title;
        videoThumbnail.src = metadata.image || metadata.thumbnail;
        videoDescription.textContent = metadata.description;
        videoTimestamp.textContent = metadata.timestamp || metadata.duration.timestamp;
        videoAgo.textContent = metadata.ago || metadata.gp;
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    youtubeUrlInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
});
