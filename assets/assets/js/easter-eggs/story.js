(() => {
  const target = document.querySelector("#easter-name");
  const player = document.querySelector("#story-player");
  if (!target || !player) return;

  let clickCount = 0;
  let clickTimer = null;
  let isOpen = false;
  let playerReady = false;

  const audioEl = () => player.querySelector("audio");

  const openPlayer = () => {
    if (isOpen) return;
    isOpen = true;
    player.classList.add("is-open");
    player.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!playerReady && window.GreenAudioPlayer) {
      new window.GreenAudioPlayer(".story-audio", { stopOthersOnPlay: true });
      playerReady = true;
    }
  };

  const closePlayer = () => {
    if (!isOpen) return;
    isOpen = false;
    player.classList.remove("is-open");
    player.setAttribute("aria-hidden", "true");
    const audio = audioEl();
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    document.body.style.overflow = "";
  };

  target.addEventListener("click", () => {
    clickCount += 1;
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => (clickCount = 0), 800);
    if (clickCount >= 5) {
      clickCount = 0;
      openPlayer();
    }
  });

  player.addEventListener("click", event => {
    if (event.target.hasAttribute("data-story-close")) {
      closePlayer();
    }
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closePlayer();
  });
})();
