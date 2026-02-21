const dialogue = document.getElementById("dialogue");
const simon = document.getElementById("simon");
const buttons = document.querySelectorAll(".simon-btn");
const waveText = document.getElementById("waveText");

//////////////////////////////////////////////////
// AUDIO
//////////////////////////////////////////////////

const music = new Audio("sfx/musicpt2.mp3");
music.loop = true;
music.volume = 0.4;

const musicWin = new Audio("sfx/musicpt2.5.mp3");
musicWin.loop = true;
musicWin.volume = 0;

const staticNoise = new Audio("sfx/static.mp3");
staticNoise.loop = true;
staticNoise.volume = 0;

const beepMachine = "sfx/beepmachine.mp3";
const beepPlayer = "sfx/beepplayer.mp3";
const beepError = "sfx/beeperror.mp3";

//////////////////////////////////////////////////
// STATE
//////////////////////////////////////////////////

let wave = 1;
let sequence = [];
let playerIndex = 0;
let playing = false;
let impossibleMode = false;
let surviveTimer = null;
let gameStarted = false;

//////////////////////////////////////////////////
// USER ACTIVATION
//////////////////////////////////////////////////

document.addEventListener("click", startExperience, { once: true });

function startExperience() {
    if (gameStarted) return;
    gameStarted = true;

    music.play();
    speechSynthesis.getVoices();

    playDialogue(introLines);
}

//////////////////////////////////////////////////
// AUDIO HELPERS
//////////////////////////////////////////////////

function playSound(src) {
    const s = new Audio(src);
    s.currentTime = 0;
    s.play();
}

function fadeAudio(audio, target, duration) {
    const stepTime = 50;
    const steps = duration / stepTime;
    const volumeStep = (target - audio.volume) / steps;

    const fade = setInterval(() => {
        audio.volume += volumeStep;

        if (
            (volumeStep > 0 && audio.volume >= target) ||
            (volumeStep < 0 && audio.volume <= target)
        ) {
            audio.volume = target;
            clearInterval(fade);
        }
    }, stepTime);
}

//////////////////////////////////////////////////
// TTS
//////////////////////////////////////////////////

function speak(text, rate = 0.82, pitch = 0.35) {

    speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "es-ES";
    utter.rate = rate;
    utter.pitch = pitch;
    utter.volume = 1;

    const voices = speechSynthesis.getVoices();
    const spanish = voices.find(v => v.lang.startsWith("es"));
    if (spanish) utter.voice = spanish;

    speechSynthesis.speak(utter);
    return utter;
}

//////////////////////////////////////////////////
// TEXT
//////////////////////////////////////////////////

function showText(text) {
    dialogue.style.opacity = "0";
    dialogue.textContent = text;

    setTimeout(() => {
        dialogue.style.opacity = "1";
    }, 50);
}

function typeSlow(text, speed = 180) {
    dialogue.textContent = "";
    let i = 0;

    const interval = setInterval(() => {
        dialogue.textContent += text[i];
        i++;

        if (i >= text.length) {
            clearInterval(interval);
        }

    }, speed);
}

//////////////////////////////////////////////////
// SIMON GAME
//////////////////////////////////////////////////

function startSimon() {
    dialogue.style.display = "none";
    simon.style.display = "grid";
    waveText.style.opacity = "1";
    nextWave();
}

function nextWave() {
    waveText.textContent = "ONDA " + wave;
    waveText.style.color = "white";

    sequence = [];
    playerIndex = 0;
    impossibleMode = false;

    let length = wave + 2;

    for (let i = 0; i < length; i++) {
        sequence.push(Math.floor(Math.random() * 4));
    }

    playSequence();
}

function playSequence() {
    playing = true;
    let i = 0;

    let speed = 700 - wave * 120;
    if (speed < 180) speed = 180;

    if (wave === 5) {
        impossibleMode = true;
        speed = 70;
    }

    const interval = setInterval(() => {
        const id = sequence[i];
        const btn = buttons[id];

        btn.classList.add("active");
        playSound(beepMachine);

        setTimeout(() => btn.classList.remove("active"), speed / 2);

        i++;
        if (i >= sequence.length) {
            clearInterval(interval);
            playing = false;

            if (wave === 5) {
                startImpossiblePhase();
            }
        }
    }, speed);
}

//////////////////////////////////////////////////
// PLAYER INPUT
//////////////////////////////////////////////////

buttons.forEach(btn => {
    btn.addEventListener("click", () => {

        if (playing) return;

        const id = parseInt(btn.dataset.id);
        playSound(beepPlayer);

        if (impossibleMode) {
            fail();
            return;
        }

        if (id === sequence[playerIndex]) {
            playerIndex++;

            if (playerIndex >= sequence.length) {
                wave++;
                if (wave > 5) return;
                setTimeout(nextWave, 800);
            }

        } else {
            fail();
        }
    });
});

//////////////////////////////////////////////////
// FAIL
//////////////////////////////////////////////////

function fail() {

    const errorAudio = new Audio(beepError);
    errorAudio.play();

    buttons.forEach(btn => btn.disabled = true);

    document.body.style.backgroundColor = "#400";

    setTimeout(() => {
        document.body.style.backgroundColor = "#000";
    }, 120);

    errorAudio.onended = () => {
        document.body.style.transition = "opacity 0.8s ease";
        document.body.style.opacity = "0";

        setTimeout(() => location.reload(), 800);
    };
}

//////////////////////////////////////////////////
// IMPOSSIBLE PHASE
//////////////////////////////////////////////////

function startImpossiblePhase() {
    waveText.textContent = "ONDA 5";
    waveText.style.color = "red";

    surviveTimer = setTimeout(() => {
        win();
    }, 20000);
}

//////////////////////////////////////////////////
// WIN SEQUENCE
//////////////////////////////////////////////////

function win() {

    simon.style.display = "none";
    waveText.style.opacity = "0";
    dialogue.style.display = "block";

    showText("ENTENDISTE.");
    speak("Entendiste.");

    fadeAudio(music, 0, 4000);

    setTimeout(() => {
        music.pause();

        musicWin.play();
        fadeAudio(musicWin, 0.5, 5000);

        setTimeout(startPoemSequence, 5000);

    }, 4500);
}

//////////////////////////////////////////////////
// POEM
//////////////////////////////////////////////////

const poemLines = [
    "Éramos dos bajo la carpa agrietada.",
    "Dos máscaras, una sonrisa compartida.",
    "Él hacía reír al público.",
    "Yo escuchaba ecos que nadie más oía.",
    "El circo giraba, y mi mente también.",
    "Las luces brillaban, pero algo se quebraba.",
    "Una noche crucé una puerta sin telón.",
    "Un presentador me esperaba tras bastidores.",
    "Dijo que el espectáculo nunca termina.",
    "Sentí la aguja como un aplauso helado.",
    "Y ahora..."
];

function startPoemSequence(index = 0) {

    if (index >= poemLines.length) {
        startFinalLine();
        return;
    }

    const text = poemLines[index];
    showText(text);

    const utter = speak(text, 0.65, 0.25);

    utter.onend = () => {
        setTimeout(() => {
            startPoemSequence(index + 1);
        }, 1200);
    };
}

//////////////////////////////////////////////////
// FINAL BREAK
//////////////////////////////////////////////////

function startFinalLine() {

    const finalLine = "¿Por qué no puedo sentir mi cuerpo...";

    staticNoise.play();
    fadeAudio(staticNoise, 0.6, 6000);

    typeSlow(finalLine, 200);

    const utter = speak(finalLine, 0.5, 0.35);

    setTimeout(() => {
        dialogue.textContent = finalLine;
    }, 2800);

    setTimeout(() => {

        speechSynthesis.cancel();
        musicWin.pause();

        dialogue.style.opacity = "0";

    }, 2800);
}

//////////////////////////////////////////////////
// INTRO
//////////////////////////////////////////////////

const introLines = [
    "Has llegado demasiado lejos.",
    "Escucha con atención.",
    "Esto no es un juego.",
    "La paciencia es la clave."
];

function playDialogue(lines, index = 0) {

    if (index >= lines.length) {
        setTimeout(startSimon, 1500);
        return;
    }

    const text = lines[index];

    showText(text);
    const utter = speak(text);

    utter.onend = () => {
        setTimeout(() => {
            playDialogue(lines, index + 1);
        }, 800);
    };
}
