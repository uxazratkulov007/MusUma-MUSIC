const tracks = [
  {
    id: "neon-bazaar",
    title: "Neon Bazaar",
    artist: "Uma Wave",
    genre: "electronic",
    mood: "night",
    duration: "0:45",
    cover: "assets/covers/cover1.jpg",
    src: "assets/audio/track1.mp3",
  },
  {
    id: "samarkand-dusk",
    title: "Samarkand Dusk",
    artist: "Silk Route",
    genre: "lofi",
    mood: "focus",
    duration: "0:45",
    cover: "assets/covers/cover2.jpg",
    src: "assets/audio/track2.mp3",
  },
  {
    id: "city-pulse",
    title: "City Pulse",
    artist: "MusUma Live",
    genre: "pop",
    mood: "energy",
    duration: "0:45",
    cover: "assets/covers/cover3.jpg",
    src: "assets/audio/track3.mp3",
  },
  {
    id: "late-train",
    title: "Late Train",
    artist: "Night Courier",
    genre: "hiphop",
    mood: "night",
    duration: "0:45",
    cover: "assets/covers/cover4.jpg",
    src: "assets/audio/track4.mp3",
  },
  {
    id: "green-room",
    title: "Green Room",
    artist: "Studio Uma",
    genre: "lofi",
    mood: "focus",
    duration: "0:45",
    cover: "assets/covers/cover5.jpg",
    src: "assets/audio/track5.mp3",
  },
  {
    id: "open-road",
    title: "Open Road",
    artist: "Horizon Club",
    genre: "pop",
    mood: "energy",
    duration: "0:45",
    cover: "assets/covers/cover6.jpg",
    src: "assets/audio/track6.mp3",
  },
  {
    id: "signal-left",
    title: "Signal Left",
    artist: "Freq Lab",
    genre: "electronic",
    mood: "energy",
    duration: "0:45",
    cover: "assets/covers/cover7.jpg",
    src: "assets/audio/track7.mp3",
  },
  {
    id: "soft-rain",
    title: "Soft Rain",
    artist: "Quiet Yard",
    genre: "lofi",
    mood: "focus",
    duration: "0:45",
    cover: "assets/covers/cover8.jpg",
    src: "assets/audio/track8.mp3",
  },
];

const moods = [
  {
    id: "night",
    title: "Tungi ritm",
    blurb: "Kecha uchun sekin va chuqur ovozlar.",
    image: "assets/covers/mood1.jpg",
  },
  {
    id: "focus",
    title: "Diqqat",
    blurb: "Ishlash va o‘qish uchun yumshoq loop.",
    image: "assets/covers/mood2.jpg",
  },
  {
    id: "energy",
    title: "Energiya",
    blurb: "Harakat va mashq uchun kuchli beat.",
    image: "assets/covers/mood3.jpg",
  },
];

const els = {
  tracklist: document.getElementById("tracklist"),
  moodRail: document.getElementById("moodRail"),
  searchInput: document.getElementById("searchInput"),
  playFeatured: document.getElementById("playFeatured"),
  player: document.getElementById("player"),
  playerCover: document.getElementById("playerCover"),
  playerTitle: document.getElementById("playerTitle"),
  playerArtist: document.getElementById("playerArtist"),
  playBtn: document.getElementById("playBtn"),
  prevBtn: document.getElementById("prevBtn"),
  nextBtn: document.getElementById("nextBtn"),
  seek: document.getElementById("seek"),
  currentTime: document.getElementById("currentTime"),
  duration: document.getElementById("duration"),
  audio: document.getElementById("audio"),
  year: document.getElementById("year"),
};

const state = {
  genre: "all",
  query: "",
  mood: null,
  index: -1,
  queue: [...tracks],
  seeking: false,
};

els.year.textContent = String(new Date().getFullYear());

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function visibleTracks() {
  return tracks.filter((track) => {
    const genreOk = state.genre === "all" || track.genre === state.genre;
    const moodOk = !state.mood || track.mood === state.mood;
    const q = state.query.trim().toLowerCase();
    const queryOk =
      !q ||
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q) ||
      track.genre.toLowerCase().includes(q);
    return genreOk && moodOk && queryOk;
  });
}

function renderTracks() {
  const list = visibleTracks();
  state.queue = list;

  if (!list.length) {
    els.tracklist.innerHTML =
      '<li class="empty-state">Hech narsa topilmadi. Qidiruvni o‘zgartiring.</li>';
    return;
  }

  els.tracklist.innerHTML = list
    .map((track, i) => {
      const playing = state.index >= 0 && tracks[state.index]?.id === track.id;
      return `
        <li class="track${playing ? " is-playing" : ""}" data-id="${track.id}" style="animation-delay:${i * 40}ms">
          <img class="track-cover" src="${track.cover}" alt="" width="52" height="52" loading="lazy" />
          <div class="track-info">
            <p class="track-title">${track.title}</p>
            <p class="track-meta">${track.artist} · ${track.genre}</p>
          </div>
          <span class="track-duration">${track.duration}</span>
        </li>
      `;
    })
    .join("");
}

function renderMoods() {
  els.moodRail.innerHTML = moods
    .map(
      (mood, i) => `
      <article class="mood" data-mood="${mood.id}" style="animation-delay:${0.1 + i * 0.08}s">
        <img src="${mood.image}" alt="" loading="lazy" />
        <div class="mood-copy">
          <h3>${mood.title}</h3>
          <p>${mood.blurb}</p>
        </div>
      </article>
    `
    )
    .join("");
}

function setPlayingUI(track) {
  els.player.dataset.empty = "false";
  els.playerCover.src = track.cover;
  els.playerTitle.textContent = track.title;
  els.playerArtist.textContent = track.artist;
  document.querySelectorAll(".track").forEach((row) => {
    row.classList.toggle("is-playing", row.dataset.id === track.id);
  });
}

async function playTrackById(id) {
  const absoluteIndex = tracks.findIndex((t) => t.id === id);
  if (absoluteIndex < 0) return;

  const track = tracks[absoluteIndex];
  state.index = absoluteIndex;
  setPlayingUI(track);

  const absoluteSrc = new URL(track.src, window.location.href).href;
  if (els.audio.src !== absoluteSrc) {
    els.audio.src = track.src;
  }

  try {
    await els.audio.play();
    els.player.classList.add("is-playing");
  } catch (err) {
    console.warn("Playback blocked or failed:", err);
    els.player.classList.remove("is-playing");
  }
}

function playFromQueue(offset) {
  if (!state.queue.length) return;
  const currentId = tracks[state.index]?.id;
  let qIndex = state.queue.findIndex((t) => t.id === currentId);
  if (qIndex < 0) qIndex = 0;
  else qIndex = (qIndex + offset + state.queue.length) % state.queue.length;
  playTrackById(state.queue[qIndex].id);
}

function togglePlay() {
  if (state.index < 0) {
    const first = visibleTracks()[0] || tracks[0];
    if (first) playTrackById(first.id);
    return;
  }

  if (els.audio.paused) {
    els.audio.play().then(() => els.player.classList.add("is-playing"));
  } else {
    els.audio.pause();
    els.player.classList.remove("is-playing");
  }
}

els.tracklist.addEventListener("click", (event) => {
  const row = event.target.closest(".track");
  if (!row) return;
  playTrackById(row.dataset.id);
});

els.moodRail.addEventListener("click", (event) => {
  const card = event.target.closest(".mood");
  if (!card) return;
  const mood = card.dataset.mood;
  state.mood = state.mood === mood ? null : mood;
  state.genre = "all";
  document.querySelectorAll(".filter").forEach((btn) => {
    const active = btn.dataset.genre === "all";
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  renderTracks();
  document.getElementById("listen")?.scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.genre = btn.dataset.genre;
    state.mood = null;
    document.querySelectorAll(".filter").forEach((other) => {
      const active = other === btn;
      other.classList.toggle("is-active", active);
      other.setAttribute("aria-selected", String(active));
    });
    renderTracks();
  });
});

els.searchInput.addEventListener("input", () => {
  state.query = els.searchInput.value;
  renderTracks();
});

els.playFeatured.addEventListener("click", () => {
  playTrackById(tracks[0].id);
});

els.playBtn.addEventListener("click", togglePlay);
els.prevBtn.addEventListener("click", () => playFromQueue(-1));
els.nextBtn.addEventListener("click", () => playFromQueue(1));

els.audio.addEventListener("timeupdate", () => {
  if (state.seeking) return;
  const { currentTime, duration } = els.audio;
  els.currentTime.textContent = formatTime(currentTime);
  if (Number.isFinite(duration)) {
    els.duration.textContent = formatTime(duration);
    els.seek.value = String((currentTime / duration) * 100 || 0);
  }
});

els.audio.addEventListener("ended", () => playFromQueue(1));
els.audio.addEventListener("pause", () => els.player.classList.remove("is-playing"));
els.audio.addEventListener("play", () => els.player.classList.add("is-playing"));

els.seek.addEventListener("input", () => {
  state.seeking = true;
});

els.seek.addEventListener("change", () => {
  const { duration } = els.audio;
  if (Number.isFinite(duration)) {
    els.audio.currentTime = (Number(els.seek.value) / 100) * duration;
  }
  state.seeking = false;
});

renderMoods();
renderTracks();
