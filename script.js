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

// 🎶 Playlist: swipeable song cards sharing one audio player.
// Positioning is driven entirely by JS (drag → index → calculated
// translateX), not native scrolling — this avoids mobile browsers'
// inconsistent handling of scroll range at the very start/end of a
// horizontally scrolling container, which is what blocked the first
// and last cards from ever reaching center with the old approach.
const playlistViewport = document.getElementById("playlistViewport");
const playlistTrack = document.getElementById("playlistTrack");
const playlistAudio = document.getElementById("playlistAudio");
const songCards = document.querySelectorAll(".song-card");
const playlistDotsWrap = document.getElementById("playlistDots");

if (playlistViewport && playlistTrack && playlistAudio && songCards.length > 0) {

    let activeCard = null; // the card currently loaded/playing in playlistAudio
    let currentIndex = 0;
    let baseTranslate = 0;   // translateX for the currently settled index
    let dragStartX = 0;
    let dragDeltaX = 0;
    let isDragging = false;
    let didDrag = false;     // distinguishes a real swipe from a tap (so play-btn taps still work)

    // Build the dot indicators, one per song
    songCards.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === 0) dot.classList.add("active");
        playlistDotsWrap.appendChild(dot);
    });
    const dots = playlistDotsWrap.querySelectorAll(".dot");

    // Where the track needs to sit (in px) so that songCards[index] is
    // dead-center in the viewport. Pure arithmetic — no scroll clamping,
    // so this works identically for the first and last card.
    function targetTranslateFor(index) {
        const card = songCards[index];
        const viewportWidth = playlistViewport.clientWidth;
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        return (viewportWidth / 2) - cardCenter;
    }

    function updateCenteredUI(index) {
        dots.forEach(d => d.classList.remove("active"));
        dots[index].classList.add("active");
        songCards.forEach(c => c.classList.remove("centered"));
        songCards[index].classList.add("centered");
    }

    function goToIndex(index, animate = true) {
        currentIndex = Math.max(0, Math.min(songCards.length - 1, index));
        baseTranslate = targetTranslateFor(currentIndex);
        playlistTrack.style.transition = animate ? "transform .4s cubic-bezier(.22,.9,.36,1)" : "none";
        playlistTrack.style.transform = `translateX(${baseTranslate}px)`;
        updateCenteredUI(currentIndex);
    }

    // Recalculate on load/resize/section-reveal — card widths (and so the
    // target translate values) depend on the viewport's actual size, which
    // is 0 until the "surprise" button reveals this section.
    function refreshPosition() {
        goToIndex(currentIndex, false);
    }

    if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(refreshPosition).observe(playlistViewport);
    }
    window.addEventListener("resize", refreshPosition);
    refreshPosition();

    // --- Drag handling (pointer events cover touch, mouse, and pen) ---
    playlistTrack.addEventListener("pointerdown", (e) => {
        isDragging = true;
        didDrag = false;
        dragStartX = e.clientX;
        dragDeltaX = 0;
        playlistTrack.style.transition = "none";
        playlistTrack.setPointerCapture(e.pointerId);
    });

    playlistTrack.addEventListener("pointermove", (e) => {
        if (!isDragging) return;
        dragDeltaX = e.clientX - dragStartX;
        if (Math.abs(dragDeltaX) > 6) didDrag = true;
        playlistTrack.style.transform = `translateX(${baseTranslate + dragDeltaX}px)`;
    });

    function endDrag() {
        if (!isDragging) return;
        isDragging = false;

        const threshold = playlistViewport.clientWidth * 0.15;
        if (dragDeltaX < -threshold) {
            goToIndex(currentIndex + 1);
        } else if (dragDeltaX > threshold) {
            goToIndex(currentIndex - 1);
        } else {
            goToIndex(currentIndex);
        }
    }

    playlistTrack.addEventListener("pointerup", endDrag);
    playlistTrack.addEventListener("pointercancel", endDrag);
    playlistTrack.addEventListener("pointerleave", () => {
        if (isDragging) endDrag();
    });

    // Tapping a dot jumps straight to that song
    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => goToIndex(i));
    });

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
        const src = card.dataset.src;

        btn.addEventListener("click", (e) => {
            if (didDrag) { e.preventDefault(); return; } // ignore accidental tap at the end of a swipe

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
            if (didDrag || activeCard !== card || !playlistAudio.duration) return;
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
