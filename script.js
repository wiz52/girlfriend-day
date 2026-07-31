// ❤️ Typewriter Effect
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

const btn = document.getElementById("surpriseBtn");
const music = document.getElementById("music");

btn.addEventListener("click", () => {

    // Play music
    music.play().catch(()=>{});

    // Confetti 🎉
    confetti({
        particleCount:250,
        spread:120,
        origin:{y:0.6}
    });

    // Show hidden sections
    document.querySelectorAll(".hidden").forEach(section=>{
        section.style.display="block";
    });

    // Smooth scroll
    document.getElementById("gallery").scrollIntoView({
        behavior:"smooth"
    });

});

// ❤️ Floating Hearts
function createHeart(){

    const heart=document.createElement("div");

    heart.classList.add("heart");

    heart.innerHTML=["❤️","💖","💕","💗","💞"][Math.floor(Math.random()*5)];

    heart.style.left=Math.random()*100+"vw";

    heart.style.animationDuration=(4+Math.random()*4)+"s";

    heart.style.fontSize=(18+Math.random()*22)+"px";

    document.body.appendChild(heart);

    setTimeout(()=>{
        heart.remove();
    },8000);

}

setInterval(createHeart,300);

// 📸 Slideshow
const slides=document.querySelectorAll(".slide");

let current=0;

setInterval(()=>{

    slides[current].classList.remove("active");

    current++;

    if(current>=slides.length){
        current=0;
    }

    slides[current].classList.add("active");

},3000);

// ✨ Reveal sections with animation
const hiddenSections=document.querySelectorAll(".hidden");

const observer=new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.animate([
                {opacity:0, transform:"translateY(40px)"},
                {opacity:1, transform:"translateY(0)"}
            ],{
                duration:800,
                fill:"forwards"
            });

        }

    });

});

hiddenSections.forEach(section=>{
    observer.observe(section);
});
