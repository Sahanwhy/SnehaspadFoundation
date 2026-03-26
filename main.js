/* ============================================
   SNEHASPAD FOUNDATION — SHARED JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shrink ── */
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  /* ── Mobile Menu Toggle ── */
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  /* ── Smooth Scroll for Anchor Links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href'))?.scrollIntoView({
        behavior: 'smooth'
      });
    });
  });

  /* ── Scroll reveal with Stagger ── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.classList.contains('stagger')) {
          Array.from(entry.target.children).forEach((child, i) => {
            child.style.transitionDelay = `${i * 0.1}s`;
          });
        }
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
    revealObserver.observe(el);
  });

  /* ── Hero Parallax Effect ── */
  const hero = document.querySelector('.page-hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrollValue = window.scrollY;
      hero.style.backgroundPositionY = `${scrollValue * 0.5}px`;
    });
  }

  /* ── Counter animation ── */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(eased * target).toLocaleString() + (el.dataset.suffix || '');
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  /* ── Form Feedback ── */
  document.querySelectorAll('form[data-form]').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type=submit]');
      const originalText = btn.innerHTML;

      btn.innerHTML = '<span class="spinner"></span> Sending...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = '✓ Message Sent Successfully';
        btn.style.background = '#059669';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      }, 1500);
    });
  });

  /* ============================================
     GALLERY FUNCTIONALITY
     ============================================ */

  // Gallery data storage
  let galleryPhotos = [];
  let isAdminLoggedIn = false;

  // Handle admin upload button click
  const uploadBtn = document.querySelector('.admin-upload-btn');

  if (uploadBtn) {
    uploadBtn.addEventListener('click', handleAdminUpload);
  }

  // Add click handlers to gallery items
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', handleGalleryItemClick);
  });

  function handleAdminUpload() {
    const uploadBtn = document.querySelector('.admin-upload-btn');

    if (!isAdminLoggedIn) {
      // Ask for admin password
      const password = prompt('Enter admin password:');
      if (password === 'admin123') {
        isAdminLoggedIn = true;
        uploadBtn.textContent = '📤 Upload Photos';
        uploadBtn.style.background = '#27ae60';
        alert('Admin access granted! Click upload to add photos.');
        createFileInput();
      } else if (password !== null) {
        alert('Incorrect password. Access denied.');
      }
    } else {
      // Trigger file upload
      const fileInput = document.getElementById('photoInput');
      if (fileInput) {
        fileInput.click();
      } else {
        createFileInput();
        document.getElementById('photoInput').click();
      }
    }
  }

  function createFileInput() {
    // Check if file input already exists
    if (!document.getElementById('photoInput')) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'photoInput';
      fileInput.accept = 'image/*';
      fileInput.multiple = true;
      fileInput.style.display = 'none';

      fileInput.addEventListener('change', handlePhotoUpload);
      document.body.appendChild(fileInput);
    }
  }

  function handlePhotoUpload(event) {
    const files = event.target.files;
    const galleryGrid = document.querySelector('.gallery-grid');

    if (files.length === 0) return;

    // Process each uploaded photo
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();

        reader.onload = function (e) {
          const photoData = {
            id: Date.now() + index,
            src: e.target.result,
            title: prompt(`Enter title for ${file.name}:`) || file.name,
            description: prompt(`Enter description for ${file.name}:`) || 'Amazing moment captured'
          };

          galleryPhotos.push(photoData);
          addPhotoToGallery(photoData);
        };

        reader.readAsDataURL(file);
      }
    });

    // Clear input for next upload
    event.target.value = '';

    alert(`Successfully uploaded ${files.length} photo(s) to the gallery!`);
  }

  function addPhotoToGallery(photoData) {
    const galleryGrid = document.querySelector('.gallery-grid');

    // Find the first placeholder item or create a new one
    let targetItem = null;
    const placeholderItems = galleryGrid.querySelectorAll('.gallery-placeholder');

    if (placeholderItems.length > 0) {
      // Replace the first placeholder
      targetItem = placeholderItems[0].parentElement;
      targetItem.innerHTML = `
        <img src="${photoData.src}" alt="${photoData.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="gallery-overlay">
          <div style="text-align: center; color: white;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">${photoData.title}</h4>
            <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">${photoData.description}</p>
          </div>
        </div>
      `;
    } else {
      // Create new gallery item
      const newItem = document.createElement('div');
      newItem.className = 'gallery-item reveal';
      newItem.innerHTML = `
        <img src="${photoData.src}" alt="${photoData.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="gallery-overlay">
          <div style="text-align: center; color: white;">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">${photoData.title}</h4>
            <p style="margin: 0; opacity: 0.9; font-size: 0.9rem;">${photoData.description}</p>
          </div>
        </div>
      `;
      galleryGrid.appendChild(newItem);

      // Trigger reveal animation
      setTimeout(() => {
        newItem.classList.add('visible');
      }, 100);
    }

    // Add click handler to new item
    targetItem = targetItem || newItem;
    targetItem.addEventListener('click', handleGalleryItemClick);
  }

  function handleGalleryItemClick(event) {
    const item = event.currentTarget;
    const img = item.querySelector('img');
    const overlay = item.querySelector('.gallery-overlay');

    if (!img || img.src.includes('data:image')) {
      // It's a placeholder or uploaded image, show lightbox
      showLightbox(item);
    } else {
      // It's a placeholder, show upload prompt
      if (!isAdminLoggedIn) {
        alert('Admin access required to upload photos. Click the "+ Upload Photos" button first.');
      } else {
        handleAdminUpload();
      }
    }
  }

  function showLightbox(galleryItem) {
    const img = galleryItem.querySelector('img');
    const overlay = galleryItem.querySelector('.gallery-overlay');
    const title = overlay.querySelector('h4')?.textContent || 'Gallery Photo';
    const description = overlay.querySelector('p')?.textContent || '';

    // Create lightbox
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="${img.src}" alt="${title}">
        <div class="lightbox-info">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
        <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(lightbox);

    // Add lightbox styles if not already present
    if (!document.querySelector('#lightbox-styles')) {
      const styles = document.createElement('style');
      styles.id = 'lightbox-styles';
      styles.textContent = `
        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          cursor: pointer;
          animation: fadeIn 0.3s ease;
        }
        .lightbox-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          text-align: center;
        }
        .lightbox-content img {
          width: 100%;
          height: auto;
          max-height: 80vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }
        .lightbox-info {
          margin-top: 1rem;
          color: white;
        }
        .lightbox-info h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          font-family: 'Playfair Display', serif;
        }
        .lightbox-info p {
          margin: 0;
          opacity: 0.9;
          font-size: 1rem;
        }
        .lightbox-close {
          position: absolute;
          top: -50px;
          right: 0;
          background: none;
          border: none;
          color: white;
          font-size: 40px;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .lightbox-close:hover {
          transform: scale(1.1);
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    // Close on background click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        lightbox.remove();
      }
    });

    // Close on ESC key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        lightbox.remove();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /* ── Static Gallery Loading (Works without PHP) ── */
  async function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;

    // List of known images in gallery-images folder
    const galleryImages = [
      '20220807_000937.jpg.jpeg',
      '69b998a1eb7bb_1773770913.jpg',
      '69b998c9ecd1c_1773770953.jpg',
      '69b998c9ecee9_1773770953.jpg',
      '69b998c9ed30d_1773770953.jpg',
      '69b999014b53e_1773771009.jpg',
      'FB_IMG_1768313804639.jpg (1).jpeg',
      'FB_IMG_1768313804639.jpg.jpeg',
      'FB_IMG_1768313806550.jpg.jpeg',
      'IMG-20220605-WA0132.jpg (1).jpeg',
      'IMG-20220605-WA0132.jpg.jpeg',
      'IMG-20220706-WA0034.jpg.jpeg',
      'IMG-20220706-WA0055.jpg.jpeg',
      'IMG-20220706-WA0061.jpg.jpeg',
      'IMG-20220811-WA0004.jpg.jpeg',
      'IMG-20220811-WA0005.jpg (1).jpeg',
      'IMG-20220811-WA0005.jpg.jpeg',
      'IMG-20220813-WA0024.jpg.jpeg',
      'IMG-20220817-WA0033.jpg (1).jpeg',
      'IMG-20220817-WA0033.jpg.jpeg',
      'IMG-20220817-WA0040.jpg.jpeg',
      'IMG-20220817-WA0042.jpg.jpeg',
      'IMG-20250727-WA00151.jpg.jpeg',
      'IMG-20250727-WA0028.jpg.jpeg',
      'IMG-20250828-WA0024.jpg.jpeg',
      'IMG-20250830-WA0007.jpg.jpeg',
      'IMG-20251004-WA0022.jpg (1).jpeg',
      'IMG-20251004-WA0022.jpg.jpeg',
      'IMG-20251114-WA0009.jpg.jpeg',
      'IMG-20260112-WA0002.jpg.jpeg',
      'IMG-20260309-WA0036.jpg.jpeg',
      'IMG-20260309-WA0039.jpg.jpeg',
      'Screenshot 2026-03-26 095002.png',
      'Screenshot 2026-03-26 095018.png',
      'Screenshot 2026-03-26 095032.png',
      'Screenshot 2026-03-26 095047.png',
      'Screenshot 2026-03-26 095111.png',
      'Screenshot 2026-03-26 095126.png',
      'Screenshot 2026-03-26 095137.png',
      'Screenshot 2026-03-26 095148.png',
      'Screenshot 2026-03-26 095159.png',
      'Screenshot 2026-03-26 095228.png',
      'Screenshot 2026-03-26 095240.png',
      'Screenshot 2026-03-26 095251.png',
      'Screenshot 2026-03-26 095303.png',
      'Screenshot 2026-03-26 095312.png',
      'Screenshot 2026-03-26 095327.png',
      'Screenshot 2026-03-26 095336.png',
      'Screenshot 2026-03-26 095418.png',
      'Screenshot 2026-03-26 095433.png',
      'Screenshot 2026-03-26 095448.png',
      'Screenshot 2026-03-26 095502.png',
      'Screenshot 2026-03-26 095514.png',
      'Screenshot 2026-03-26 095526.png',
      'Screenshot 2026-03-26 095547.png',
      'Screenshot 2026-03-26 095558.png',
      'Screenshot 2026-03-26 095630.png',
      'Screenshot_2022-02-10-11-04-01-88_6012fa4d4ddec268fc5c7112cbb265e7.jpg.jpeg',
      'Screenshot_2022-07-18-19-34-30-35_40deb401b9ffe8e1df2f1cc5ba480b12.jpg (1).jpeg',
      'Screenshot_2026-01-14-22-38-13-36_e2d5b3f32b79de1d45acd1fad96fbb0f.jpg.jpeg',
      'Screenshot_2026-01-14-22-38-18-79_e2d5b3f32b79de1d45acd1fad96fbb0f.jpg.jpeg'
    ];

    try {
      // Clear loading spinner
      galleryGrid.innerHTML = '';

      // Create gallery items for each image
      galleryImages.forEach((imageName, index) => {
        const imageData = {
          filename: imageName,
          path: `gallery-images/${imageName}`,
          name: imageName
        };
        const galleryItem = createGalleryItem(imageData, index);
        galleryGrid.appendChild(galleryItem);
      });

      // Add reveal animation to new items
      const newItems = galleryGrid.querySelectorAll('.gallery-item');
      newItems.forEach((item, i) => {
        setTimeout(() => {
          item.classList.add('visible');
        }, i * 50); // Faster stagger for better performance
      });

    } catch (error) {
      console.error('Error loading gallery:', error);
      galleryGrid.innerHTML = `
        <div class="gallery-error">
          <div class="gallery-error-icon">⚠️</div>
          <h3>Unable to load gallery</h3>
          <p>Please check back later or contact support.</p>
        </div>
      `;
    }
  }

  function createGalleryItem(image, index) {
    const item = document.createElement('div');
    item.className = 'gallery-item reveal';
    item.style.animationDelay = `${index * 0.1}s`;

    item.innerHTML = `
      <img src="${image.path}" alt="Gallery Photo ${index + 1}" loading="lazy">
      <div class="gallery-overlay">
        <span class="gallery-plus">+</span>
        <div class="gallery-info">
          <div class="gallery-filename">${image.filename}</div>
          <div class="gallery-meta">${image.date_formatted} • ${image.size_formatted}</div>
        </div>
      </div>
    `;

    // Add click event for lightbox
    item.addEventListener('click', () => {
      openLightbox(image.path, image.filename, image.date_formatted);
    });

    return item;
  }

  function openLightbox(imageSrc, filename, date) {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
      <div class="lightbox-content">
        <img src="${imageSrc}" alt="${filename}">
        <div class="lightbox-info">
          <h3>${filename}</h3>
          <p>${date}</p>
        </div>
        <button class="lightbox-close">&times;</button>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .lightbox {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }
      .lightbox-content {
        position: relative;
        max-width: 90%;
        max-height: 90%;
        text-align: center;
      }
      .lightbox-content img {
        max-width: 100%;
        max-height: 80vh;
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }
      .lightbox-info {
        position: absolute;
        bottom: -60px;
        left: 0;
        right: 0;
        color: white;
        text-align: center;
      }
      .lightbox-info h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.5rem;
        font-family: 'Playfair Display', serif;
      }
      .lightbox-info p {
        margin: 0;
        opacity: 0.9;
        font-size: 1rem;
      }
      .lightbox-close {
        position: absolute;
        top: -50px;
        right: 0;
        background: none;
        border: none;
        color: white;
        font-size: 40px;
        cursor: pointer;
        transition: transform 0.3s ease;
      }
      .lightbox-close:hover {
        transform: scale(1.1);
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(styles);

    // Add to page
    document.body.appendChild(lightbox);

    // Close events
    const closeLightbox = () => {
      lightbox.remove();
      styles.remove();
    };

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // Load gallery when page loads
  loadGallery();

  /* ── About Page Mobile Enhancements ── */
  if (document.body.classList.contains('about-page')) {
    // Mobile viewport height fix for iOS
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);

    // Smooth scroll for anchor links on about page
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offset = 80; // Account for fixed header
          const targetPosition = target.offsetTop - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });

    // Mobile touch interactions for cards
    if (window.innerWidth <= 768) {
      // Add touch feedback to interactive elements
      const touchElements = document.querySelectorAll('.mv-card, .obj-item, .value-card, .team-list li');

      touchElements.forEach(element => {
        element.addEventListener('touchstart', function () {
          this.style.transform = 'scale(0.98)';
        });

        element.addEventListener('touchend', function () {
          this.style.transform = 'scale(1)';
        });
      });

      // Lazy load images for better performance
      const images = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    }

    // Parallax effect for story banner on desktop only
    if (window.innerWidth > 768) {
      const storyBanner = document.querySelector('.story-banner');
      if (storyBanner) {
        window.addEventListener('scroll', () => {
          const scrolled = window.pageYOffset;
          const bannerTop = storyBanner.offsetTop;
          const bannerHeight = storyBanner.offsetHeight;

          if (scrolled < bannerTop + bannerHeight) {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            storyBanner.style.transform = `translateY(${yPos}px)`;
          }
        });
      }
    }
  }

  /* ── Skill Enhancements Page Specific Features ── */
  if (document.body.classList.contains('skill-page') || document.querySelector('.skill-hero')) {
    
    // Skill cards hover effect with 3D tilt
    const skillCards = document.querySelectorAll('.skill-card, .leader-card');
    
    skillCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (centerY - y) / 20;
        const rotateY = (x - centerX) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });

    // Animate skill categories on scroll
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          skillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(30px)';
      card.style.transition = `all 0.6s cubic-bezier(0.23, 1, 0.32, 1) ${i * 0.1}s`;
      skillObserver.observe(card);
    });

    // Parallax background for hero
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const hero = document.querySelector('.skill-hero');
      if (hero) {
        hero.style.backgroundPositionY = (scrolled * 0.5) + 'px';
      }
    });
  }

});

