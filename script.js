// Track mission status
const missions = {
    breathing: { completed: false, progress: 0 },
    memory: { completed: false, progress: 0 },
    funnyMedia: { completed: false, progress: 0 },
};

// Funny media content (replace with your own photos and videos)
const funnyMedia = [
    { type: "image", src: "1.jpg" },
    { type: "image", src: "2.jpg" },
    { type: "video", src: "3.mp4" },
    { type: "video", src: "4.mp4" },
    { type: "image", src: "5.jpg" },
];

let currentMediaIndex = 0;

// Update overall progress
function updateOverallProgress() {
    const completedCount = Object.values(missions).filter(
        (mission) => mission.completed
    ).length;
    const progressPercent = (completedCount / 3) * 100;

    document.getElementById(
        "overall-progress"
    ).style.width = `${progressPercent}%`;
    document.getElementById(
        "progress-text"
    ).textContent = `Progress: ${completedCount}/3 missions complete`;

    // Show confetti for each completed mission
    if (completedCount > 0) {
        triggerConfetti();
    }
}

// Update individual mission progress
function updateMissionProgress(mission, progress, status) {
    missions[mission].progress = progress;

    // Check if the progress element exists
    const progressElement = document.getElementById(`${mission}-progress`);
    if (progressElement) {
        progressElement.style.width = `${progress}%`;
    } else {
        console.error(`Element with id "${mission}-progress" not found.`);
    }

    // Check if the status element exists
    const statusElement = document.getElementById(`${mission}-status`);
    if (statusElement) {
        statusElement.textContent = `Status: ${status}`;

        if (status === "Completed") {
            statusElement.innerHTML = `Status: <span style="color: #4cd97b; font-weight: bold;">✓ ${status}</span>`;
        } else if (status === "In progress") {
            statusElement.innerHTML = `Status: <span style="color: #ff9b7d; font-weight: bold;">⌛ ${status}</span>`;
        } else if (status === "Started") {
            statusElement.innerHTML = `Status: <span style="color: #ff7bac; font-weight: bold;">🚀 ${status}</span>`;
        }
    } else {
        console.error(`Element with id "${mission}-status" not found.`);
    }
}
// Mark mission as complete and show appropriate gift
function completeMission(mission) {
    missions[mission].completed = true;
    missions[mission].progress = 100;
    updateMissionProgress(mission, 100, "Completed");
    updateOverallProgress();

    // Show the appropriate gift based on which mission was completed
    if (mission === "breathing") {
        showGift(1);
    } else if (mission === "memory") {
        showGift(2);
    } else if (mission === "funnyMedia") {
        showGift(3);
    }
}

// Function to show a specific gift
function showGift(giftNumber) {
    openModal("gift-modal");

    // Reset all gift boxes to initial state
    document.querySelectorAll(".gift-box").forEach((box) => {
        box.classList.remove("open");
        box.classList.add("hidden");
    });
    document.querySelectorAll("[id^='gift-link-']").forEach((link) => {
        link.classList.add("hidden");
    });

    // Show only the relevant gift box
    const giftBox = document.getElementById(`gift-box-${giftNumber}`);
    giftBox.classList.remove("hidden");

    // Auto-open the gift after a short delay
    setTimeout(() => {
        giftBox.classList.add("open");
        document
            .getElementById(`gift-link-${giftNumber}`)
            .classList.remove("hidden");
    }, 1000);
}

// Modal handling
function openModal(modalId) {
    document.getElementById(modalId).classList.remove("hidden");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden");
}

// Set up event listeners for mission buttons
document.getElementById("breathing-btn").addEventListener("click", () => {
    openModal("breathing-modal");
    updateMissionProgress("breathing", 10, "Started");
});

document.getElementById("memory-btn").addEventListener("click", () => {
    openModal("memory-modal");
    updateMissionProgress("memory", 10, "Started");
    if (!document.querySelector(".memory-card")) {
        setupMemoryGame();
    }
});

document.getElementById("funny-media-btn").addEventListener("click", () => {
    openModal("funny-media-modal");
    updateMissionProgress("funnyMedia", 10, "Started");
    showNextMedia();
});

// Close buttons
document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
        const modalId = this.closest(".modal").id;
        closeModal(modalId);
    });
});

// Breathing Exercise - Updated Version
let breathCount = 0;
let isBreathingIn = true;

document
    .getElementById("start-breathing")
    .addEventListener("click", function () {
        const breathingCircle = document.getElementById("breathing-circle");
        const breathingText = document.getElementById("breathing-text");
        this.classList.add("hidden");

        breathingText.textContent = "Breathe in...";
        updateMissionProgress("breathing", 10, "In progress");

        breathCount = 0;
        document.getElementById(
            "breathing-instruction"
        ).textContent = `Breath cycle: ${breathCount}/3`;

        breathingCircle.style.animation = "breathe 8s infinite ease-in-out";

        // Remove any existing event listener to prevent duplicates
        breathingCircle.removeEventListener(
            "animationiteration",
            handleBreathCycle
        );

        // Add the event listener
        breathingCircle.addEventListener(
            "animationiteration",
            handleBreathCycle
        );

        // Change text every 4 seconds (half of the animation duration)
        setInterval(() => {
            isBreathingIn = !isBreathingIn;
            breathingText.textContent = isBreathingIn
                ? "Breathe in..."
                : "Breathe out...";
        }, 4000);
    });

function handleBreathCycle() {
    breathCount++;
    document.getElementById(
        "breathing-instruction"
    ).textContent = `Breath cycle: ${breathCount}/3`;
    updateMissionProgress("breathing", 10 + breathCount * 18, "In progress");

    if (breathCount >= 3) {
        const breathingCircle = document.getElementById("breathing-circle");
        breathingCircle.style.animation = "none";
        breathingCircle.removeEventListener(
            "animationiteration",
            handleBreathCycle
        );

        document.getElementById("breathing-text").textContent = "Great job! 🌟";
        document.getElementById("breathing-instruction").textContent =
            "You completed the breathing exercise!";
        document
            .getElementById("complete-breathing")
            .classList.remove("hidden");
    }
}

document
    .getElementById("complete-breathing")
    .addEventListener("click", function () {
        completeMission("breathing");
        closeModal("breathing-modal");
        document.getElementById("breathing-circle").style.animation = "none";
        document.getElementById("start-breathing").classList.remove("hidden");
        document.getElementById("complete-breathing").classList.add("hidden");
    });

// Memory Game - Fixed Version
const emojis = ["❤️", "😊", "🌟", "🎁", "🌈", "🦄", "🐱", "🍦", "🍭"];
let memoryCards = [];
let flippedCards = [];
let matchedPairs = 0;

function setupMemoryGame() {
    const gameContainer = document.getElementById("memory-game");
    gameContainer.innerHTML = "";

    // Create shuffled pairs
    const cardValues = [...emojis.slice(0, 3), ...emojis.slice(0, 3)];
    shuffleArray(cardValues);

    memoryCards = [];
    flippedCards = [];
    matchedPairs = 0;

    // Create the cards
    cardValues.forEach((value, index) => {
        const card = document.createElement("div");
        card.classList.add("memory-card");
        card.dataset.value = value;
        card.dataset.index = index;
        card.textContent = value;

        card.addEventListener("click", () => flipCard(card));

        gameContainer.appendChild(card);
        memoryCards.push(card);
    });

    document.getElementById(
        "memory-instruction"
    ).textContent = `Matches Found: 0/3`;
    updateMissionProgress("memory", 10, "Started");
}

function flipCard(card) {
    if (
        card.classList.contains("flipped") ||
        card.classList.contains("matched") ||
        flippedCards.length >= 2
    )
        return;

    card.classList.add("flipped");
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        checkForMatch();
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;

    if (card1.dataset.value === card2.dataset.value) {
        setTimeout(() => {
            card1.classList.add("matched");
            card2.classList.add("matched");
            flippedCards = [];

            matchedPairs++;
            document.getElementById(
                "memory-instruction"
            ).textContent = `Matches Found: ${matchedPairs}/3`;
            updateMissionProgress(
                "memory",
                10 + matchedPairs * 30,
                "In progress"
            );

            if (matchedPairs === 3) {
                document
                    .getElementById("complete-memory")
                    .classList.remove("hidden");
                document.getElementById(
                    "memory-instruction"
                ).innerHTML = `<span style="color: #4cd97b; font-weight: bold;">All matches found! 🎉</span>`;
            }
        }, 500);
    } else {
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");
            flippedCards = [];
        }, 1000);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

document
    .getElementById("complete-memory")
    .addEventListener("click", function () {
        completeMission("memory");
        closeModal("memory-modal");
    });

// Funny Media Showcase
function showNextMedia() {
    const mediaContent = document.getElementById("media-content");
    mediaContent.innerHTML = "";

    if (currentMediaIndex >= funnyMedia.length) {
        document
            .getElementById("complete-funny-media")
            .classList.remove("hidden");
        document.getElementById("next-media").classList.add("hidden");
        mediaContent.innerHTML =
            "<p>That's all the funny media for now! Hope you enjoyed it! 😊</p>";
        updateMissionProgress("funnyMedia", 100, "Completed"); // Mark mission as complete
        return;
    }

    const media = funnyMedia[currentMediaIndex];
    if (media.type === "image") {
        mediaContent.innerHTML = `<img src="${media.src}" alt="Funny Image" style="max-width: 100%; border-radius: 10px;">`;
    } else if (media.type === "video") {
        mediaContent.innerHTML = `<video controls autoplay loop style="max-width: 100%; border-radius: 10px;">
            <source src="${media.src}" type="video/mp4">
            Your browser does not support the video tag.
        </video>`;
    }

    currentMediaIndex++;
    const progress = Math.min(100, 10 + currentMediaIndex * 20);
    updateMissionProgress("funnyMedia", progress, "In progress");
}

document.getElementById("next-media").addEventListener("click", showNextMedia);
document
    .getElementById("complete-funny-media")
    .addEventListener("click", function () {
        completeMission("funnyMedia");
        closeModal("funny-media-modal");
    });

// Close gift modal button
document.getElementById("close-gift").addEventListener("click", () => {
    closeModal("gift-modal");
});

// Confetti Effect using canvas-confetti library
function triggerConfetti() {
    // Ensure the canvas is on the top layer
    const existingCanvas = document.querySelector("canvas");
    if (existingCanvas) {
        existingCanvas.style.zIndex = "9999";
    }

    confetti({
        particleCount: 1000,
        spread: 100,
        origin: { y: 0.6 },
    });
}
