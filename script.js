const tours = {
  dataCenter: {
    title: "Data Center",
    label: "360\u00b0 Virtual Tour",
    description:
      "Explore Horizon Scope's data center environment in an immersive 360\u00b0 experience.",
    highlights: [
      "Move through the facility and inspect rack zones, cooling paths, and secure access points.",
      "Matterport 3D capture gives visitors a realistic sense of scale and layout.",
      "QR access lets visitors continue the same tour instantly on their phone.",
    ],
    url: "https://my.matterport.com/show/?m=t2e4a7ZJzU6",
    qr: "assets/qr/t2e4a7ZJzU6_QR.jpg",
    qrAlt: "QR code for Data Center virtual tour",
  },
  powerRoom: {
    title: "Power Room",
    label: "360\u00b0 Virtual Tour",
    description:
      "Explore the power infrastructure supporting Horizon Scope's mission-critical operations.",
    highlights: [
      "View electrical distribution, panels, and power-support areas in a guided 360\u00b0 space.",
      "The tour helps explain how resilient infrastructure supports continuous operations.",
      "QR access keeps the experience available after leaving the exhibition screen.",
    ],
    url: "https://my.matterport.com/show/?m=8uEbCKz1d6b",
    qr: "assets/qr/8uEbCKz1d6b_QR.jpg",
    qrAlt: "QR code for Power Room virtual tour",
  },
};

const kiosk = document.getElementById("kiosk");
const viewerFrame = document.getElementById("viewerFrame");
const viewer = document.getElementById("matterportViewer");
const loader = document.getElementById("viewerLoader");
const tabs = [...document.querySelectorAll("[data-tour]")];
const title = document.getElementById("tourTitle");
const label = document.getElementById("tourLabel");
const description = document.getElementById("tourDescription");
const highlights = document.getElementById("tourHighlights");
const tourCopy = document.getElementById("tourCopy");
const qrBlock = document.getElementById("qrBlock");
const qrImage = document.getElementById("qrImage");
const qrMissing = document.getElementById("qrMissing");
const fullscreenButton = document.getElementById("fullscreenButton");

let activeTour = "dataCenter";
let loadingTimer;

function setLoading(isLoading) {
  viewerFrame.classList.toggle("is-loading", isLoading);
  loader.setAttribute("aria-hidden", String(!isLoading));
}

function updateQrFallback(showFallback, path) {
  qrMissing.hidden = !showFallback;
  if (showFallback) {
    qrMissing.textContent = `Place the QR image at ${path}`;
  }
}

function selectTour(tourKey) {
  if (!tours[tourKey] || tourKey === activeTour) {
    return;
  }

  const tour = tours[tourKey];
  activeTour = tourKey;

  tabs.forEach((tab) => {
    const isActive = tab.dataset.tour === tourKey;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-pressed", String(isActive));
  });

  tourCopy.classList.add("is-changing");
  qrBlock.classList.add("is-changing");
  setLoading(true);
  window.clearTimeout(loadingTimer);

  window.setTimeout(() => {
    title.textContent = tour.title;
    label.textContent = tour.label;
    description.textContent = tour.description;
    highlights.replaceChildren(
      ...tour.highlights.map((highlight) => {
        const item = document.createElement("li");
        item.textContent = highlight;
        return item;
      }),
    );
    qrImage.src = tour.qr;
    qrImage.alt = tour.qrAlt;
    updateQrFallback(false, tour.qr);
    viewer.title = `${tour.title} 360 degree virtual tour`;
    viewer.src = tour.url;
    tourCopy.classList.remove("is-changing");
    qrBlock.classList.remove("is-changing");
  }, 170);

  loadingTimer = window.setTimeout(() => {
    setLoading(false);
  }, 5000);
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => selectTour(tab.dataset.tour));
});

viewer.addEventListener("load", () => {
  window.clearTimeout(loadingTimer);
  window.setTimeout(() => setLoading(false), 220);
});

qrImage.addEventListener("error", () => {
  updateQrFallback(true, tours[activeTour].qr);
});

qrImage.addEventListener("load", () => {
  updateQrFallback(false, tours[activeTour].qr);
});

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await kiosk.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.warn("Fullscreen request was blocked by the browser.", error);
  }
}

function syncFullscreenState() {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenButton.classList.toggle("is-fullscreen", isFullscreen);
  fullscreenButton.setAttribute(
    "aria-label",
    isFullscreen ? "Exit fullscreen" : "Enter fullscreen",
  );
  fullscreenButton.title = isFullscreen ? "Exit fullscreen" : "Fullscreen";
}

fullscreenButton.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", syncFullscreenState);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target?.isContentEditable;

  if (isTyping) {
    return;
  }

  if (event.key === "1") {
    selectTour("dataCenter");
  }

  if (event.key === "2") {
    selectTour("powerRoom");
  }

  if (event.key.toLowerCase() === "f") {
    toggleFullscreen();
  }
});

setLoading(true);
