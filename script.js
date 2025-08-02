 document.addEventListener('DOMContentLoaded', () => {
    const navbar = document.getElementById('navbar');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    // Initialize Lucide icons
    lucide.createIcons();

    // Change navbar style on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Toggle mobile menu
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    document.querySelectorAll('#mobile-menu a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });

    // IntersectionObserver to add fade-in effect on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        if (section.id !== 'hero') {
            observer.observe(section);
        }
    });

    // Highlight active nav link on scroll
    const highlightNavLink = () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', highlightNavLink);
    highlightNavLink(); // Call on page load to set initial active link


    // --- Gemini API Integration for Contact Form ---

    const improveMessageBtn = document.getElementById('improve-message-btn');
    const improveMessageText = document.getElementById('improve-message-text');
    const improveMessageLoader = document.getElementById('improve-message-loader');
    const messageTextarea = document.getElementById('message');
    const messageBox = document.getElementById('message-box');

    // Generic message display function
    function displayMessage(text, isError = false) {
        messageBox.textContent = text;
        messageBox.classList.remove('hidden', 'bg-red-500', 'bg-green-500');
        if (isError) {
            messageBox.classList.add('bg-red-500', 'text-white');
        } else {
            messageBox.classList.add('bg-green-500', 'text-white');
        }
    }

    // Function to handle the Gemini API call
    async function improveMessage() {
        const userMessage = messageTextarea.value.trim();
        if (userMessage.length < 10) {
            displayMessage('Please enter a longer message to improve.', true);
            return;
        }

        // Show loading state
        improveMessageText.classList.add('hidden');
        improveMessageLoader.classList.remove('hidden');
        improveMessageBtn.disabled = true;
        messageTextarea.disabled = true;
        messageBox.classList.add('hidden');

        try {
            const prompt = `Rewrite the following message to be more professional, polite, and concise. Do not add a subject line or a signature. Do not include a greeting. Just provide the rewritten message.

            Message: "${userMessage}"`;

            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { contents: chatHistory };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const text = result.candidates[0].content.parts[0].text;
                messageTextarea.value = text;
                displayMessage('Message improved successfully!', false);
            } else {
                throw new Error("No content received from the API.");
            }

        } catch (error) {
            console.error('Error improving message:', error);
            displayMessage('An error occurred. Please try again later.', true);
        } finally {
            // Hide loading state
            improveMessageText.classList.remove('hidden');
            improveMessageLoader.classList.add('hidden');
            improveMessageBtn.disabled = false;
            messageTextarea.disabled = false;
        }
    }

    improveMessageBtn.addEventListener('click', improveMessage);
});
