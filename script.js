const correctCode = "NYXORA";

const input = document.getElementById("codeInput");
const body = document.body;
const message = document.getElementById("message");

const music = new Audio("sfx/music.mp3");
music.loop = true;
music.volume = 0.4;

// Start music after interaction
document.addEventListener("click", () => {
    music.play();
}, { once: true });

function playSound(src, volume = 1) {
    const s = new Audio(src);
    s.volume = volume;
    s.play();
}

function speak(text, rate = 0.9, pitch = 0.8) {
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = rate;   // speed (0.1 – 10)
    utterance.pitch = pitch; // tone (0 – 2)
    utterance.volume = 1;

    // Optional: choose a specific voice
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        utterance.voice = voices.find(v => v.name.includes("Google")) || voices[0];
    }

    speechSynthesis.speak(utterance);
}


function fadeOutMusic() {
    let fade = setInterval(() => {
        if (music.volume > 0.02) {
            music.volume -= 0.02;
        } else {
            music.pause();
            clearInterval(fade);
        }
    }, 100);
}

async function downloadHiddenFile() {
    const response = await fetch("hidden/payload.txt");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payload.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

// Tracking glitch
setInterval(() => {
    if (Math.random() < 0.08) {
        document.body.style.transform = "translateX(3px)";
        setTimeout(() => {
            document.body.style.transform = "translateX(0)";
        }, 120);
    }
}, 500);

input.addEventListener("input", () => {
    input.value = input.value.replace(/[^a-zA-Z]/g, "").toUpperCase();

    if (input.value.length <= 6) {
        playSound("sfx/type.mp3", 0.6);
    }

    if (input.value.length === 6) {
        if (input.value === correctCode) {

    playSound("sfx/accessgranted.mp3", 1);
    fadeOutMusic();

    message.classList.add("show");
    input.disabled = true;

    setTimeout(() => {
        downloadHiddenFile();
    }, 1200);

    // Dramatic delay before transition
    setTimeout(() => {
        document.body.style.transition = "opacity 2s ease";
        document.body.style.opacity = "0";
    }, 2500);

    // Redirect to pt2
    setTimeout(() => {
        window.location.href = "pt2.html";
    }, 4500);


        } else {

            playSound("sfx/error.mp3", 1);

            body.classList.remove("idle");
            body.style.background = "#8b0000";

            input.classList.add("shake", "distort");

            setTimeout(() => {
                body.style.background = "#000";
                input.classList.remove("distort");
            }, 200);

            setTimeout(() => {
                input.classList.remove("shake");
                input.value = "";
                body.classList.add("idle");
            }, 600);
        }
    }
});
