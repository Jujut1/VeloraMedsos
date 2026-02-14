// ==================== DATA INIT ====================
let users = JSON.parse(localStorage.getItem('velora_users')) || [];
let posts = JSON.parse(localStorage.getItem('velora_posts')) || [];
let chats = JSON.parse(localStorage.getItem('velora_chats')) || {};
let currentUser = null;
let currentSection = 'home';
let selectedChatUser = null;

// Demo data
if (users.length === 0) {
    users.push({
        id: 1,
        username: 'demo',
        name: 'Demo User',
        email: 'demo@velora.com',
        password: '123456',
        bio: 'Hanya manusia biasa yang suka coding',
        avatar: null,
        since: '17 Maret 2025'
    });
    localStorage.setItem('velora_users', JSON.stringify(users));
}

if (posts.length === 0) {
    posts.push({
        id: Date.now() - 100000,
        userId: 1,
        userName: 'Demo User',
        username: 'demo',
        userAvatar: null,
        image: null,
        caption: 'Halo ini postingan pertama di VELORA! ✨',
        time: '2 jam lalu',
        likes: [1], // array user id yg like
        comments: [
            { userId: 1, username: 'demo', text: 'Mantap jiwa!', time: '1 jam lalu' }
        ]
    });
    localStorage.setItem('velora_posts', JSON.stringify(posts));
}

// ==================== UI HELPERS ====================
function setTitle(page) {
    if (page === 'login') document.title = 'VELORA • Masuk';
    else if (page === 'register') document.title = 'VELORA • Daftar';
    else if (page === 'dashboard') document.title = 'VELORA • Dashboard';
}

function showRegister() {
    document.getElementById('registerPage').style.display = 'flex';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';
    setTitle('register');
}

function showLogin() {
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    setTitle('login');
}

function showDashboard() {
    document.getElementById('registerPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'block';
    setTitle('dashboard');
    updateNavAvatar();
    showSection('home');
}

// ==================== AUTH ====================
function register() {
    const username = document.getElementById('regUsername').value.trim();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();

    if (!username || !name || !email || !password) {
        alert('⚠️ Semua field wajib diisi!');
        return;
    }

    if (users.find(u => u.email === email)) {
        alert('❌ Email sudah terdaftar.');
        return;
    }
    if (users.find(u => u.username === username)) {
        alert('❌ Username sudah dipakai.');
        return;
    }

    const newUser = {
        id: Date.now(),
        username,
        name,
        email,
        password,
        bio: 'Halo, saya baru di VELORA! 👋',
        avatar: null,
        since: new Date().toLocaleDateString('id-ID')
    };

    users.push(newUser);
    localStorage.setItem('velora_users', JSON.stringify(users));
    alert('✅ Registrasi berhasil! Silakan login.');
    showLogin();
}

function login() {
    const identity = document.getElementById('loginIdentity').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const user = users.find(u => (u.email === identity || u.username === identity) && u.password === password);

    if (!user) {
        alert('❌ Email/Username atau password salah!');
        return;
    }

    currentUser = user;
    showDashboard();
}

function logout() {
    currentUser = null;
    showLogin();
}

function updateNavAvatar() {
    if (!currentUser) return;
    const initial = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('navAvatar').innerText = initial;
}

// ==================== SEARCH USER ====================
function searchUser(query) {
    const resultsDiv = document.getElementById('searchResults');
    if (!query.trim() || !currentUser) {
        resultsDiv.style.display = 'none';
        return;
    }

    const filtered = users.filter(u => 
        u.id !== currentUser.id && 
        u.username.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0) {
        resultsDiv.style.display = 'none';
        return;
    }

    let html = '';
    filtered.forEach(u => {
        const initial = u.name.charAt(0).toUpperCase();
        html += `
            <div class="search-item" onclick="startChatWith(${u.id})">
                <div class="avatar">${initial}</div>
                <div class="info">
                    <h4>${u.name}</h4>
                    <p>@${u.username}</p>
                </div>
            </div>
        `;
    });

    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

function startChatWith(userId) {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchUserInput').value = '';
    
    selectedChatUser = user;
    showSection('chat');
}

// ==================== SECTION RENDER ====================
function showSection(section) {
    currentSection = section;
    
    // Update active menu
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
        if (item.id === `menu-${section}`) item.classList.add('active');
    });

    if (section === 'home') renderHome();
    else if (section === 'profile') renderProfile();
    else if (section === 'editProfile') renderEditProfile();
    else if (section === 'news') renderNews();
    else if (section === 'upload') renderUpload();
    else if (section === 'chat') renderChat();
    else if (section === 'notifications') renderNotifications();
}

// ==================== HOME (FEED) ====================
function renderHome() {
    let html = '<h2 class="section-title">🏠 Beranda</h2>';
    
    posts.sort((a,b) => b.id - a.id).forEach(post => {
        const user = users.find(u => u.id === post.userId) || { name: 'Unknown', username: 'unknown' };
        const initial = user.name.charAt(0).toUpperCase();
        const isLiked = currentUser && post.likes && post.likes.includes(currentUser.id);
        
        html += `
            <div class="post-card" id="post-${post.id}">
                <div class="post-header">
                    <div class="post-avatar">${initial}</div>
                    <div class="post-user">
                        <h4>${user.name} <span style="color:#64748b; font-size:0.9rem;">@${user.username}</span></h4>
                        <span>${post.time || 'baru saja'}</span>
                    </div>
                </div>
                <p style="margin-bottom:12px;">${post.caption}</p>
                ${post.image ? `<div class="post-image" style="background:#ddd; display:flex; align-items:center; justify-content:center;">🖼️ [Foto]</div>` : ''}
                <div class="post-actions">
                    <span onclick="likePost(${post.id})" style="cursor:pointer; ${isLiked ? 'color:#e11d48;' : ''}">❤️ ${post.likes ? post.likes.length : 0}</span>
                    <span onclick="showComments(${post.id})" style="cursor:pointer;">💬 ${post.comments ? post.comments.length : 0}</span>
                </div>
                
                <!-- Komentar section (hidden by default) -->
                <div id="comments-${post.id}" style="display: none;" class="comment-section">
                    ${renderComments(post)}
                    <div class="add-comment">
                        <input type="text" id="comment-input-${post.id}" placeholder="Tulis komentar...">
                        <button onclick="addComment(${post.id})">Kirim</button>
                    </div>
                </div>
            </div>
        `;
    });

    document.getElementById('contentArea').innerHTML = html;
}

function renderComments(post) {
    if (!post.comments || post.comments.length === 0) {
        return '<p style="color:#94a3b8;">Belum ada komentar.</p>';
    }
    let html = '';
    post.comments.forEach(cmt => {
        const user = users.find(u => u.id === cmt.userId) || { name: 'Unknown', username: 'unknown' };
        const initial = user.name.charAt(0).toUpperCase();
        html += `
            <div class="comment">
                <div class="comment-avatar" style="background: linear-gradient(135deg,#8b5cf6,#3b82f6);">${initial}</div>
                <div class="comment-content">
                    <strong>${user.name} <span style="color:#64748b;">@${user.username}</span></strong>
                    <p>${cmt.text}</p>
                </div>
            </div>
        `;
    });
    return html;
}

function showComments(postId) {
    const el = document.getElementById(`comments-${postId}`);
    if (el.style.display === 'none') el.style.display = 'block';
    else el.style.display = 'none';
}

function likePost(postId) {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.likes) post.likes = [];
    
    const index = post.likes.indexOf(currentUser.id);
    if (index === -1) {
        post.likes.push(currentUser.id);
    } else {
        post.likes.splice(index, 1);
    }

    localStorage.setItem('velora_posts', JSON.stringify(posts));
    renderHome(); // refresh
}

function addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const text = input.value.trim();
    if (!text || !currentUser) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (!post.comments) post.comments = [];
    post.comments.push({
        userId: currentUser.id,
        username: currentUser.username,
        text: text,
        time: new Date().toLocaleString()
    });

    localStorage.setItem('velora_posts', JSON.stringify(posts));
    input.value = '';
    renderHome();
}

// ==================== PROFILE ====================
function renderProfile() {
    if (!currentUser) return;
    const initial = currentUser.name.charAt(0).toUpperCase();
    const userPosts = posts.filter(p => p.userId === currentUser.id);
    
    let html = `
        <h2 class="section-title">👤 Profilku</h2>
        <div class="profile-header">
            <div class="profile-avatar-large">${initial}</div>
            <div class="profile-info">
                <h2>${currentUser.name}</h2>
                <p>@${currentUser.username}</p>
                <p>📧 ${currentUser.email}</p>
                <p>📝 ${currentUser.bio || 'Belum ada bio.'}</p>
                <p>📅 Member sejak: ${currentUser.since}</p>
                <p>📸 Postingan: ${userPosts.length}</p>
            </div>
        </div>
        <h3 style="margin: 40px 0 20px;">📸 Postinganku</h3>
    `;

    if (userPosts.length === 0) {
        html += '<p style="color:#94a3b8;">Belum ada postingan.</p>';
    } else {
        userPosts.forEach(post => {
            html += `
                <div class="post-card">
                    <p>${post.caption}</p>
                    <div class="post-actions">
                        <span>❤️ ${post.likes ? post.likes.length : 0}</span>
                        <span>💬 ${post.comments ? post.comments.length : 0}</span>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('contentArea').innerHTML = html;
}

// ==================== EDIT PROFILE ====================
function renderEditProfile() {
    if (!currentUser) return;
    let html = `
        <h2 class="section-title">✏️ Edit Profil</h2>
        <div class="edit-form">
            <input type="text" id="editUsername" placeholder="Username" value="${currentUser.username}">
            <input type="text" id="editName" placeholder="Nama lengkap" value="${currentUser.name}">
            <input type="email" id="editEmail" placeholder="Email" value="${currentUser.email}">
            <textarea id="editBio" placeholder="Bio" rows="4">${currentUser.bio || ''}</textarea>
            <button class="btn" onclick="saveProfile()">Simpan Perubahan</button>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

function saveProfile() {
    const newUsername = document.getElementById('editUsername').value.trim();
    const newName = document.getElementById('editName').value.trim();
    const newEmail = document.getElementById('editEmail').value.trim();
    const newBio = document.getElementById('editBio').value.trim();

    if (!newUsername || !newName || !newEmail) {
        alert('Username, nama, dan email wajib diisi.');
        return;
    }

    // Cek username unik (kecuali dirinya sendiri)
    if (users.find(u => u.username === newUsername && u.id !== currentUser.id)) {
        alert('❌ Username sudah dipakai orang lain.');
        return;
    }

    // Update
    currentUser.username = newUsername;
    currentUser.name = newName;
    currentUser.email = newEmail;
    currentUser.bio = newBio;

    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) users[index] = currentUser;
    localStorage.setItem('velora_users', JSON.stringify(users));

    alert('✅ Profil diperbarui!');
    updateNavAvatar();
    showSection('profile');
}

// ==================== NEWS ====================
function renderNews() {
    let html = `
        <h2 class="section-title">📰 Berita Terkini</h2>
        <div class="news-grid">
            <div class="news-card">
                <h3>✨ VELORA Versi 2</h3>
                <p>Fitur chat, like, komentar, dan cari user sudah hadir!</p>
                <small>Baru saja</small>
            </div>
            <div class="news-card">
                <h3>📸 Upload Foto</h3>
                <p>Sekarang bisa upload foto (simulasi).</p>
                <small>1 jam lalu</small>
            </div>
            <div class="news-card">
                <h3>🎨 Tampilan Baru</h3>
                <p>Dashboard lebih lega dan responsif.</p>
                <small>3 jam lalu</small>
            </div>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

// ==================== UPLOAD ====================
let lastUploadedImage = null;
function renderUpload() {
    let html = `
        <h2 class="section-title">📤 Upload Foto</h2>
        <div class="upload-area" onclick="simulateUpload()">
            <p style="font-size: 3rem; margin-bottom: 16px;">📸</p>
            <p style="font-size: 1.3rem; font-weight: 600;">Klik untuk upload foto</p>
            <p style="color: #64748b;">Atau drag & drop file</p>
        </div>
        <div style="margin-top: 32px;">
            <input type="text" id="captionInput" placeholder="Tulis caption..." style="width:100%; padding:16px; border-radius:30px; border:2px solid #e2e8f0; margin-bottom:16px;">
            <button class="btn" onclick="publishPost()">Publikasikan</button>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

function simulateUpload() {
    alert('🖼️ Demo: Foto berhasil dipilih! (simulasi)');
    lastUploadedImage = 'demo.jpg';
}

function publishPost() {
    const caption = document.getElementById('captionInput')?.value.trim();
    if (!caption && !lastUploadedImage) {
        alert('Tulis caption atau pilih foto dulu.');
        return;
    }

    const newPost = {
        id: Date.now(),
        userId: currentUser.id,
        userName: currentUser.name,
        username: currentUser.username,
        userAvatar: null,
        image: lastUploadedImage || null,
        caption: caption || 'No caption',
        time: 'baru saja',
        likes: [],
        comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('velora_posts', JSON.stringify(posts));
    alert('✅ Postingan berhasil diupload!');
    lastUploadedImage = null;
    showSection('home');
}

// ==================== CHAT ====================
function renderChat() {
    if (!currentUser) return;
    
    // Ambil semua user kecuali diri sendiri
    const otherUsers = users.filter(u => u.id !== currentUser.id);
    
    let html = '<h2 class="section-title">💬 Chat</h2>';
    
    if (selectedChatUser) {
        // Tampilkan chat window dengan user terpilih
        html += renderChatWindow(selectedChatUser);
    } else {
        // Tampilkan daftar user
        html += '<div class="chat-list">';
        otherUsers.forEach(u => {
            const initial = u.name.charAt(0).toUpperCase();
            html += `
                <div class="chat-item" onclick="selectChatUser(${u.id})">
                    <div class="chat-avatar">${initial}</div>
                    <div class="chat-info">
                        <h4>${u.name}</h4>
                        <p>@${u.username}</p>
                    </div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    document.getElementById('contentArea').innerHTML = html;
}

function selectChatUser(userId) {
    const user = users.find(u => u.id === userId);
    if (user) {
        selectedChatUser = user;
        renderChat();
    }
}

function renderChatWindow(user) {
    const chatId = [currentUser.id, user.id].sort().join('-');
    const messages = chats[chatId] || [];
    const initial = user.name.charAt(0).toUpperCase();
    
    let messagesHtml = '';
    messages.forEach(msg => {
        const isMe = msg.senderId === currentUser.id;
        messagesHtml += `
            <div class="message ${isMe ? 'sent' : 'received'}">
                <div class="message-bubble">${msg.text}</div>
                <div class="message-time">${msg.time}</div>
            </div>
        `;
    });
    
    return `
        <div style="margin-bottom: 20px;">
            <button onclick="selectedChatUser=null; renderChat();" style="background:none; border:none; color:#8b5cf6; font-weight:bold; cursor:pointer; margin-bottom:16px;">← Kembali</button>
        </div>
        <div class="chat-window">
            <div style="padding:16px; border-bottom:1px solid #ede9fe; display:flex; align-items:center; gap:12px;">
                <div class="chat-avatar" style="width:44px; height:44px;">${initial}</div>
                <h4>${user.name} <span style="color:#64748b;">@${user.username}</span></h4>
            </div>
            <div class="chat-messages" id="chatMessages">
                ${messagesHtml}
            </div>
            <div class="chat-input-area">
                <input type="text" id="chatInput" placeholder="Tulis pesan..." onkeypress="if(event.key==='Enter') sendMessage()">
                <button onclick="sendMessage()">Kirim</button>
            </div>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !selectedChatUser || !currentUser) return;
    
    const chatId = [currentUser.id, selectedChatUser.id].sort().join('-');
    if (!chats[chatId]) chats[chatId] = [];
    
    chats[chatId].push({
        senderId: currentUser.id,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    localStorage.setItem('velora_chats', JSON.stringify(chats));
    input.value = '';
    
    // Refresh chat window
    renderChat();
}

// ==================== NOTIFICATIONS ====================
function renderNotifications() {
    let html = `
        <h2 class="section-title">🔔 Notifikasi</h2>
        <div style="background:#fafaff; border-radius:28px; padding:24px;">
            <p style="color:#64748b;">Belum ada notifikasi baru.</p>
        </div>
    `;
    document.getElementById('contentArea').innerHTML = html;
}

// ==================== DROPDOWN ====================
function toggleDropdown() {
    const menu = document.getElementById('dropdownMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

window.onclick = function(e) {
    if (!e.target.closest('.profile-dropdown')) {
        document.getElementById('dropdownMenu').style.display = 'none';
    }
    // Hide search results if click outside
    if (!e.target.closest('.nav-search')) {
        document.getElementById('searchResults').style.display = 'none';
    }
};

// ==================== INIT ====================
showRegister();