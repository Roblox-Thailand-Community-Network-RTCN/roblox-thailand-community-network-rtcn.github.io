// 1. Dynamic Year for Footer
document.getElementById('year').textContent = new Date().getFullYear();

// 2. Sticky Navbar Border Effect on Scroll
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// 3. Scroll Reveal Animation for Sections
// Uses IntersectionObserver which is highly performant
const revealElements = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, {
    root: null,
    threshold: 0.1, // Triggers when 10% of element is visible
    rootMargin: "0px 0px -50px 0px"
});

revealElements.forEach(el => revealObserver.observe(el));

// 4. Animated Number Counters ("Our data shows")
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const targetEl = entry.target;
            const targetNum = +targetEl.getAttribute('data-target');
            const duration = 2000; // 2 seconds to finish counting
            const frames = 60; // assume 60fps
            const totalFrames = (duration / 1000) * frames;
            const increment = targetNum / totalFrames;
            let currentNum = 0;

            const updateCounter = () => {
                currentNum += increment;
                if (currentNum < targetNum) {
                    // Math.ceil gives us nice whole numbers while counting up
                    targetEl.innerText = Math.ceil(currentNum).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    // Ensure it finishes exactly on the target number
                    targetEl.innerText = targetNum.toLocaleString() + "+";
                }
            };

            updateCounter();
            observer.unobserve(targetEl); // Stop observing once counted
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => counterObserver.observe(counter));

// 5. Carousel Diamond Indicators Logic
// This links the native CSS Scroll-Snap to the diamond UI elements
const carousels = document.querySelectorAll('.carousel-wrapper');

carousels.forEach(wrapper => {
    const track = wrapper.querySelector('.carousel-track');
    const cards = track.querySelectorAll('.carousel-card');
    const indicatorsContainer = wrapper.querySelector('.carousel-indicators');
    
    // Clear hardcoded HTML indicators and generate them dynamically based on card count
    indicatorsContainer.innerHTML = '';
    cards.forEach((_, index) => {
        const diamond = document.createElement('div');
        diamond.classList.add('diamond');
        if(index === 0) diamond.classList.add('active');
        
        // Allow clicking diamonds to scroll to that card
        diamond.addEventListener('click', () => {
            cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
        
        indicatorsContainer.appendChild(diamond);
    });

    const diamonds = indicatorsContainer.querySelectorAll('.diamond');

    // Observer to track which card is currently in the center of the viewport
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find the index of the visible card
                const activeIndex = Array.from(cards).indexOf(entry.target);
                // Update diamonds
                diamonds.forEach((diamond, i) => {
                    if (i === activeIndex) {
                        diamond.classList.add('active');
                    } else {
                        diamond.classList.remove('active');
                    }
                });
            }
        });
    }, {
        root: track,
        threshold: 0.6 // Card must be 60% visible to trigger as 'active'
    });

    cards.forEach(card => cardObserver.observe(card));
});

// Loading facebook feed
document.querySelectorAll(".load-facebook-feed").forEach(btn => {

    btn.addEventListener("click", function(){

        const container = this.parentElement.querySelector(".facebook-feed-container");

        container.innerHTML = `
        <div id="fb-root"></div>
        <script async defer crossorigin="anonymous"
        src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0"><\/script>

        <div class="fb-page"
            data-href="https://www.facebook.com/RobloxThailandCommunity"
            data-tabs="timeline"
            data-width="340"
            data-height="500"
            data-small-header="false"
            data-adapt-container-width="true"
            data-hide-cover="false"
            data-show-facepile="true">
        </div>
        `;

        this.remove();
    });

});