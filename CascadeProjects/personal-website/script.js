document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('#contact form');
    
    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const nameInput = contactForm.querySelector('input[type="text"]');
        const emailInput = contactForm.querySelector('input[type="email"]');
        const messageInput = contactForm.querySelector('textarea');
        
        if (nameInput.value && emailInput.value && messageInput.value) {
            alert('Merci pour votre message ! Je vous répondrai bientôt.');
            contactForm.reset();
        } else {
            alert('Veuillez remplir tous les champs.');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            targetSection.scrollIntoView({ 
                behavior: 'smooth' 
            });
        });
    });

    // Optional: Add subtle animations to sections
    const sections = document.querySelectorAll('.section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
});
