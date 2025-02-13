const youtubeUrlInput = document.getElementById('youtube-url');

// Add thumbnail preview functionality 
youtubeUrlInput.addEventListener('input', function(e) {
    const url = e.target.value;
    const videoId = extractVideoId(url);
    if (videoId) {
        updateThumbnail(videoId);
    }
});

const urlInput = document.getElementById('youtube-url');
const urlSubmitBtn = document.getElementById('url-submit');
const queryInput = document.getElementById('query');
const submitBtn = document.getElementById('submit-btn');
const videoInfo = document.querySelector('.video-info');

// Handle URL submission first
urlSubmitBtn.addEventListener('click', () => {
    const url = urlInput.value.trim();
    if (!url) return;
    
    const videoId = extractVideoId(url);
    if (videoId) {
        updateVideoInfo(videoId, url);
        queryInput.disabled = false;
        submitBtn.disabled = false;
        document.querySelector('.welcome-message')?.remove();
    }
});

function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        } else if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.substring(1);
        }
    } catch (e) {
        return null;
    }
    return null;
}

// Add chip functionality
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const query = chip.dataset.query;
        document.getElementById('query').value = query;
    });
});

// Update thumbnail preview
function updateThumbnail(videoId) {
    const thumbnailPreview = document.getElementById('thumbnail-preview');
    thumbnailPreview.innerHTML = `
        <img src="https://img.youtube.com/vi/${videoId}/maxresdefault.jpg" 
             alt="Video thumbnail" 
             style="width: 100%; height: 100%; object-fit: cover;">`;
}

// Update status indicator
function updateStatus(status, isError = false) {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.dot');
    
    statusText.textContent = status;
    statusDot.style.background = isError ? '#ef4444' : '#22c55e';
}

// Handle URL submission
document.getElementById('url-submit').addEventListener('click', () => {
    const url = document.getElementById('youtube-url').value.trim();
    if (!url) return;
    
    const videoId = extractVideoId(url);
    if (videoId) {
        updateThumbnail(videoId);
        document.getElementById('query').disabled = false;
        document.getElementById('submit-btn').disabled = false;
        updateStatus('Ready to answer questions');
        document.querySelector('.welcome-screen')?.remove();
    } else {
        updateStatus('Invalid YouTube URL', true);
    }
});

function updateVideoInfo(videoId, url) {
    videoInfo.classList.remove('hidden');
    updateThumbnail(videoId);
    document.querySelector('.video-url').textContent = url;
    // You could also fetch video title using YouTube API here
}

// Update API configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000',
    BACKUP_URL: 'http://localhost:8000',
    MAX_RETRIES: 3,
    TIMEOUT: 5000
};

// Improved server status check
async function checkServerStatus() {
    const urls = [API_CONFIG.BASE_URL, API_CONFIG.BACKUP_URL];
    
    for (const baseUrl of urls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
            
            const response = await fetch(`${baseUrl}/health`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                API_CONFIG.BASE_URL = baseUrl; // Use working URL
                updateStatus('Connected to Server', false);
                return true;
            }
        } catch (error) {
            console.warn(`Connection failed to ${baseUrl}:`, error);
        }
    }
    
    updateStatus('Server Offline', true);
    return false;
}

// Modify the submit event listener
document.getElementById('chat-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check server status before proceeding
    const isServerOnline = await checkServerStatus();
    if (!isServerOnline) {
        appendErrorMessage('Server is offline. Please make sure the backend server is running on port 8000');
        return;
    }

    const youtubeUrlInput = document.getElementById('youtube-url');
    const queryInput = document.getElementById('query');
    const submitBtn = document.getElementById('submit-btn');
    const youtubeUrl = youtubeUrlInput.value.trim();
    const query = queryInput.value.trim();
    
    if (!youtubeUrl || !query) return;
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
        <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Processing...
    `;
    
    try {
        // First append the user's query to the chat
        appendUserMessage(query);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}/process-and-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ youtube_url: youtubeUrl, query })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to process request');
        }
        
        const data = await response.json();
        appendBotMessage(data);
        queryInput.value = ''; // Clear the input after sending
        
    } catch (error) {
        appendErrorMessage(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Ask Question';
    }
});

// Update error message display
function appendErrorMessage(message) {
    appendMessageHTML('bot', `
        <div class="message-content error">
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <span>${message}</span>
            </div>
            <div class="error-help">
                <p>To fix this:</p>
                <ol>
                    <li>Make sure the Python backend server is running</li>
                    <li>Check if the server is running on port 8000</li>
                    <li>Try refreshing the page</li>
                </ol>
            </div>
        </div>
    `);
}

// Add periodic server status check
setInterval(checkServerStatus, 30000); // Check every 30 seconds

// Remove the duplicate chat form submit event listener

// Modified appendUserMessage function
function appendUserMessage(query) {
    const html = `
        <div class="message user">
            <div class="message-content">
                ${query}
            </div>
        </div>
    `;
    appendToChat(html);
}

function appendBotMessage(data) {
    let botMessageHTML = `
        <div class="message bot">
            <div class="message-content">
                ${data.matching_segments?.length ? `
                    <div class="segments-container">
                        <h4 class="segments-title">📍 Relevant Video Segments</h4>
                        <div class="timestamps-grid">
                            ${data.matching_segments.map((seg, index) => `
                                <div class="timestamp-card">
                                    <div class="timestamp-header">
                                        <span class="timestamp-badge">
                                            <i class="fas fa-clock"></i> ${seg.timestamp || '00:00'}
                                        </span>
                                    </div>
                                    <div class="segment-content">
                                        <p>${cleanTextContent(seg.text)}</p>
                                        <div class="segment-actions">
                                            <a href="${seg.timestamp_link}" 
                                               target="_blank" 
                                               class="timestamp-link primary">
                                                <i class="fas fa-play"></i> Watch
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        ${data.summary ? `
                            <div class="detailed-summary-section">
                                <div class="summary-header">
                                    <h4>
                                        <i class="fas fa-brain"></i> Analysis Based on Query
                                        <span class="query-context">${cleanTextContent(data.query)}</span>
                                    </h4>
                                </div>
                                <div class="summary-content">
                                    ${formatSummaryContent(data.summary)}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-segments">
                        <p>No relevant segments found for your query.</p>
                    </div>
                `}
            </div>
        </div>
    `;
    appendToChat(botMessageHTML);
}

function cleanTextContent(text) {
    if (!text) return '';
    
    return String(text)
        .replace(/\[object Object\]/g, '')
        .replace(/undefined/g, '')
        .replace(/##/g, '') // Remove hash symbols
        .replace(/\n+/g, '\n') // Normalize line breaks
        .replace(/^\s+|\s+$/gm, '') // Trim each line
        .trim();
}

function formatSummaryContent(summary) {
    if (!summary) return '';
    
    // Find the Main Points section and clean up
    const mainPointsMatch = summary.match(/Main Points:?([\s\S]*?)(?=(?:Detailed Analysis|Key Insights|$))/i);
    if (!mainPointsMatch) return '';
    
    // Clean up the main points content
    const mainPoints = mainPointsMatch[1]
        .split('\n')
        .map(point => point
            .replace(/^[•\-*:]\s*/, '') // Remove bullet points, dashes, or colons
            .replace(/^\s*\d+\.\s*/, '') // Remove numbered lists
            .replace(/\*\*/g, '') // Remove asterisks
            .trim())
        .filter(point => point.length > 0 && !point.includes('Main Points')); // Remove empty lines and section headers
    
    return `
        <div class="summary-section">
            <div class="section-block">
                <h3 class="section-title">Main Points</h3>
                <div class="points-list">
                    ${mainPoints.map(point => `<p class="point">${point}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Add marked.js configuration
marked.setOptions({
    renderer: new marked.Renderer(),
    highlight: function(code) {
        return code;
    },
    pedantic: false,
    gfm: true,
    breaks: true,
    sanitize: false,
    smartypants: false,
    xhtml: false
});

// Initialize marked with proper configuration
const markdownRenderer = {
    heading(text, level) {
        return `<h${level} class="markdown-heading">${text}</h${level}>`;
    },
    paragraph(text) {
        return `<p class="markdown-paragraph">${text}</p>`;
    },
    list(body, ordered) {
        const type = ordered ? 'ol' : 'ul';
        return `<${type} class="markdown-list">${body}</${type}>`;
    },
    listitem(text) {
        return `<li class="markdown-list-item">${text}</li>`;
    },
    code(code, language) {
        return `<code class="markdown-code ${language || ''}">${code}</code>`;
    }
};

// Update marked configuration
marked.use({ renderer: markdownRenderer });

function generateContextualSummary(text, index, segments) {
    // Get surrounding context (3 segments before and after)
    const start = Math.max(0, index - 3);
    const end = Math.min(segments.length, index + 4);
    const contextSegments = segments.slice(start, end);
    
    // Combine context and current segment
    const contextText = contextSegments
        .map(seg => seg.text)
        .join(' ');
    
    // Extract meaningful sentences and capitalize
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    let summary = '';
    
    if (sentences.length) {
        // Take the most relevant sentence based on context
        const mainSentence = sentences[0].trim();
        summary = mainSentence.charAt(0).toUpperCase() + mainSentence.slice(1);
        
        // Add context if available
        if (contextText.length > text.length) {
            const contextPattern = new RegExp(`.{0,100}${text.substring(0, 50)}|${text.substring(-50)}.{0,100}`, 'gi');
            const contextMatch = contextText.match(contextPattern);
            if (contextMatch) {
                summary += `. This is discussed in the context of ${contextMatch[0].trim()}...`;
            }
        }
    } else {
        summary = text.charAt(0).toUpperCase() + text.slice(1);
    }
    
    return summary.length > 200 ? summary.substring(0, 197) + '...' : summary;
}

function appendToChat(html) {
    const chatLog = document.getElementById('chat-log');
    chatLog.insertAdjacentHTML('beforeend', html);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function appendErrorMessage(message) {
    appendMessageHTML('bot', `
        <div class="message-content">
            <div class="error-message">
                ❌ Error: ${message}
            </div>
            <p>Please try again or use a different video URL.</p>
        </div>
    `);
}

function appendMessage(sender, text) {
    const chatLog = document.getElementById('chat-log');
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', sender);
    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = sender === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = sender === 'user' ? 'User' : 'Bot';
    
    const contentEl = document.createElement('div');
    contentEl.classList.add('message-content');
    contentEl.textContent = text;
    
    messageEl.appendChild(avatar);
    messageEl.appendChild(contentEl);
    chatLog.appendChild(messageEl);
    chatLog.scrollTop = chatLog.scrollHeight;
}

function appendMessageHTML(sender, html) {
    const chatLog = document.getElementById('chat-log');
    const messageEl = document.createElement('div');
    messageEl.classList.add('message', sender);
    
    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    avatar.src = sender === 'user' ? 'user-avatar.png' : 'bot-avatar.png';
    avatar.alt = sender === 'user' ? 'User' : 'Bot';
    
    messageEl.appendChild(avatar);
    messageEl.innerHTML += html;
    chatLog.appendChild(messageEl);
    chatLog.scrollTop = chatLog.scrollHeight;
}

// Check server status on page load and periodically
document.addEventListener('DOMContentLoaded', checkServerStatus);
setInterval(checkServerStatus, 30000);