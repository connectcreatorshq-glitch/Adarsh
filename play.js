document.querySelectorAll('.card-thumbnail').forEach(thumbnail => {
  const playBtn = thumbnail.querySelector('.play-button');

  playBtn.addEventListener('click', () => {
    const videoSrc = thumbnail.dataset.video;
    if (!videoSrc) return;

    // Remove existing video if any
    const existing = thumbnail.querySelector('video');
    if (existing) existing.remove();

    // Hide thumbnail image & play button
    thumbnail.querySelector('img').style.display = 'none';
    playBtn.style.display = 'none';

    // Create video element
    const video = document.createElement('video');
    video.src = videoSrc;
    video.autoplay = true;
    video.controls = true;
    video.playsInline = true;
    video.classList.add('show');

    thumbnail.appendChild(video);
  });
});