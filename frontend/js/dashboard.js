document.addEventListener('DOMContentLoaded', async () => {
    const user = checkAuth();
    if(document.getElementById('user-name')) {
        document.getElementById('user-name').textContent = `${user.name}`;
    }

    const donorSection = document.getElementById('donor-section');
    const receiverSection = document.getElementById('receiver-section');
    const adminSection = document.getElementById('admin-section');
    const addFoodBtn = document.getElementById('add-food-btn');

    if (user.role === 'admin') {
        adminSection.classList.remove('hidden');
        await loadAdminDashboard();
    } else if (user.role === 'donor') {
        donorSection.classList.remove('hidden');
        addFoodBtn.classList.remove('hidden');
        await loadDonorDashboard();
    } else {
        receiverSection.classList.remove('hidden');
        await loadReceiverDashboard();
    }

    // Modal Logic
    const modal = document.getElementById('add-food-modal');
    const closeBtn = document.querySelector('.close-btn');

    if (addFoodBtn) {
        addFoodBtn.onclick = () => {
            document.getElementById('add-food-form').reset();
            document.getElementById('edit-food-id').value = '';
            document.getElementById('modal-title').innerText = 'Post Food Detail';
            document.getElementById('modal-submit-btn').innerText = 'Post Food to Community';
            modal.classList.remove('hidden');
        }
    }
    
    if(closeBtn) {
        closeBtn.onclick = () => modal.classList.add('hidden');
    }
    
    window.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    }

    const addFoodForm = document.getElementById('add-food-form');
    if(addFoodForm) {
        addFoodForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const imageUrlElement = document.getElementById('food-image-url');
            const editId = document.getElementById('edit-food-id').value;
            
            const payload = {
                name: document.getElementById('food-name').value,
                quantity: document.getElementById('food-quantity').value,
                location: document.getElementById('food-location').value,
                expiry_time: document.getElementById('food-expiry').value.replace('T', ' ') + ':00',
                image_url: imageUrlElement ? imageUrlElement.value : ''
            };

            try {
                if (editId) {
                    await apiCall(`/food/${editId}`, 'PUT', payload);
                    showToast('Food post updated successfully!', 'success');
                } else {
                    await apiCall('/food', 'POST', payload);
                    showToast('Food successfully posted to the community!', 'success');
                }
                modal.classList.add('hidden');
                addFoodForm.reset();
                if(user.role === 'admin') await loadAdminDashboard();
                else await loadDonorDashboard();
            } catch (error) {
                showToast(error.message, 'error');
            }
        });
    }
});

// Toast System
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="fa-solid fa-circle-check success"></i>' : '<i class="fa-solid fa-circle-exclamation error"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1593113544332-628d6f5ba8b6?auto=format&fit=crop&w=500&q=80';

const getEmptyStateHTML = (message, icon = 'fa-folder-open') => `
    <div class="empty-state">
        <i class="fa-solid ${icon}"></i>
        <h3>Oops! Nothing here yet.</h3>
        <p>${message}</p>
    </div>
`;

window.switchAdminTab = (tabId, element) => {
    document.querySelectorAll('.admin-tab').forEach(el => el.classList.add('hidden'));
    document.getElementById('admin-tab-' + tabId).classList.remove('hidden');
    document.querySelectorAll('.sidebar-nav li').forEach(item => item.classList.remove('active'));
    element.classList.add('active');
};

const renderPostCard = (post, isReceiver = false, isAdmin = false, isDonor = false) => {
    const imageUrl = post.image_url || DEFAULT_IMAGE;
    let buttons = '';
    
    if (isReceiver && post.status === 'available') {
        buttons = `<button class="btn btn-primary btn-full" style="margin-top:1rem;" onclick="requestFood(${post.id})"><i class="fa-solid fa-hand-holding-heart"></i> Request Food</button>`;
    }
    
    if (isDonor || isAdmin) {
        buttons = `
        <div class="action-btns" style="margin-top:1rem; gap:0.5rem; display:flex;">
            <button class="btn btn-secondary btn-full" style="font-size:0.9rem;" onclick="window.editFood(${post.id}, '${post.name.replace(/'/g, "\\'")}', '${post.quantity}', '${post.location}', '${post.expiry_time.split('.')[0]}', '${post.image_url || ''}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn btn-danger btn-full" style="font-size:0.9rem;" onclick="window.deleteFood(${post.id}, ${isAdmin})"><i class="fa-solid fa-trash"></i> Delete</button>
        </div>`;
    }

    let donorInfo = '';
    if (isReceiver || isAdmin) {
        donorInfo = `<div class="card-info"><i class="fa-solid fa-user"></i> <span>Donor: ${post.donor_name}</span></div>`;
    }

    return `
        <div class="card">
            <img src="${imageUrl}" alt="Food" class="card-img" onerror="this.src='${DEFAULT_IMAGE}'">
            <div class="card-body">
                <h3 class="card-title">${post.name}</h3>
                ${donorInfo}
                <div class="card-info"><i class="fa-solid fa-scale-balanced"></i> <span>Qty: ${post.quantity}</span></div>
                <div class="card-info"><i class="fa-solid fa-map-location-dot"></i> <span>Loc: ${post.location}</span></div>
                <div class="card-info"><i class="fa-solid fa-clock"></i> <span>Exp: ${new Date(post.expiry_time).toLocaleString()}</span></div>
                
                <div class="card-footer" style="${isDonor||isAdmin ? 'padding-bottom:0;' : ''}">
                    <span class="status-badge status-${post.status}">${post.status.toUpperCase()}</span>
                </div>
                ${buttons}
            </div>
        </div>
    `;
};

const renderRequestCard = (req, type) => {
    let actions = '';
    if (type === 'donor' || type === 'admin') {
        if(req.status === 'pending') {
            actions = `
                <div class="action-btns">
                    <button class="btn btn-success btn-small" onclick="updateRequestStatus(${req.id}, 'approved', ${type === 'admin'})"><i class="fa-solid fa-check"></i> Approve</button>
                    <button class="btn btn-danger btn-small" onclick="updateRequestStatus(${req.id}, 'rejected', ${type === 'admin'})"><i class="fa-solid fa-xmark"></i> Reject</button>
                </div>
            `;
        }
    }

    return `
        <div class="card">
            <div class="card-body">
                <h3 class="card-title">Req: ${req.food_name || 'Food Drop'}</h3>
                ${type !== 'receiver' ? `<div class="card-info"><i class="fa-solid fa-user"></i> <span>From: ${req.receiver_name}</span></div>` : ''}
                <div class="card-info"><i class="fa-solid fa-map-location-dot"></i> <span>Location: ${req.location || 'N/A'}</span></div>
                
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <div><strong>Food Status:</strong> <span class="status-badge status-${req.food_status || 'unknown'}">${(req.food_status || 'unknown').toUpperCase()}</span></div>
                    <div><strong>Req Status:</strong> <span class="status-badge status-${req.status}">${req.status.toUpperCase()}</span></div>
                </div>
                ${actions}
            </div>
        </div>
    `;
};

async function loadDonorDashboard() {
    try {
        const posts = await apiCall('/food/my-posts');
        const postsGrid = document.getElementById('my-posts-grid');
        postsGrid.innerHTML = posts.length ? posts.map(p => renderPostCard(p, false, false, true)).join('') : getEmptyStateHTML('You haven\'t posted any food yet.', 'fa-box-open');

        const rawImpact = posts.filter(p => p.status === 'claimed').reduce((acc, p) => acc + (parseInt(p.quantity) || 1), 0);
        document.getElementById('impact-count').innerText = rawImpact;

        const requestsGrid = document.getElementById('my-food-requests-grid');
        let hasRequests = false;
        let htmlBuffer = '';
        for (const post of posts) {
            if (post.status === 'available' || post.status === 'claimed') {
                const reqs = await apiCall(`/requests/food/${post.id}`);
                if (reqs.length > 0) hasRequests = true;
                reqs.forEach(req => htmlBuffer += renderRequestCard(req, 'donor'));
            }
        }
        requestsGrid.innerHTML = hasRequests ? htmlBuffer : getEmptyStateHTML('No pending requests for your food.', 'fa-handshake-angle');

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadReceiverDashboard() {
    try {
        const availableFood = await apiCall('/food');
        const foodGrid = document.getElementById('available-food-grid');
        foodGrid.innerHTML = availableFood.length ? availableFood.map(f => renderPostCard(f, true, false, false)).join('') : getEmptyStateHTML('No food available near you.', 'fa-basket-shopping');

        const requests = await apiCall('/requests/my-requests');
        const reqGrid = document.getElementById('my-requests-grid');
        reqGrid.innerHTML = requests.length ? requests.map(r => renderRequestCard(r, 'receiver')).join('') : getEmptyStateHTML('You haven\'t made any requests yet.', 'fa-clock-rotate-left');

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function loadAdminDashboard() {
    try {
        const [posts, requests, users] = await Promise.all([
            apiCall('/food/all'),
            apiCall('/requests/all'),
            apiCall('/auth/users')
        ]);

        const postsGrid = document.getElementById('admin-all-posts-grid');
        postsGrid.innerHTML = posts.length ? posts.map(p => renderPostCard(p, false, true, false)).join('') : getEmptyStateHTML('No food has been posted yet.', 'fa-earth-americas');

        const reqGrid = document.getElementById('admin-all-requests-grid');
        reqGrid.innerHTML = requests.length ? requests.map(r => renderRequestCard(r, 'admin')).join('') : getEmptyStateHTML('No requests have been made system-wide.', 'fa-folder-open');

        const usersTbody = document.querySelector('#admin-users-table tbody');
        usersTbody.innerHTML = users.map(u => `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="status-badge" style="background:#eafaf1; color:#27ae60;">${u.role.toUpperCase()}</span></td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteUser(${u.id})"><i class="fa-solid fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');

        // Compute Stats
        const activeReqs = requests.filter(r => r.status === 'pending').length;
        document.getElementById('admin-stats-container').innerHTML = `
            <div class="stat-card">
                <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                <div class="stat-info">
                    <h4>Total Platform Users</h4>
                    <h2 id="stat-total-users">${users.length}</h2>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:#e3f2fd; color:#1e88e5;"><i class="fa-solid fa-box-open"></i></div>
                <div class="stat-info">
                    <h4>Global Donations</h4>
                    <h2 id="stat-total-posts">${posts.length}</h2>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background:#fce4ec; color:#e53935;"><i class="fa-solid fa-bell"></i></div>
                <div class="stat-info">
                    <h4>Active Pending Requests</h4>
                    <h2 id="stat-active-requests">${activeReqs}</h2>
                </div>
            </div>
        `;

    } catch (error) {
        showToast(error.message, 'error');
    }
}

window.requestFood = async (food_id) => {
    if (confirm('Are you sure you want to request this specific food batch?')) {
        try {
            await apiCall('/requests', 'POST', { food_id });
            showToast('Request sent successfully! Once approved, it will be marked as Claimed.');
            await loadReceiverDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

window.updateRequestStatus = async (request_id, status, isAdmin = false) => {
    if (confirm(`Are you certain you wish to ${status} this request?`)) {
        try {
            await apiCall(`/requests/${request_id}/status`, 'PUT', { status });
            showToast(`Request dynamically ${status}!`, 'success');
            if (isAdmin) await loadAdminDashboard();
            else await loadDonorDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

window.deleteFood = async (id, isAdmin = false) => {
    if (confirm('Are you sure you want to irrevocably delete this post from the global database?')) {
        try {
            await apiCall(`/food/${id}`, 'DELETE');
            showToast('Post eradicated successfully!', 'success');
            if (isAdmin) await loadAdminDashboard();
            else await loadDonorDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

window.deleteUser = async (id) => {
    if (confirm('DANGER! Overwrite verification: Delete this user and all associated data permanently?')) {
        try {
            await apiCall(`/auth/users/${id}`, 'DELETE');
            showToast('User wiped successfully!', 'success');
            await loadAdminDashboard();
        } catch (error) {
            showToast(error.message, 'error');
        }
    }
};

window.editFood = (id, name, quantity, location, expiry, imageUrl) => {
    document.getElementById('edit-food-id').value = id;
    document.getElementById('food-name').value = name;
    document.getElementById('food-quantity').value = quantity;
    document.getElementById('food-location').value = location;
    
    let dt = new Date(expiry);
    let dtString = dt.toISOString().slice(0,16); 
    document.getElementById('food-expiry').value = dtString;
    document.getElementById('food-image-url').value = imageUrl;
    
    document.getElementById('modal-title').innerText = 'Modify Database Details';
    document.getElementById('modal-submit-btn').innerText = 'Push System Update';
    
    document.getElementById('add-food-modal').classList.remove('hidden');
};
