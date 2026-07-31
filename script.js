// ❤️ Typewriter Effect
// Defensive check: if the Typed.js CDN fails to load (ad-blocker, offline,
// CDN outage), calling `new Typed(...)` directly would throw a ReferenceError
// and stop the ENTIRE script.js file from running — including the surprise
// button listener below. Guarding it keeps the rest of the page working.
if (typeof Typed !== "undefined") {
    new Typed("#typing", {
        strings: [
            "For my favourite hooman being ❤️",
            "Thank you for making everything better.",
            "Every moment with you is my favourite memory.",
            "You are my safe place, my happiness, and my home.",
            "I love you so much, Jaanu ❤️",
            "Happy Girlfriend's Day 💖"
        ],
        typeSpeed: 45,
        backSpeed: 20,
        backDelay: 1800,
        loop: true
    });
} else {
    console.warn("Typed.js did not load — typing effect skipped.");
}

const btn = document.getElementById("surpriseBtn");
const music = document.getElementById("music");

btn.addEventListener("click", () => {

    // Play music (browsers block autoplay without a user gesture, but this
    // runs inside a click handler, so it's allowed). Once started, it will
    // keep playing through scrolling — nothing needs to re-trigger it.
    music.play().catch((err) => {
        console.warn("Music failed to play:", err.message);
    });

    // Confetti 🎉 — guarded the same way as Typed.js above, so a blocked
    // or failed CDN script can't stop the reveal/scroll from happening.
    if (typeof confetti === "function") {
        confetti({
            particleCount: 250,
            spread: 120,
            origin: { y: 0.6 }
        });
    } else {
        console.warn("canvas-confetti did not load — confetti skipped.");
    }

    // Show hidden sections
    document.querySelectorAll(".hidden").forEach(section => {
        section.style.display = "block";
    });

    // Smooth scroll
    document.getElementById("gallery").scrollIntoView({
        behavior: "smooth"
    });

});

// ❤️ Floating Hearts
function createHeart() {

    const heart = document.createElement("div");

    heart.classList.add("heart");

    heart.innerHTML = ["❤️", "💖", "💕", "💗", "💞"][Math.floor(Math.random() * 5)];

    heart.style.left = Math.random() * 100 + "vw";

    heart.style.animationDuration = (4 + Math.random() * 4) + "s";

    heart.style.fontSize = (18 + Math.random() * 22) + "px";

    document.body.appendChild(heart);

    setTimeout(() => {
        heart.remove();
    }, 8000);

}

setInterval(createHeart, 300);

// 📸 Slideshow
const slides = document.querySelectorAll(".slide");

let current = 0;

if (slides.length > 0) {
    setInterval(() => {

        slides[current].classList.remove("active");

        current++;

        if (current >= slides.length) {
            current = 0;
        }

        slides[current].classList.add("active");

    }, 3000);
}

// ✨ Reveal sections with animation
const hiddenSections = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.animate([
                { opacity: 0, transform: "translateY(40px)" },
                { opacity: 1, transform: "translateY(0)" }
            ], {
                duration: 800,
                fill: "forwards"
            });

        }

    });

});

hiddenSections.forEach(section => {
    observer.observe(section);
});

// 🎶 Playlist: swipeable song cards sharing one audio player
const playlistSlider = document.getElementById("playlistSlider");
const playlistAudio = document.getElementById("playlistAudio");
const songCards = document.querySelectorAll(".song-card");
const playlistDotsWrap = document.getElementById("playlistDots");

if (playlistSlider && playlistAudio && songCards.length > 0) {

    let activeCard = null; // the card currently loaded/playing in playlistAudio

    // Build the dot indicators, one per song
    songCards.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        playlistDotsWrap.appendChild(dot);
    });
    const dots = playlistDotsWrap.querySelectorAll(".dot");

    function formatTime(sec) {
        if (!isFinite(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function resetCard(card) {
        const btn = card.querySelector(".play-btn");
        const fill = card.querySelector(".progress-fill");
        const time = card.querySelector(".time");
        btn.textContent = "▶";
        fill.style.width = "0%";
        time.textContent = "0:00 / 0:00";
    }

    songCards.forEach(card => {
        const btn = card.querySelector(".play-btn");
        const progressBar = card.querySelector(".progress-bar");
        const progressFill = card.querySelector(".progress-fill");
        const timeLabel = card.querySelector(".time");
        const src = card.dataset.src;

        btn.addEventListener("click", () => {

            // Switching to a different song: reset the previous card's UI
            if (activeCard && activeCard !== card) {
                resetCard(activeCard);
            }

            // Toggle play/pause on the currently active song
            if (activeCard === card && !playlistAudio.paused) {
                playlistAudio.pause();
                return;
            }

            // Load a new song only if it isn't already loaded
            if (activeCard !== card) {
                playlistAudio.src = src;
                activeCard = card;
            }

            // Pause the background music so it doesn't overlap the playlist
            music.pause();

            playlistAudio.play().catch(err => {
                console.warn("Playlist song failed to play:", err.message);
            });
        });

        // Let the user seek by clicking/tapping anywhere on this card's bar
        progressBar.addEventListener("click", (e) => {
            if (activeCard !== card || !playlistAudio.duration) return;
            const rect = progressBar.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            playlistAudio.currentTime = ratio * playlistAudio.duration;
        });
    });

    playlistAudio.addEventListener("play", () => {
        if (activeCard) activeCard.querySelector(".play-btn").textContent = "⏸";
    });

    playlistAudio.addEventListener("pause", () => {
        if (activeCard) activeCard.querySelector(".play-btn").textContent = "▶";
    });

    playlistAudio.addEventListener("ended", () => {
        if (activeCard) resetCard(activeCard);
        music.play().catch(() => {});
    });

    playlistAudio.addEventListener("timeupdate", () => {
        if (!activeCard || !playlistAudio.duration) return;
        const pct = (playlistAudio.currentTime / playlistAudio.duration) * 100;
        activeCard.querySelector(".progress-fill").style.width = pct + "%";
        activeCard.querySelector(".time").textContent =
            `${formatTime(playlistAudio.currentTime)} / ${formatTime(playlistAudio.duration)}`;
    });

    // Highlight the dot for whichever card is centered as the user swipes
    let scrollTimeout;
    playlistSlider.addEventListener("scroll", () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const sliderCenter = playlistSlider.scrollLeft + playlistSlider.clientWidth / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;

            songCards.forEach((card, i) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(sliderCenter - cardCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = i;
                }
            });

            dots.forEach(d => d.classList.remove("active"));
            dots[closestIndex].classList.add("active");
        }, 100);
    });

    // Tapping a dot swipes the slider to that song
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            songCards[i].scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        });
    });
}

// 🎥 Avoid overlapping audio: pause the background song while the video
// plays, and resume it once the video is paused or finishes.
const memoryVideo = document.querySelector(".video-wrapper video");

if (memoryVideo) {
    memoryVideo.addEventListener("play", () => {
        music.pause();
    });

    memoryVideo.addEventListener("pause", () => {
        music.play().catch(() => {});
    });

    memoryVideo.addEventListener("ended", () => {
        music.play().catch(() => {});
    });
}
