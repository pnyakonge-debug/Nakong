// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Don't scroll for modal triggers
        if (this.getAttribute('href') === '#') {
            return;
        }
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Modal Functions
function openUserLoginModal() {
    document.getElementById('userLoginModal').classList.add('show');
}

function closeUserLoginModal() {
    document.getElementById('userLoginModal').classList.remove('show');
}

function openAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.add('show');
}

function closeAdminLoginModal() {
    document.getElementById('adminLoginModal').classList.remove('show');
}

// Close modal when clicking outside
window.onclick = function(event) {
    const userModal = document.getElementById('userLoginModal');
    const adminModal = document.getElementById('adminLoginModal');
    
    if (event.target === userModal) {
        userModal.classList.remove('show');
    }
    if (event.target === adminModal) {
        adminModal.classList.remove('show');
    }
}

// Add active class to navigation links based on scroll position
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Add scroll animation for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Handle Login Form Submission
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Store login info (in production, this would send to a server)
        localStorage.setItem('userEmail', email);
        localStorage.setItem('isLoggedIn', 'true');
        
        // Show user panel
        showUserPanel(email);
    });
}

// Show user panel after login
function showUserPanel(email) {
    document.getElementById('userLoginForm').style.display = 'none';
    document.getElementById('userPanel').style.display = 'block';
    document.getElementById('userEmailDisplay').textContent = email;
}

// Tab switching for user panel
function showUserTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    if (tabName === 'submit') {
        document.getElementById('submitTab').style.display = 'block';
        buttons[0].classList.add('active');
    } else if (tabName === 'view') {
        document.getElementById('viewTab').style.display = 'block';
        buttons[1].classList.add('active');
        loadUserRequests();
    }
}

// Load user's own requests
function loadUserRequests() {
    const userEmail = document.getElementById('userEmailDisplay').textContent;
    const allRequests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
    const userRequests = allRequests.filter(req => req.userEmail === userEmail);
    
    const container = document.getElementById('userRequestsContainer');
    
    if (userRequests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No requests submitted yet.</p>';
        return;
    }
    
    // Sort by most recent first
    userRequests.sort((a, b) => b.id - a.id);
    
    container.innerHTML = userRequests.map(request => `
        <div class="request-item">
            <div class="request-header">
                <span class="request-equipment">${request.equipment}</span>
                <div>
                    <span class="request-badge ${request.type}">${request.type === 'corrective' ? 'Corrective' : 'Preventive'}</span>
                    <span class="request-badge ${request.urgency}">${request.urgency.toUpperCase()}</span>
                </div>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <span class="request-detail-label">Maintenance Type</span>
                    <span class="request-detail-value">${request.type === 'corrective' ? 'Corrective (Repair)' : 'Preventive (Scheduled)'}</span>
                </div>
                <div class="request-detail">
                    <span class="request-detail-label">Urgency</span>
                    <span class="request-detail-value">${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</span>
                </div>
            </div>
            <div class="request-description">
                <div class="request-description-label">Description</div>
                <div class="request-description-text">${request.description}</div>
            </div>
            <div class="request-timestamp">Submitted: ${request.submittedAt}</div>
        </div>
    `).join('');
}

// Logout user
function logoutUser() {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isLoggedIn');
    document.getElementById('userLoginForm').style.display = 'block';
    document.getElementById('userPanel').style.display = 'none';
    document.getElementById('loginForm').reset();
    closeUserLoginModal();
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        const userEmail = localStorage.getItem('userEmail');
        openUserLoginModal();
        showUserPanel(userEmail);
    }
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        openAdminLoginModal();
        showAdminPanel();
    }
});

// Handle User Maintenance Request Form Submission
const userMaintenanceForm = document.getElementById('userMaintenanceForm');
if (userMaintenanceForm) {
    userMaintenanceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const equipment = document.getElementById('userEquipment').value;
        const maintenanceType = document.getElementById('userMaintenanceType').value;
        const description = document.getElementById('userDescription').value;
        const urgency = document.getElementById('userUrgency').value;
        
        // Create a request object
        const request = {
            id: Date.now(),
            userEmail: document.getElementById('userEmailDisplay').textContent,
            equipment: equipment,
            type: maintenanceType,
            description: description,
            urgency: urgency,
            submittedAt: new Date().toLocaleString()
        };
        
        // Store request in localStorage
        let requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
        requests.push(request);
        localStorage.setItem('maintenanceRequests', JSON.stringify(requests));
        
        // Create a message
        const typeLabel = maintenanceType === 'corrective' ? 'Corrective Maintenance' : 'Preventive Maintenance';
        const urgencyLabel = urgency.charAt(0).toUpperCase() + urgency.slice(1);
        
        const message = `Equipment: ${equipment}\nType: ${typeLabel}\nUrgency: ${urgencyLabel}\n\nDescription:\n${description}`;
        
        alert('Maintenance request submitted successfully!\n\n' + message + '\n\nWe will contact you shortly.');
        userMaintenanceForm.reset();
        // Refresh user requests list
        loadUserRequests();
    });
}

// Admin Functions
const adminLoginForm = document.getElementById('adminLoginFormElement');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;
        
        // Simple authentication (in production, this would be server-side)
        const validUsername = 'admin';
        const validPassword = 'admin123';
        
        if (username === validUsername && password === validPassword) {
            localStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
        } else {
            alert('Invalid username or password!');
        }
    });
}

function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    document.getElementById('adminLoginForm').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    closeAdminLoginModal();
}

function showAdminPanel() {
    document.getElementById('adminLoginForm').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadMaintenanceRequests();
}

function loadMaintenanceRequests() {
    const requests = JSON.parse(localStorage.getItem('maintenanceRequests') || '[]');
    const container = document.getElementById('requestsContainer');
    
    if (requests.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999;">No maintenance requests yet.</p>';
        return;
    }
    
    // Sort by most recent first
    requests.sort((a, b) => b.id - a.id);
    
    container.innerHTML = requests.map(request => `
        <div class="request-item">
            <div class="request-header">
                <span class="request-equipment">${request.equipment}</span>
                <div>
                    <span class="request-badge ${request.type}">${request.type === 'corrective' ? 'Corrective' : 'Preventive'}</span>
                    <span class="request-badge ${request.urgency}">${request.urgency.toUpperCase()}</span>
                </div>
            </div>
            <div class="request-details">
                <div class="request-detail">
                    <span class="request-detail-label">User Email</span>
                    <span class="request-detail-value">${request.userEmail || 'Not provided'}</span>
                </div>
                <div class="request-detail">
                    <span class="request-detail-label">Maintenance Type</span>
                    <span class="request-detail-value">${request.type === 'corrective' ? 'Corrective (Repair)' : 'Preventive (Scheduled)'}</span>
                </div>
                <div class="request-detail">
                    <span class="request-detail-label">Urgency</span>
                    <span class="request-detail-value">${request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</span>
                </div>
            </div>
            <div class="request-description">
                <div class="request-description-label">Description</div>
                <div class="request-description-text">${request.description}</div>
            </div>
            <div class="request-timestamp">Submitted: ${request.submittedAt}</div>
        </div>
    `).join('');
}