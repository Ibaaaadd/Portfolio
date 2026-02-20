/* ===================================
   DARK PORTFOLIO - ENHANCED ANIMATIONS
   =================================== */

// Enhanced smooth scroll function for cross-browser compatibility
function smoothScrollTo(targetElement) {
  if (!targetElement) return;
  const targetPosition = targetElement.offsetTop;
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  const duration = 800;
  let start = null;

  function animation(currentTime) {
    if (start === null) start = currentTime;
    const timeElapsed = currentTime - start;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  if ('scrollBehavior' in document.documentElement.style) {
    targetElement.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    });
  } else {
    requestAnimationFrame(animation);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initializeTypedJS();
  initializeAOS();
  initializeSwiper();
  initializeParticles();
  setupScrollAnimations();
  setupNavigation();
  setupInteractiveElements();
});

function initializeAOS() {
  AOS.init({
    duration: window.innerWidth < 768 ? 400 : 800, 
    once: false,
    offset: window.innerWidth < 768 ? 30 : 50, 
    easing: 'ease-out-cubic',
    anchorPlacement: 'top-bottom',
    disable: false, 
    delay: function (el) {
      const isMobile = window.innerWidth < 768;
      if (el.closest('footer')) {
        return isMobile ? 50 : 100;
      }
      
      if (el.closest('#experience')) {
        return isMobile ? 50 : 100;
      }
      
      return isMobile ? 100 : 200;
    }
  });

  let resizeTimeout;
  let wasMobile = window.innerWidth < 768;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const isMobile = window.innerWidth < 768;
      if (isMobile !== wasMobile) {
        wasMobile = isMobile;
        initializeAOS();
      } else {
        AOS.refresh();
      }
    }, 250);
  });
  
  let footerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          AOS.refresh();
        }, 50);
      }
    });
  }, { rootMargin: '100px' });

  const footer = document.querySelector('footer');
  if (footer) {
    footerObserver.observe(footer);
  }
}

function initializeTypedJS() {
  new Typed("#typed-text", {
    strings: [
      "Full Stack Developer",
      "Problem Solver",
      "Tech Enthusiast",
      "Code Architect",
    ],
    typeSpeed: 70,
    backSpeed: 50,
    backDelay: 1500,
    startDelay: 500,
    loop: true,
    showCursor: true,
    cursorChar: "_",
    smartBackspace: true,
    fadeOut: true,
    fadeOutClass: 'typed-fade-out',
    fadeOutDelay: 300,
  });
}

function initializeSwiper() {
  const swiper = new Swiper(".projectSwiper", {
    effect: 'coverflow',
    grabCursor: false,
    centeredSlides: true,
    slidesPerView: 'auto',
    loop: true,
    allowTouchMove: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },
    coverflowEffect: {
      rotate: 20,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
    keyboard: {
      enabled: true,
    },
    breakpoints: {
      640: {
        effect: 'slide',
        slidesPerView: 2,
        spaceBetween: 20,
        coverflowEffect: {
          rotate: 0,
        }
      },
      1024: {
        effect: 'coverflow',
        slidesPerView: 3,
        spaceBetween: 30,
      },
    },
    on: {
      slideChange: function() {
        this.slides.forEach((slide, index) => {
          if (index === this.activeIndex) {
            slide.style.transform += ' scale(1.05)';
          } else {
            slide.style.transform = slide.style.transform.replace(' scale(1.05)', '');
          }
        });
      }
    }
  });
}

function initializeParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '-1';
  canvas.style.pointerEvents = 'none';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let particles = [];
  const maxParticles = 50;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.2
    };
  }

  function updateParticles() {
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
    });
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
      ctx.fill();
    });

    particles.forEach((particle, i) => {
      particles.slice(i + 1).forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.strokeStyle = `rgba(0, 212, 255, ${0.2 * (1 - distance / 100)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    });
  }

  function animate() {
    updateParticles();
    drawParticles();
    requestAnimationFrame(animate);
  }

  for (let i = 0; i < maxParticles; i++) {
    particles.push(createParticle());
  }

  resizeCanvas();
  animate();

  window.addEventListener('resize', resizeCanvas);
}

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");
  const hamburgerLines = document.querySelectorAll(".hamburger-line");

  mobileMenuBtn.addEventListener("click", function () {
    const isOpen = mobileMenu.classList.contains('active');
    
    if (isOpen) {
      mobileMenu.classList.remove('active');
      mobileMenu.style.maxHeight = "0px";
      hamburgerLines[0].style.transform = "rotate(0deg) translateY(0px)";
      hamburgerLines[1].style.opacity = "1";
      hamburgerLines[2].style.transform = "rotate(0deg) translateY(0px)";
      
      const menuItems = mobileMenu.querySelectorAll('.mobile-nav-link');
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.transform = 'translateX(-100px)';
          item.style.opacity = '0';
        }, index * 50);
      });
    } else {
      mobileMenu.classList.add('active');
      mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
      hamburgerLines[0].style.transform = "rotate(45deg) translateY(8px)";
      hamburgerLines[1].style.opacity = "0";
      hamburgerLines[2].style.transform = "rotate(-45deg) translateY(-8px)";
      
      const menuItems = mobileMenu.querySelectorAll('.mobile-nav-link');
      menuItems.forEach((item, index) => {
        setTimeout(() => {
          item.style.transform = 'translateX(0)';
          item.style.opacity = '1';
        }, index * 100 + 200);
      });
    }
  });

  document.querySelectorAll(".mobile-nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      mobileMenu.classList.remove('active');
      mobileMenu.style.maxHeight = "0px";
      hamburgerLines[0].style.transform = "rotate(0deg) translateY(0px)";
      hamburgerLines[1].style.opacity = "1";
      hamburgerLines[2].style.transform = "rotate(0deg) translateY(0px)";
    });
  });
}

function setupScrollAnimations() {
  let ticking = false;
  let lastScrollTime = 0;
  const scrollIndicator = document.getElementById("scrollIndicator");
  
  function updateScrollProgress() {
    const now = performance.now();
    
    if (now - lastScrollTime < 16) {
      requestAnimationFrame(updateScrollProgress);
      return;
    }
    
    lastScrollTime = now;
    const scrolled = (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    scrollIndicator.style.transform = `scaleX(${Math.min(scrolled / 100, 1)}) translateZ(0)`;
    ticking = false;
  }

  window.addEventListener("scroll", function() {
    if (!ticking) {
      requestAnimationFrame(updateScrollProgress);
      ticking = true;
    }
  }, { passive: true });

  let lastScrollY = window.scrollY;
  const navbar = document.getElementById("navbar");
  
  window.addEventListener("scroll", function() {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 100) {
      navbar.classList.add('scrolled');
      
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
    } else {
      navbar.classList.remove('scrolled');
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;
  });
}

function setupNavigation() {
  const backToTopBtn = document.getElementById("backToTop");
  
  window.addEventListener("scroll", function () {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.remove("opacity-0", "invisible");
      backToTopBtn.classList.add("opacity-100", "visible");
    } else {
      backToTopBtn.classList.add("opacity-0", "invisible");
      backToTopBtn.classList.remove("opacity-100", "visible");
    }
  });

  backToTopBtn.addEventListener("click", function (e) {
    e.preventDefault();
    
    const homeSection = document.getElementById('home');
    if (homeSection) {
      smoothScrollTo(homeSection);
    } else {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(l => l.classList.remove('active'));
    const homeNavLink = document.querySelector('a[href="#home"].nav-link');
    if (homeNavLink) {
      homeNavLink.classList.add('active');
    }
    
    this.style.transform = 'scale(0.9)';
    setTimeout(() => {
      this.style.transform = 'scale(1)';
    }, 150);
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = 'scale(1)';
        }, 200);

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  const observerOptions = {
    threshold: [0.1, 0.25, 0.5], 
    rootMargin: '-20% 0px -20% 0px'
  };

  let currentActiveSection = null;

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    const mostVisible = entries.find(entry => entry.isIntersecting);
    
    if (mostVisible && mostVisible.target.id !== currentActiveSection) {
      const sectionId = mostVisible.target.id;
      currentActiveSection = sectionId;
      
      console.log('Section detected:', sectionId, 'Ratio:', mostVisible.intersectionRatio);
      
      navLinks.forEach(link => {
        link.classList.remove("active");
        const linkHref = link.getAttribute("href");
        if (linkHref === `#${sectionId}`) {
          link.classList.add("active");
          console.log('Activated nav link:', linkHref);
        }
      });
    }
  }, observerOptions);

  sections.forEach(section => {
    console.log('Observing section:', section.id); 
    sectionObserver.observe(section);
  });

  let ticking = false;

  function updateActiveNavOnScroll() {
    const scrollPosition = window.scrollY + window.innerHeight / 3;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.id;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        if (currentActiveSection !== sectionId) {
          currentActiveSection = sectionId;
          
          navLinks.forEach(link => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${sectionId}`) {
              link.classList.add("active");
              console.log('Scroll activated nav link:', `#${sectionId}`);
            }
          });

          const mobileBottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
          mobileBottomNavItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
              item.classList.add('active');
            }
          });
        }
      }
    });

    ticking = false;
  }

  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateActiveNavOnScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });

  updateActiveNavOnScroll();

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        currentActiveSection = targetId.substring(1);
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          smoothScrollTo(targetSection);
        }
      }
    });
  });

  const logoLink = document.querySelector('.logo');
  if (logoLink) {
    logoLink.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        navLinks.forEach(l => l.classList.remove('active'));
        const homeNavLink = document.querySelector('a[href="#home"].nav-link');
        if (homeNavLink) {
          homeNavLink.classList.add('active');
        }
        currentActiveSection = 'home';
        
        const homeSection = document.querySelector('#home');
        if (homeSection) {
          smoothScrollTo(homeSection);
        }
      }
    });
  }

  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
          mobileMenu.classList.remove('active');
        }
        
        navLinks.forEach(l => l.classList.remove('active'));
        const correspondingNavLink = document.querySelector(`a[href="${targetId}"].nav-link`);
        if (correspondingNavLink) {
          correspondingNavLink.classList.add('active');
        }
        currentActiveSection = targetId.substring(1);
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          smoothScrollTo(targetSection);
        }
      }
    });
  });

  const mobileBottomNavItems = document.querySelectorAll('.mobile-bottom-nav-item');
  mobileBottomNavItems.forEach(item => {
    item.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        
        mobileBottomNavItems.forEach(navItem => navItem.classList.remove('active'));
        this.classList.add('active');
        
        navLinks.forEach(l => l.classList.remove('active'));
        const correspondingNavLink = document.querySelector(`a[href="${targetId}"].nav-link`);
        if (correspondingNavLink) {
          correspondingNavLink.classList.add('active');
        }
        currentActiveSection = targetId.substring(1);
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          smoothScrollTo(targetSection);
        }
      }
    });
  });

  const waFloatingBtn = document.getElementById('waFloatingBtn');
  const contactSection = document.getElementById('contact');
  
  if (waFloatingBtn && contactSection) {
    function checkWaButtonVisibility() {
      const contactRect = contactSection.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      if (contactRect.top < windowHeight - 100) {
        waFloatingBtn.classList.add('hidden');
      } else {
        waFloatingBtn.classList.remove('hidden');
      }
    }
    
    window.addEventListener('scroll', checkWaButtonVisibility, { passive: true });
    checkWaButtonVisibility();
  }

  setupMobileMenu();
}

function setupInteractiveElements() {
  const cards = document.querySelectorAll('.card, .project-card, .certificate-card, .glass-card');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.02)';
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
  
  buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px)';
      this.style.boxShadow = '0 10px 30px rgba(0, 212, 255, 0.4)';
    });
    
    button.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = '0 4px 15px rgba(0, 212, 255, 0.3)';
    });
    
    button.addEventListener('click', function() {
      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(255, 255, 255, 0.6)';
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = 'ripple 0.6s linear';
      ripple.style.left = '50%';
      ripple.style.top = '50%';
      ripple.style.width = ripple.style.height = '20px';
      ripple.style.marginLeft = ripple.style.marginTop = '-10px';
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });

  const skillIcons = document.querySelectorAll('.skill-icon');
  
  skillIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
      this.style.transform = 'scale(1.2) rotate(10deg)';
      this.style.filter = 'drop-shadow(0 5px 15px rgba(0, 212, 255, 0.5))';
    });
    
    icon.addEventListener('mouseleave', function() {
      this.style.transform = 'scale(1) rotate(0deg)';
      this.style.filter = 'grayscale(0.3)';
    });
  });
}

function filterCertificates(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.transform = 'scale(1)';
  });
  
  event.target.classList.add('active');
  event.target.style.transform = 'scale(1.05)';
  
  setTimeout(() => {
    event.target.style.transform = 'scale(1)';
  }, 200);

  const certificates = document.querySelectorAll('.certificate-card');
  
  certificates.forEach((cert, index) => {
    setTimeout(() => {
      cert.style.opacity = '0';
      cert.style.transform = 'translateY(20px)';
    }, index * 50);
  });

  setTimeout(() => {
    certificates.forEach((cert, index) => {
      if (category === 'all' || cert.getAttribute('data-category') === category) {
        cert.style.display = 'block';
        setTimeout(() => {
          cert.style.opacity = '1';
          cert.style.transform = 'translateY(0)';
          cert.classList.add('animate-fade-in');
        }, index * 100);
      } else {
        cert.style.display = 'none';
      }
    });
  }, 300);
}

function initializeCursorTrail() {
  const trail = [];
  const maxTrail = 10;
  
  document.addEventListener('mousemove', (e) => {
    trail.push({ x: e.clientX, y: e.clientY, opacity: 1 });
    
    if (trail.length > maxTrail) {
      trail.shift();
    }
    
    document.querySelectorAll('.cursor-trail').forEach((el, index) => {
      if (trail[index]) {
        el.style.left = trail[index].x + 'px';
        el.style.top = trail[index].y + 'px';
        el.style.opacity = trail[index].opacity * (index / maxTrail);
      }
    });
    
    while (document.querySelectorAll('.cursor-trail').length < trail.length) {
      const trailElement = document.createElement('div');
      trailElement.classList.add('cursor-trail');
      trailElement.style.position = 'fixed';
      trailElement.style.width = '4px';
      trailElement.style.height = '4px';
      trailElement.style.background = 'rgba(0, 212, 255, 0.6)';
      trailElement.style.borderRadius = '50%';
      trailElement.style.pointerEvents = 'none';
      trailElement.style.zIndex = '9999';
      trailElement.style.transition = 'opacity 0.3s ease';
      document.body.appendChild(trailElement);
    }
  });
}

if (window.innerWidth > 768) {
  initializeCursorTrail();
}

const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .typed-fade-out {
    opacity: 0;
    transform: translateY(-10px);
  }
`;
document.head.appendChild(style);

function handleCertificateImageErrors() {
  const certificateImages = document.querySelectorAll('.certificate-card img');
  
  certificateImages.forEach(img => {
    img.addEventListener('error', function() {
      console.log('Failed to load image:', this.src);
      
      this.style.display = 'none';
      
      const fallback = this.nextElementSibling;
      if (fallback && fallback.classList.contains('hidden')) {
        fallback.classList.remove('hidden');
        fallback.classList.add('flex');
      } else {
        const container = this.parentElement;
        const fallbackDiv = document.createElement('div');
        fallbackDiv.className = 'w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-lg flex items-center justify-center text-purple-400';
        fallbackDiv.innerHTML = `
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p class="text-sm">Certificate Image</p>
          </div>
        `;
        container.appendChild(fallbackDiv);
      }
    });
    
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event('error'));
    }
  });
}

document.addEventListener('DOMContentLoaded', handleCertificateImageErrors);

