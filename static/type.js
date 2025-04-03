const words =
    "apple banana mango grape berry orange pear peach melon lemon book pen bag chair table clock phone cup spoon light dog cat cow rat fish frog bird lion bear duck sun moon star rain tree wind cloud leaf rock sand red blue pink green black white gray brown yellow purple man woman boy girl mom dad baby teacher doctor farmer singer dancer player friend love joy fun smart wise fast slow big small hot cold young old thick thin high low left right up down good bad new first last now then soon later today tomorrow yesterday morning night evening noon minute hour second week month year storm thunder land sea hill river mountain forest island beach desert city town village home house school park shop car bus bike train boat plane strong weak open close push pull start stop win lose come go take give buy sell laugh cry think know see hear smell taste touch feel ask answer shout whisper sing dance jump ride drive fly dig build break fix help share teach learn lead follow join leave fight play work rest wait hurry look find show hide send bring keep hold put drop cut tie untie destroy write draw paint count add subtract multiply divide spell match mix change move turn grow shrink freeze melt boil cook bake fry peel wash clean dirty soft hard bright dull wide narrow deep shallow full empty near far behind beside under over inside outside above below before after anywhere everywhere nowhere north south east west spring summer autumn winter hello goodbye please sorry welcome great nice best better fine okay cool awesome amazing fantastic easy difficult heavy quick early safe dangerous maybe sure yes no".split(
        " "
    );
const wordsCount = words.length;
const gameTime = 60 * 1000;
window.timer = null;
window.gameStart = null;

let wrong_words = [];
let total_words = 0;
let total_wrong_words = 0;

function calculateStats() {
    let wpm = total_words;
    let accuracy =
        total_words > 0
            ? ((total_words - total_wrong_words) / total_words) * 100
            : 0;
    let errorRate = total_words > 0 ? (total_wrong_words / total_words) * 100 : 0;

    let gameStats = {
        wpm: wpm,
        accuracy: accuracy.toFixed(2),
        errorRate: errorRate.toFixed(2),
        total_words: total_words,
        total_wrong_words: total_wrong_words,
        wrong_words: wrong_words,
    };

    fetch("/gameover", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(gameStats),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.redirect) {
                window.location.href = data.redirect;
            }
        })
        .catch((error) => console.error("Error:", error));
}

function gameOver() {
    clearInterval(window.timer);
    addClass(document.getElementById("game"), "over");
    document.getElementById("typing-box").value = "";
    document.getElementById("typing-box").disabled = true;

    calculateStats();
}

function randomWord() {
    const randomIndex = Math.floor(Math.random() * wordsCount);
    return words[randomIndex];
}

function formatWord(word) {
    return `<div class="word">${word}</div>`;
}

function addClass(el, name) {
    el.className += " " + name;
}

function removeclass(el, name) {
    el.className = el.className.replace(name, "");
}

function newGame() {
    document.getElementById("typing-box").value = "";
    document.getElementById("words").innerHTML = "";
    for (let i = 0; i < 500; i++) {
        document.getElementById("words").innerHTML += formatWord(randomWord());
    }

    addClass(document.querySelector(".word"), "current");
}

function keyboard() {
    let x = document.getElementById("typing-box").value;
    let currentWord = document.querySelector(".word.current");

    if (currentWord.getBoundingClientRect().top > 300) {
        const words = document.getElementById("words");
        const margin = parseInt(words.style.marginTop || "0px");
        words.style.marginTop = margin - 40 + "px";
    }

    if (x.trim().length > 0) {
        total_words++;
        if (currentWord.innerHTML == x.trim()) {
            addClass(document.querySelector(".current"), "correct");
        } else {
            addClass(document.querySelector(".current"), "wrong");
            total_wrong_words++;
            wrong_words.push(currentWord.innerHTML);
        }

        removeclass(currentWord, "current");
        addClass(currentWord.nextSibling, "current");

        document.getElementById("typing-box").value = "";
    }
}

function typed(event) {
    if (!window.timer) {
        window.timer = setInterval(() => {
            if (!window.gameStart) {
                window.gameStart = new Date().getTime();
            }

            const currentTime = new Date().getTime();
            const msPassed = currentTime - window.gameStart;
            const sPassed = Math.round(msPassed / 1000);
            const sLeft = gameTime / 1000 - sPassed;

            if (sLeft < 0) {
                gameOver();
                return;
            }
            document.getElementById("timer").innerHTML = sLeft + "";
        }, 1000);
    }
    if (event.key == " ") {
        keyboard();
    }
}
