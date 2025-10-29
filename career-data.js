// career-data.js - Main data handler for PathFinder website
// Located in main folder - data files in data/ folder

class CareerData {
    constructor() {
        this.careerData = null;
        this.streamsData = null;
        this.examsData = null;
        this.loaded = false;
    }

    // Load all data files from data/ folder
    async loadAllData() {
        try {
            await Promise.all([
                this.loadCareerData(),
                this.loadStreamsData(),
                this.loadExamsData()
            ]);
            this.loaded = true;
            console.log('✅ All career data loaded successfully!');
            this.initializeWebsite();
        } catch (error) {
            console.error('❌ Error loading career data:', error);
        }
    }

    // Load career data from data/career.json
    async loadCareerData() {
        try {
            const response = await fetch('./data/career.json');
            this.careerData = await response.json();
            console.log('✅ Career data loaded from data/career.json');
        } catch (error) {
            console.error('❌ Error loading data/career.json:', error);
            this.careerData = { streams: [], exams: [], careers: [] };
        }
    }

    // Load streams data from data/streams.json
    async loadStreamsData() {
        try {
            const response = await fetch('./data/streams.json');
            this.streamsData = await response.json();
            console.log('✅ Streams data loaded from data/streams.json');
        } catch (error) {
            console.error('❌ Error loading data/streams.json:', error);
            this.streamsData = { streams: {} };
        }
    }

    // Load exams data from data/exams.json
    async loadExamsData() {
        try {
            const response = await fetch('./data/exams.json');
            this.examsData = await response.json();
            console.log('✅ Exams data loaded from data/exams.json');
        } catch (error) {
            console.error('❌ Error loading data/exams.json:', error);
            this.examsData = { examCategories: [], examLevels: {} };
        }
    }

    // Initialize website after data load
    initializeWebsite() {
        if (typeof window.initializeCareerFeatures === 'function') {
            window.initializeCareerFeatures();
        }
        
        this.updateQuickStats();
        this.populateStreamOptions();
        
        // Show loading complete message
        this.showLoadingComplete();
    }

    // Show loading complete message
    showLoadingComplete() {
        console.log('🎉 PathFinder is ready! All data loaded successfully.');
        
        // You can add a subtle notification here if needed
        const loadingElement = document.getElementById('loadingStatus');
        if (loadingElement) {
            loadingElement.innerHTML = '✅ Data loaded successfully!';
            loadingElement.style.color = '#4cd964';
        }
    }

    // Get all streams
    getAllStreams() {
        return this.careerData?.streams || [];
    }

    // Get specific stream by ID
    getStream(streamId) {
        const careerStream = this.careerData?.streams.find(stream => stream.id === streamId);
        const streamsDataStream = this.streamsData?.streams[streamId];
        
        // Merge data from both sources if available
        return careerStream || streamsDataStream || null;
    }

    // Get exams by category
    getExamsByCategory(category) {
        const categoryData = this.examsData?.examCategories.find(cat => 
            cat.category.toLowerCase() === category.toLowerCase()
        );
        return categoryData?.exams || [];
    }

    // Get exams by educational level
    getExamsByLevel(level) {
        return this.examsData?.examLevels[level] || [];
    }

    // Search across all data
    searchData(searchTerm) {
        if (!searchTerm) return [];
        
        const results = [];
        const term = searchTerm.toLowerCase();

        // Search in career streams
        if (this.careerData?.streams) {
            this.careerData.streams.forEach(stream => {
                if (stream.name.toLowerCase().includes(term) || 
                    stream.description.toLowerCase().includes(term)) {
                    results.push({
                        type: 'stream',
                        data: stream,
                        name: stream.name,
                        description: stream.description,
                        icon: 'fas fa-stream'
                    });
                }
            });
        }

        // Search in streams data
        if (this.streamsData?.streams) {
            Object.values(this.streamsData.streams).forEach(stream => {
                if (stream.name.toLowerCase().includes(term) || 
                    stream.description.toLowerCase().includes(term)) {
                    // Avoid duplicates
                    if (!results.some(r => r.type === 'stream' && r.name === stream.name)) {
                        results.push({
                            type: 'stream',
                            data: stream,
                            name: stream.name,
                            description: stream.description,
                            icon: 'fas fa-stream'
                        });
                    }
                }
            });
        }

        // Search in exams
        if (this.examsData?.examCategories) {
            this.examsData.examCategories.forEach(category => {
                category.exams.forEach(exam => {
                    if (exam.name.toLowerCase().includes(term) ||
                        (exam.fullForm && exam.fullForm.toLowerCase().includes(term)) ||
                        exam.purpose.toLowerCase().includes(term)) {
                        results.push({
                            type: 'exam',
                            data: exam,
                            name: exam.name,
                            description: exam.purpose,
                            category: category.category,
                            icon: 'fas fa-file-alt'
                        });
                    }
                });
            });
        }

        return results;
    }

    // Get career recommendations based on stream
    getCareerRecommendations(streamId) {
        const stream = this.getStream(streamId);
        if (!stream) return null;

        return {
            stream: stream,
            careerPaths: stream.careerPaths || [],
            jobOpportunities: stream.jobOpportunities || [],
            governmentExams: stream.governmentExams || [],
            professionalCourses: stream.professionalCourses || []
        };
    }

    // Get job opportunities by stream
    getJobsByStream(streamId) {
        const stream = this.getStream(streamId);
        return stream?.jobOpportunities || [];
    }

    // Get government exams by stream
    getExamsByStream(streamId) {
        const stream = this.getStream(streamId);
        return stream?.governmentExams || [];
    }

    // Update quick stats on homepage
    updateQuickStats() {
        const stats = {
            totalStreams: this.getAllStreams().length,
            totalExams: this.examsData?.examCategories?.reduce((total, cat) => 
                total + (cat.exams?.length || 0), 0) || 0,
            totalCareers: this.careerData?.streams?.reduce((total, stream) => 
                total + (stream.jobOpportunities?.length || 0), 0) || 0
        };

        // Update DOM elements if they exist
        const updateElement = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        };

        updateElement('totalStreams', stats.totalStreams);
        updateElement('totalExams', stats.totalExams);
        updateElement('totalCareers', stats.totalCareers);
    }

    // Populate stream options in forms
    populateStreamOptions() {
        const streamSelectors = document.querySelectorAll('.stream-selector, #streamSelect');
        
        streamSelectors.forEach(selector => {
            // Clear existing options except the first one
            while (selector.children.length > 1) {
                selector.removeChild(selector.lastChild);
            }
            
            this.getAllStreams().forEach(stream => {
                const option = document.createElement('option');
                option.value = stream.id;
                option.textContent = stream.name;
                selector.appendChild(option);
            });
        });
    }

    // Get all exam categories
    getExamCategories() {
        return this.examsData?.examCategories || [];
    }

    // Get preparation resources
    getPreparationResources() {
        return this.examsData?.preparationResources || {};
    }

    // Get trending careers
    getTrendingCareers() {
        return [
            { name: 'Data Scientist', growth: '25%', salary: '₹8-30 LPA' },
            { name: 'AI Engineer', growth: '30%', salary: '₹10-35 LPA' },
            { name: 'Cybersecurity Analyst', growth: '28%', salary: '₹6-25 LPA' },
            { name: 'Digital Marketer', growth: '20%', salary: '₹4-15 LPA' }
        ];
    }
}

// Create global instance
window.careerDataManager = new CareerData();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        window.careerDataManager.loadAllData();
    });
} else {
    // DOM already loaded
    window.careerDataManager.loadAllData();
}

// Display search results function
function displaySearchResults(results, searchTerm) {
    const resultsContainer = document.getElementById('searchResultsOutput');
    const searchSection = document.getElementById('searchResults');
    
    if (!resultsContainer || !searchSection) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search fa-3x"></i>
                <h3>No results found for "${searchTerm}"</h3>
                <p>Try searching with different keywords</p>
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
                            <i class="${result.icon}"></i>
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
}

// Handle search result click
function handleSearchResultClick(type, name) {
    console.log(`Clicked on ${type}: ${name}`);
    // You can implement navigation to relevant pages here
    alert(`You selected: ${name} (${type})`);
}