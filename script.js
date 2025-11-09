// --- Smooth scroll for navigation links ---
document.querySelectorAll('nav a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });

    // Close mobile menu after clicking
    const navMenu = document.querySelector('nav ul');
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
    }
  });
});

// --- Hamburger menu toggle ---
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('nav ul');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  });
}

// --- Contact form handling (no backend) ---
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("form-status");

if (contactForm) {
  contactForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Palun täida kõik kohustuslikud väljad.";
      formStatus.style.color = "red";
      return;
    }

    const subject = encodeURIComponent(`Päring Rasmuse Plekitööde kodulehelt`);
    const body = encodeURIComponent(
      `Nimi: ${name}\nE-post: ${email}\nTelefon: ${phone}\n\nSõnum:\n${message}`
    );

    const mailtoLink = `mailto:info@rasmuseplekitood.ee?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    formStatus.textContent = "Avaneb e-posti rakendus sõnumi saatmiseks.";
    formStatus.style.color = "green";
    contactForm.reset();
  });
}

// --- Dynamic Project Gallery ---
const projectGallery = document.getElementById("project-gallery");
const projectModal = document.getElementById("project-modal");
const closeProjectModal = document.getElementById("close-project-modal");
const viewerLarge = document.getElementById("viewer-large");
const viewerGrid = document.getElementById("viewer-grid");
const fullscreenBtn = document.getElementById("fullscreen-btn");
const viewerVideo = document.getElementById("viewer-video");

// Define image counts per project
const projectImagesCount = {
  project1: 11,
  project2: 1,
  project3: 17,
  project4: 13,
  project5: 7
};

// Define projects
const projects = [
  { folder: "project1", name: "Niine 11 - Tallinn", type: "youtube", videoId: "757lWydrCFE" },
  { folder: "project2", name: "Luige 15 - Tallinn", type: "image" },
  { folder: "project3", name: "Põhjatähe Põhikool - Tallinn", type: "youtube", videoId: "FNJIQmRCq60" },
  { folder: "project4", name: "Tolli 8 - Tallinn", type: "youtube", videoId: "PVGo_CoxSe4" },
  { folder: "project5", name: "Vaata veel", type: "image" }
];

// --- Generate main gallery ---
if (projectGallery) {
  projects.forEach(project => {
    const div = document.createElement("div");
    div.className = "project";
    div.dataset.folder = project.folder;
    div.innerHTML = `
      <img src="images/gallery/${project.folder}/main.jpg" alt="${project.name}" loading="lazy">
      <p>${project.name}</p>
    `;
    projectGallery.appendChild(div);

    div.addEventListener("click", () => openProjectGallery(project.folder));
  });
}

// --- Open modal with project images ---
function openProjectGallery(folder) {
  projectModal.style.display = "flex";
  viewerGrid.innerHTML = "";

  const project = projects.find(p => p.folder === folder);
  const totalImages = projectImagesCount[folder] || 6;

  // Reset video
  viewerVideo.src = "";
  viewerVideo.style.display = "none";

  // --- Set initial viewer ---
  if (project.type === "youtube") {
    viewerVideo.style.display = "block";
    viewerVideo.src = `https://www.youtube.com/embed/${project.videoId}?autoplay=0&rel=0`;
    viewerLarge.style.display = "none";
    fullscreenBtn.style.display = "none";
  } else {
    viewerVideo.style.display = "none";
    viewerLarge.style.display = "block";
    viewerLarge.src = `images/gallery/${folder}/main.jpg`;
    fullscreenBtn.style.display = "block";
  }

  const fragment = document.createDocumentFragment();

  // --- Video thumbnail first (if YouTube) ---
  if (project.type === "youtube") {
    const videoThumb = document.createElement("div");
    videoThumb.className = "video-thumb";
    videoThumb.innerHTML = `
      <img src="images/gallery/${folder}/video.jpg" alt="Video">
      <span class="play-icon">▶</span>
    `;
    videoThumb.addEventListener("click", () => {
      viewerVideo.style.display = "block";
      viewerVideo.src = `https://www.youtube.com/embed/${project.videoId}?autoplay=0&rel=0`;
      viewerLarge.style.display = "none";
      highlightThumbnail(videoThumb);
    });
    fragment.appendChild(videoThumb);
  }

  // --- Main image always included in grid ---
  const mainImg = document.createElement("img");
  mainImg.src = `images/gallery/${folder}/main.jpg`;
  mainImg.dataset.full = `images/gallery/${folder}/main.jpg`;
  mainImg.alt = `Main image`;
  if (project.type !== "youtube") mainImg.classList.add("active");
  mainImg.addEventListener("click", () => {
    viewerVideo.style.display = "none";
    viewerLarge.style.display = "block";
    viewerLarge.src = mainImg.dataset.full;
    fullscreenBtn.style.display = "block";
    highlightThumbnail(mainImg);
  });
  fragment.appendChild(mainImg);

  // --- Numbered images ---
  for (let i = 1; i <= totalImages; i++) {
    const img = document.createElement("img");
    img.src = `images/gallery/${folder}/${i}.jpg`;
    img.dataset.full = `images/gallery/${folder}/${i}.jpg`;
    img.alt = `Image ${i}`;
    img.addEventListener("click", () => {
      viewerVideo.style.display = "none";
      viewerLarge.style.display = "block";
      viewerLarge.src = img.dataset.full;
      fullscreenBtn.style.display = "block";
      highlightThumbnail(img);
    });
    fragment.appendChild(img);
  }

  viewerGrid.appendChild(fragment);

  // --- Highlight first thumbnail (video if present) ---
  const firstActive = project.type === "youtube"
    ? viewerGrid.querySelector(".video-thumb")
    : viewerGrid.querySelector("img");
  if (firstActive) highlightThumbnail(firstActive);
}

// --- Highlight clicked thumbnail ---
function highlightThumbnail(el) {
  document.querySelectorAll("#viewer-grid img, #viewer-grid .video-thumb").forEach(e => e.classList.remove("active"));
  el.classList.add("active");
}

// --- Close modal ---
closeProjectModal.addEventListener("click", () => {
  projectModal.style.display = "none";
  viewerGrid.innerHTML = "";
  viewerLarge.src = "";
  viewerVideo.src = "";
});

// --- Close modal by clicking outside viewer content ---
projectModal.addEventListener("click", e => {
  const mainImage = document.getElementById("viewer-large");
  const mainVideo = document.getElementById("viewer-video");
  const viewerGridEl = document.querySelector(".viewer-right");
  const fsBtn = document.getElementById("fullscreen-btn");

  if (
    e.target !== mainImage &&
    e.target !== mainVideo &&
    !viewerGridEl.contains(e.target) &&
    e.target !== fsBtn
  ) {
    projectModal.style.display = "none";
    viewerGrid.innerHTML = "";
    viewerLarge.src = "";
    viewerVideo.src = "";
  }
});


// --- Fullscreen button now opens image in new tab ---
if (fullscreenBtn) {
  // Remove old click listeners
  fullscreenBtn.onclick = null;

  fullscreenBtn.addEventListener("click", () => {
    const img = document.getElementById("viewer-large");
    if (img && img.style.display !== "none") {
      // Open image in new tab
      window.open(img.src, "_blank");
      
      // Keep project modal and panel visible (do nothing else)
    }
  });
}


// --- Auto horizontal scroll hint ---
(function() {
  const galleryGrid = document.querySelector('.gallery-grid');
  if (!galleryGrid) return;

  let scrollAmount = 1;      // pixels per frame
  let direction = 1;         // 1 = forward, -1 = backward
  let autoScrollActive = false;
  let userScrolled = false;

  // Detect if element is in viewport
  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top < window.innerHeight &&
      rect.bottom > 0
    );
  }

  // Start auto scroll
  function startAutoScroll() {
    if (autoScrollActive) return;
    autoScrollActive = true;

    function step() {
      if (!autoScrollActive) return;

      galleryGrid.scrollLeft += scrollAmount * direction;

      // Reverse direction at ends
      if (galleryGrid.scrollLeft + galleryGrid.clientWidth >= galleryGrid.scrollWidth) {
        direction = -1;
      } else if (galleryGrid.scrollLeft <= 0) {
        direction = 1;
      }

      requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // Stop auto scroll
  function stopAutoScroll() {
    autoScrollActive = false;
  }

  // Detect manual scroll by user
  galleryGrid.addEventListener('wheel', () => {
    userScrolled = true;
    stopAutoScroll();
  });
  galleryGrid.addEventListener('touchstart', () => {
    userScrolled = true;
    stopAutoScroll();
  });

  // Check periodically if gallery is in viewport
  function checkVisibility() {
    if (!userScrolled && isInViewport(galleryGrid)) {
      startAutoScroll();
    }
  }

  window.addEventListener('scroll', checkVisibility);
  window.addEventListener('resize', checkVisibility);
  checkVisibility();
})();

