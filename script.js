// script.js - Complete functionality for PathFinder website
// Integrated with career-data.js and all features

// ===== GLOBAL VARIABLES =====
let currentStream = '';
let searchData = [];
let currentPage = 'home';

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initializeWebsite();
    initializeEventListeners();
    initializeCareerFeatures();
});

// ===== WEBSITE INITIALIZATION =====
function initializeWebsite() {
    console.log('🚀 Initializing PathFinder Website...');
    
    // Check if career data manager is loaded
    if (window.careerDataManager && window.careerDataManager.loaded) {
        updateUIWithData();
    } else {
        // Wait for data to load
        const checkDataLoaded = setInterval(() => {
            if (window.careerDataManager && window.careerDataManager.loaded) {
                clearInterval(checkDataLoaded);
                updateUIWithData();
            }
        }, 100);
    }
    
    // Update active navigation
    updateActiveNavigation();
    
    // Initialize animations
    initializeAnimations();
}

function initializeEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCareers();
            }
        });
        
        searchInput.addEventListener('input', function(e) {
            if (e.target.value.length > 2) {
                performLiveSearch(e.target.value);
            }
        });
    }

    // Quick option cards hover effects
    const optionCards = document.querySelectorAll('.option-card');
    optionCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.05)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Stream selection cards
    const streamCards = document.querySelectorAll('.subject-card');
    streamCards.forEach(card => {
        card.addEventListener('click', function() {
            const stream = this.getAttribute('data-stream') || this.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
            if (stream) {
                selectStream(stream);
            }
        });
    });

    // Mobile menu toggle (if needed)
    initializeMobileMenu();

    // Smooth scrolling for internal links
    initializeSmoothScrolling();
}

function initializeCareerFeatures() {
    console.log('🎯 Initializing career features...');
    
    // Initialize search functionality if not already done
    const searchInput = document.getElementById('searchInput');
    if (searchInput && !searchInput.hasListener) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim();
            if (searchTerm.length > 2) {
                if (window.careerDataManager && window.careerDataManager.loaded) {
                    const results = window.careerDataManager.searchData(searchTerm);
                    displaySearchResults(results, searchTerm);
                }
            }
        });
        searchInput.hasListener = true;
    }
}

// ===== STREAM SELECTION FUNCTIONS =====
function selectStream(stream) {
    currentStream = stream;
    
    // Add visual feedback
    const cards = document.querySelectorAll('.subject-card');
    cards.forEach(card => {
        card.style.transform = 'scale(0.95)';
        card.style.opacity = '0.6';
        card.style.borderColor = 'transparent';
    });
    
    const selectedCard = document.querySelector(`[data-stream="${stream}"]`);
    if (selectedCard) {
        selectedCard.style.transform = 'scale(1.05)';
        selectedCard.style.opacity = '1';
        selectedCard.style.borderColor = '#4cd964';
    }
    
    // Show recommendations
    showRecommendations(stream);
    
    // Scroll to results
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function showStreamSelection() {
    const streamSection = document.getElementById('streamSection');
    if (streamSection) {
        streamSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function showExams() {
    // Navigate to exams page or show exams section
    if (window.location.pathname.includes('exams.html')) {
        scrollToSection('engineeringExams');
    } else {
        window.location.href = 'exams.html';
    }
}

function showDegrees() {
    if (window.location.pathname.includes('degrees.html')) {
        scrollToSection('scienceDegrees');
    } else {
        window.location.href = 'degrees.html';
    }
}

function showJobs() {
    if (window.location.pathname.includes('jobs.html')) {
        scrollToSection('scienceJobs');
    } else {
        window.location.href = 'jobs.html';
    }
}

// ===== SEARCH FUNCTIONALITY =====
function searchCareers() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    if (searchTerm === '') {
        showNotification('Please enter something to search!', 'warning');
        return;
    }

    let results = [];
    
    // Use career data manager if available
    if (window.careerDataManager && window.careerDataManager.loaded) {
        results = window.careerDataManager.searchData(searchTerm);
    } else {
        // Fallback search
        results = performFallbackSearch(searchTerm);
    }
    
    displaySearchResults(results, searchTerm);
}

function performLiveSearch(searchTerm) {
    if (!window.careerDataManager || !window.careerDataManager.loaded) return;
    
    const results = window.careerDataManager.searchData(searchTerm);
    if (results.length > 0) {
        showQuickResults(results.slice(0, 5), searchTerm);
    }
}

function performFallbackSearch(term) {
    // Simple fallback search implementation
    const results = [];
    
    // Search in predefined streams
    const streams = [
        { name: 'Science Stream', description: 'Engineering, Medical, Research careers', type: 'stream' },
        { name: 'Commerce Stream', description: 'Business, Finance, Accounting careers', type: 'stream' },
        { name: 'Arts Stream', description: 'Civil Services, Humanities, Creative arts', type: 'stream' },
        { name: 'JEE Main', description: 'Engineering entrance exam', type: 'exam' },
        { name: 'NEET UG', description: 'Medical entrance exam', type: 'exam' }
    ];
    
    streams.forEach(item => {
        if (item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)) {
            results.push({
                type: item.type,
                name: item.name,
                description: item.description,
                icon: item.type === 'stream' ? 'fas fa-stream' : 'fas fa-file-alt'
            });
        }
    });
    
    return results;
}

function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('searchResultsOutput');
    const searchSection = document.getElementById('searchResults');
    
    if (!resultsContainer || !searchSection) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h3>No results found for "${searchTerm}"</h3>
                <p>Try searching with different keywords like "Engineering", "Medical", "JEE", etc.</p>
            </div>
        `;
    } else {
        resultsContainer.innerHTML = `
            <div class="results-count">
                <p>Found ${results.length} results for "${searchTerm}"</p>
            </div>
            <div class="results-grid">
                ${results.map(result => `
                    <div class="search-result-card" onclick="handleSearchResultClick('${result.type}', '${result.name}')">
                        <div class="result-icon">
                            <i class="${result.icon || 'fas fa-search'}"></i>
                        </div>
                        <div class="result-content">
                            <h4>${result.name}</h4>
                            <p>${result.description}</p>
                            ${result.category ? `<span class="result-category">${result.category}</span>` : ''}
                            <span class="result-type">${result.type.toUpperCase()}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    searchSection.style.display = 'block';
    searchSection.scrollIntoView({ behavior: 'smooth' });
}

function showQuickResults(results, searchTerm) {
    // Implement quick results dropdown if needed
    console.log('Quick results:', results);
}

function handleSearchResultClick(type, name) {
    console.log(`Clicked on ${type}: ${name}`);
    
    switch(type) {
        case 'stream':
            handleStreamSelectionFromSearch(name);
            break;
        case 'exam':
            handleExamSelectionFromSearch(name);
            break;
        default:
            showNotification(`You selected: ${name}`, 'info');
    }
}

function handleStreamSelectionFromSearch(streamName) {
    const streamMap = {
        'Science Stream': 'science',
        'Commerce Stream': 'commerce', 
        'Arts Stream': 'arts',
        'Vocational Courses': 'vocational'
    };
    
    const streamId = streamMap[streamName];
    if (streamId) {
        selectStream(streamId);
    }
}

function handleExamSelectionFromSearch(examName) {
    showNotification(`Opening details for: ${examName}`, 'info');
    // Navigate to exams page or show exam details
    if (!window.location.pathname.includes('exams.html')) {
        window.location.href = 'exams.html';
    }
}

// ===== RECOMMENDATION SYSTEM =====
function showRecommendations(stream) {
    const resultsContainer = document.getElementById('recommendationOutput');
    const resultsSection = document.getElementById('resultsSection');
    
    if (!resultsContainer || !resultsSection) return;
    
    let recommendations = null;
    
    // Get recommendations from career data manager
    if (window.careerDataManager && window.careerDataManager.loaded) {
        recommendations = window.careerDataManager.getCareerRecommendations(stream);
    }
    
    if (!recommendations) {
        // Fallback recommendations
        recommendations = getFallbackRecommendations(stream);
    }
    
    resultsContainer.innerHTML = createRecommendationHTML(stream, recommendations);
    resultsSection.style.display = 'block';
}

function getFallbackRecommendations(stream) {
    const fallbackData = {
        science: {
            careerPaths: [
                {
                    stage: "After 12th",
                    options: [
                        {
                            name: "Engineering",
                            degrees: ["BTech/BE (4 years)", "BArch (5 years)"],
                            exams: ["JEE Main", "JEE Advanced", "State CETs"],
                            specializations: ["Computer Science", "Mechanical", "Civil", "Electrical"]
                        },
                        {
                            name: "Medical", 
                            degrees: ["MBBS (5.5 years)", "BDS (5 years)", "BPharm"],
                            exams: ["NEET UG"],
                            specializations: ["General Medicine", "Surgery", "Dentistry"]
                        }
                    ]
                }
            ],
            jobOpportunities: [
                {
                    field: "Engineering & Technology",
                    jobs: ["Software Engineer", "Mechanical Engineer", "Data Scientist"],
                    salaryRange: "₹4-25 LPA"
                }
            ]
        },
        commerce: {
            careerPaths: [
                {
                    stage: "Professional Courses", 
                    options: [
                        {
                            name: "CA",
                            degrees: ["Chartered Accountancy"],
                            exams: ["CA Foundation", "CA Intermediate", "CA Final"],
                            specializations: ["Auditing", "Taxation", "Finance"]
                        }
                    ]
                }
            ],
            jobOpportunities: [
                {
                    field: "Accounting & Finance",
                    jobs: ["Chartered Accountant", "Financial Analyst"],
                    salaryRange: "₹5-20 LPA"
                }
            ]
        },
        arts: {
            careerPaths: [
                {
                    stage: "Civil Services",
                    options: [
                        {
                            name: "UPSC",
                            degrees: ["Any Graduation"],
                            exams: ["UPSC Civil Services"],
                            specializations: ["IAS", "IPS", "IFS"]
                        }
                    ]
                }
            ],
            jobOpportunities: [
                {
                    field: "Government Services", 
                    jobs: ["IAS Officer", "IPS Officer"],
                    salaryRange: "₹12-25 LPA"
                }
            ]
        }
    };
    
    return fallbackData[stream] || {};
}

function createRecommendationHTML(stream, recommendations) {
    const streamName = stream.charAt(0).toUpperCase() + stream.slice(1);
    
    return `
        <div class="stream-header" style="text-align: center; margin-bottom: 2rem;">
            <h3 style="color: #333; font-size: 1.8rem;">Career Path for ${streamName} Stream</h3>
        </div>
        <div class="recommendation-content">
            ${createStreamPathHTML(stream, recommendations)}
            ${createCareerOpportunitiesHTML(recommendations)}
            ${createNextStepsHTML(stream)}
        </div>
    `;
}

function createStreamPathHTML(stream, recommendations) {
    if (!recommendations.careerPaths || recommendations.careerPaths.length === 0) {
        return '';
    }
    
    return `
        <div class="path-section" style="margin-bottom: 2rem;">
            <h4 style="color: #667eea; margin-bottom: 1rem;">📚 Career Path</h4>
            <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 10px;">
                ${recommendations.careerPaths.map(path => `
                    <div style="margin-bottom: 1rem;">
                        <h5 style="color: #333; margin-bottom: 0.5rem;">${path.stage}</h5>
                        ${path.options ? path.options.map(option => `
                            <div style="background: white; padding: 1rem; margin: 0.5rem 0; border-radius: 8px; border-left: 4px solid #4cd964;">
                                <strong style="color: #333;">${option.name}</strong>
                                ${option.degrees ? `<p style="margin: 0.3rem 0; color: #666;">Degrees: ${option.degrees.join(', ')}</p>` : ''}
                                ${option.exams ? `<p style="margin: 0.3rem 0; color: #666;">Exams: ${option.exams.join(', ')}</p>` : ''}
                            </div>
                        `).join('') : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createCareerOpportunitiesHTML(recommendations) {
    if (!recommendations.jobOpportunities || recommendations.jobOpportunities.length === 0) {
        return '';
    }
    
    return `
        <div class="careers-section" style="margin-bottom: 2rem;">
            <h4 style="color: #667eea; margin-bottom: 1rem;">💼 Career Opportunities</h4>
            <div style="display: grid; gap: 1rem;">
                ${recommendations.jobOpportunities.map(job => `
                    <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h5 style="color: #333; margin-bottom: 0.5rem;">${job.field}</h5>
                        <p style="color: #666; margin-bottom: 0.5rem;"><strong>Jobs:</strong> ${job.jobs.join(', ')}</p>
                        ${job.salaryRange ? `<p style="color: #4cd964; font-weight: 600;">Salary: ${job.salaryRange}</p>` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function createNextStepsHTML(stream) {
    return `
        <div class="next-steps" style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 2rem; border-radius: 15px; color: white; text-align: center;">
            <h4 style="margin-bottom: 1rem;">🚀 Ready to Take the Next Step?</h4>
            <p style="margin-bottom: 1.5rem; opacity: 0.9;">Explore detailed information about this stream and plan your career journey.</p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                <button onclick="showDegrees()" style="background: white; color: #667eea; border: none; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-graduation-cap"></i> View Degrees
                </button>
                <button onclick="showExams()" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-file-alt"></i> Check Exams
                </button>
                <button onclick="showJobs()" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; padding: 0.8rem 1.5rem; border-radius: 25px; font-weight: 600; cursor: pointer;">
                    <i class="fas fa-briefcase"></i> See Jobs
                </button>
            </div>
        </div>
    `;
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 1rem;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
    `;
    
    notification.querySelector('button').style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationColor(type) {
    const colors = {
        'success': '#4cd964',
        'error': '#ff3b30', 
        'warning': '#ff9500',
        'info': '#5ac8fa'
    };
    return colors[type] || '#5ac8fa';
}

// ===== UI UPDATE FUNCTIONS =====
function updateUIWithData() {
    console.log('🔄 Updating UI with career data...');
    
    // Update quick stats
    updateQuickStats();
    
    // Populate stream options
    populateStreamOptions();
    
    // Update trending careers
    updateTrendingCareers();
    
    // Update exam highlights
    updateExamHighlights();
}

function updateQuickStats() {
    if (!window.careerDataManager) return;
    
    const stats = {
        totalStreams: window.careerDataManager.getAllStreams().length,
        totalExams: window.careerDataManager.getExamCategories().reduce((total, cat) => 
            total + (cat.exams?.length || 0), 0),
        totalCareers: window.careerDataManager.getAllStreams().reduce((total, stream) => 
            total + (stream.jobOpportunities?.length || 0), 0)
    };
    
    // Update DOM elements
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };
    
    updateElement('totalStreams', stats.totalStreams);
    updateElement('totalExams', stats.totalExams);
    updateElement('totalCareers', stats.totalCareers);
}

function populateStreamOptions() {
    if (!window.careerDataManager) return;
    
    const streamSelectors = document.querySelectorAll('.stream-selector, #streamSelect');
    
    streamSelectors.forEach(selector => {
        // Clear existing options except the first one
        while (selector.children.length > 1) {
            selector.removeChild(selector.lastChild);
        }
        
        window.careerDataManager.getAllStreams().forEach(stream => {
            const option = document.createElement('option');
            option.value = stream.id;
            option.textContent = stream.name;
            selector.appendChild(option);
        });
    });
}

function updateTrendingCareers() {
    const trendingContainer = document.getElementById('trendingCareers');
    if (!trendingContainer) return;
    
    const trendingCareers = [
        { name: 'Data Scientist', growth: '25%', salary: '₹8-30 LPA' },
        { name: 'AI Engineer', growth: '30%', salary: '₹10-35 LPA' },
        { name: 'Cybersecurity Analyst', growth: '28%', salary: '₹6-25 LPA' }
    ];
    
    trendingContainer.innerHTML = trendingCareers.map(career => `
        <div class="trending-career">
            <h4>${career.name}</h4>
            <p>Growth: <span style="color: #4cd964;">${career.growth}</span></p>
            <p>Salary: ${career.salary}</p>
        </div>
    `).join('');
}

function updateExamHighlights() {
    const examsContainer = document.getElementById('examHighlights');
    if (!examsContainer) return;
    
    const highlightedExams = [
        { name: 'JEE Main', purpose: 'Engineering Entrance', deadline: 'Dec-Jan' },
        { name: 'NEET UG', purpose: 'Medical Entrance', deadline: 'Mar-Apr' },
        { name: 'UPSC', purpose: 'Civil Services', deadline: 'Feb-Mar' }
    ];
    
    examsContainer.innerHTML = highlightedExams.map(exam => `
        <div class="exam-highlight">
            <h4>${exam.name}</h4>
            <p>${exam.purpose}</p>
            <span>Registration: ${exam.deadline}</span>
        </div>
    `).join('');
}

// ===== UTILITY FUNCTIONS =====
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function shareCareerPath() {
    if (navigator.share) {
        navigator.share({
            title: 'My Career Path - PathFinder',
            text: `Check out my career recommendations for ${currentStream} stream!`,
            url: window.location.href
        });
    } else {
        showNotification('Web Share API not supported in your browser', 'warning');
    }
}

function initializeMobileMenu() {
    // Add mobile menu functionality if needed
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
}

function initializeSmoothScrolling() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

function initializeAnimations() {
    // Initialize any custom animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    document.querySelectorAll('.glass-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
}

function updateActiveNavigation() {
    // Update active navigation based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

// ===== CAREER ASSESSMENT FUNCTIONS =====
function startCareerAssessment() {
    showNotification('Career assessment feature coming soon!', 'info');
    // Implement career assessment logic here
}

function downloadCareerGuide() {
    showNotification('Career guide download started!', 'success');
    // Implement PDF download functionality
}

// ===== PERFORMANCE OPTIMIZATION =====
// Debounce search function
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Throttle scroll events
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// ===== ERROR HANDLING =====
window.addEventListener('error', function(e) {
    console.error('Website error:', e.error);
    showNotification('Something went wrong. Please refresh the page.', 'error');
});

// ===== OFFLINE SUPPORT =====
window.addEventListener('online', function() {
    showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.', 'warning');
});

// ===== EXPORT FUNCTIONS FOR GLOBAL USE =====
window.selectStream = selectStream;
window.showStreamSelection = showStreamSelection;
window.showExams = showExams;
window.showDegrees = showDegrees;
window.showJobs = showJobs;
window.searchCareers = searchCareers;
window.showNotification = showNotification;
window.scrollToTop = scrollToTop;
window.shareCareerPath = shareCareerPath;
window.startCareerAssessment = startCareerAssessment;
window.downloadCareerGuide = downloadCareerGuide;

console.log('✅ script.js loaded successfully!');

// Add CSS animations
const animationStyles = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.fade-in {
    animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = animationStyles;
document.head.appendChild(styleSheet);