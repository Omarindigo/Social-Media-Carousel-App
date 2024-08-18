"use strict";

const carouselButtons = document.querySelectorAll(".carousel-btn");
const carouselButtonLeft = document.querySelector(".btn-left");
const carouselButtonRight = document.querySelector(".btn-right");
const modal = document.getElementById("instructions-modal");
const closeModalButton = document.getElementById("close-modal");
const overlayButton = document.getElementById("overlay-button");

let mediaIndex = 0; // Start from the first media item
let translateX = 0;
let media = [];
let userInteracted = false; // Track if the user has interacted
let ctrlPressed = false; // Track if the Ctrl key is pressed

// Define media items manually
media = [
    { src: "images/1.png", type: "images", description: "Image 1" },
    { src: "images/2.png", type: "images", description: "Image 2" },
    { src: "videos/Early Voting.mp4", type: "videos", description: "Video 1" },
    { src: "videos/UFTMIX.mp4", type: "videos", description: "Video 2" }
];

// Add event listeners to track user interaction
document.addEventListener('click', () => { userInteracted = true; });
document.addEventListener('keydown', handleKeydown);
document.addEventListener('keyup', handleKeyup);

// Gesture Variables
let touchstartX = 0;
let touchendX = 0;
let touchstartY = 0;
let touchendY = 0;
let lastTap = 0; // For detecting double-tap

// Keyboard Control Functions
function handleKeydown(event) {
    const currentMedia = document.querySelectorAll('.carousel-media')[mediaIndex];
    if (currentMedia.tagName === 'VIDEO') {
        switch(event.key) {
            case 'ArrowLeft':
                currentMedia.currentTime -= 10; // Rewind 10 seconds
                break;
            case 'ArrowRight':
                currentMedia.currentTime += 10; // Forward 10 seconds
                break;
            case 'ArrowUp':
                currentMedia.volume = Math.min(currentMedia.volume + 0.1, 1);
                break;
            case 'ArrowDown':
                currentMedia.volume = Math.max(currentMedia.volume - 0.1, 0);
                break;
            case ' ':
                event.preventDefault(); // Prevent default action of spacebar (scrolling)
                currentMedia.paused ? currentMedia.play() : currentMedia.pause();
                break;
        }
    }

    switch(event.key) {
        case '<':
        case ',':
            slideLeft();
            break;
        case '>':
        case '.':
            slideRight();
            break;
        case '/':
        case '?':
            toggleModal();
            break;
        case 'Control':
            ctrlPressed = true;
            if (currentMedia.tagName === 'VIDEO') {
                showControls(currentMedia);
            }
            break;
    }
}

function handleKeyup(event) {
    if (event.key === 'Control') {
        ctrlPressed = false;
        hideControls();
    }
}

function showControls(video) {
    video.controls = true;
}

function hideControls() {
    const carouselMedia = document.querySelectorAll('.carousel-media');
    carouselMedia.forEach(item => {
        if (item.tagName === 'VIDEO') {
            item.controls = false;
        }
    });
}

// Touch Gesture Functions
function handleTouchStart(event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
}

function handleTouchMove(event) {
    const touchmoveY = event.changedTouches[0].screenY;
    const currentMedia = document.querySelectorAll('.carousel-media')[mediaIndex];
    if (currentMedia.tagName === 'VIDEO' && touchmoveY < touchstartY - 50) { // Drag up detected
        showControls(currentMedia);
    }
}

function handleTouchEnd(event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    handleGesture();
}

function handleGesture() {
    const currentMedia = document.querySelectorAll('.carousel-media')[mediaIndex];
    const horizontalSwipe = touchendX - touchstartX;
    const verticalSwipe = touchendY - touchstartY;

    if (Math.abs(horizontalSwipe) > Math.abs(verticalSwipe)) {
        if (horizontalSwipe < 0) {
            slideRight();
        } else {
            slideLeft();
        }
    } else if (currentMedia.tagName === 'VIDEO') {
        if (verticalSwipe < 0) {
            currentMedia.volume = Math.min(currentMedia.volume + 0.1, 1);
        } else {
            currentMedia.volume = Math.max(currentMedia.volume - 0.1, 0);
        }
    }

    // Double-tap detection
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 300 && tapLength > 0 && currentMedia.tagName === 'VIDEO') {
        if (horizontalSwipe > 0) {
            currentMedia.currentTime -= 10; // Rewind 10 seconds
        } else {
            currentMedia.currentTime += 10; // Forward 10 seconds
        }
    }
    lastTap = currentTime;
}

function togglePlayPause(event) {
    const mediaItem = event.target;
    if (mediaItem.tagName === 'VIDEO') {
        if (mediaItem.paused) {
            mediaItem.play();
            mediaItem.volume = 1.0;
        } else {
            mediaItem.pause();
        }
    }
}

function playMainMedia() {
    const carouselMedia = document.querySelectorAll(".carousel-media");
    carouselMedia.forEach((item, index) => {
        if (item.tagName === 'VIDEO') {
            if (index === mediaIndex) {
                if (userInteracted) { // Only play if the user has interacted
                    item.play();
                    item.volume = 1.0;
                }
            } else {
                item.pause();
            }
        }
    });
}

function slideLeft() {
    const carouselMedia = document.querySelectorAll(".carousel-media");
    if (mediaIndex > 0) {
        mediaIndex--;
        translateX += getCarouselWidth();
        carouselMedia.forEach(item => item.style.transform = `translateX(${translateX}px)`);
        playMainMedia(); // Play the main media in view
    }
}

function slideRight() {
    const carouselMedia = document.querySelectorAll(".carousel-media");
    if (mediaIndex < carouselMedia.length - 1) {
        mediaIndex++;
        translateX -= getCarouselWidth();
        carouselMedia.forEach(item => item.style.transform = `translateX(${translateX}px)`);
        playMainMedia(); // Play the main media in view
    }
}

function getCarouselWidth() {
    return document.querySelector(".carousel").clientWidth;
}

function initializeCarousel() {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keyup', handleKeyup);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', updateMediaWidths);

    carouselButtonLeft.addEventListener("click", slideLeft);
    carouselButtonRight.addEventListener("click", slideRight);
    overlayButton.addEventListener("click", toggleModal);
}

function updateMediaWidths() {
    const carouselMedia = document.querySelectorAll(".carousel-media");
    const carouselWidth = getCarouselWidth();
    translateX = -mediaIndex * carouselWidth;
    carouselMedia.forEach((item, index) => {
        item.style.transform = `translateX(${index * carouselWidth}px)`;
    });
}

function displayMedia() {
    const carouselMediaContainer = document.querySelector('.carousel-videos');
    carouselMediaContainer.innerHTML = ''; // Clear existing media
    media.forEach((item, index) => {
        let mediaElement;
        if (item.type === 'videos') {
            mediaElement = document.createElement('video');
            mediaElement.addEventListener('click', togglePlayPause);
        } else if (item.type === 'images') {
            mediaElement = document.createElement('img');
        }
        mediaElement.classList.add('carousel-media');
        mediaElement.src = item.src;
        mediaElement.style.transform = `translateX(${index * getCarouselWidth()}px)`;
        carouselMediaContainer.appendChild(mediaElement);
    });
    playMainMedia(); // Play the first media item by default
    initializeCarousel();
}

function toggleModal() {
    if (modal.style.display === "none" || modal.style.display === "") {
        modal.style.display = "block";
        modal.setAttribute('aria-hidden', 'false');
        centerModal();
    } else {
        modal.style.display = "none";
        modal.setAttribute('aria-hidden', 'true');
    }
}

function centerModal() {
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%)";
}

closeModalButton.addEventListener("click", toggleModal);

// Ensure modal is centered on resize
window.addEventListener('resize', () => {
    if (modal.style.display === "block") {
        centerModal();
    }
});

displayMedia();
