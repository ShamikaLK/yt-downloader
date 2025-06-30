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

            // Current video data
            let currentVideoData = null;

            // Update quality options based on selected type
            downloadType.addEventListener('change', function() {
                populateQualityOptions();
            });

            function populateQualityOptions() {
                const format = downloadType.value;
                const qualitySelect = downloadQuality;
                qualitySelect.innerHTML = "";
                
                const options = format === "mp4"
                    ? [144, 360, 480, 720, 1080]
                    : [92, 128, 256, 320];

                for (const q of options) {
                    const opt = document.createElement("option");
                    opt.value = q;
                    opt.textContent = format === "mp4" ? `${q}p` : `${q}kbps`;
                    qualitySelect.appendChild(opt);
                }
            }

            // Initialize quality options
            populateQualityOptions();

            // Search button click handler
            searchBtn.addEventListener('click', function() {
                const url = youtubeUrlInput.value.trim();
                
                if (!url) {
                    alert('Please enter a YouTube URL');
                    return;
                }
                
                if (!isValidYouTubeUrl(url)) {
                    alert('Please enter a valid YouTube URL');
                    return;
                }
                
                fetchVideoInfo(url);
            });

            // Download button click handler
            downloadBtn.addEventListener('click', function() {
                if (!currentVideoData) return;
                
                const url = currentVideoData.result.metadata.url;
                downloadMedia(url);
            });

            function downloadMedia(url) {
                const format = downloadType.value;
                const quality = downloadQuality.value;
                
                const api = format === "mp4"
                    ? `https://shamika-api.vercel.app/download/ytmp4?url=${encodeURIComponent(url)}&quality=${quality}`
                    : `https://shamika-api.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}&quality=${quality}`;

                loading.style.display = 'block';
                downloadBtn.disabled = true;
                
                fetch(api)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.status) throw new Error("Failed to fetch download link");
                        
                        const a = document.createElement('a');
                        a.href = data.result.download.url;
                        a.download = data.result.download.filename || 
                            (format === "mp4" ? `video_${quality}p.mp4` : `audio_${quality}kbps.mp3`);
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        alert(err.message);
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
                const metadata = data.result.metadata;
                
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
