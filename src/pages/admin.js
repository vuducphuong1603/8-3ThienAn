import { supabase, SUPABASE_URL } from '../lib/supabase.js';

const MAX_PHOTOS = 20;
let isLoggedIn = false;
let currentCardId = null;

export function renderAdminPage() {
    if (!isLoggedIn) {
        renderLoginPage();
        return;
    }
    renderCardList();
}

function renderLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="page-container">
      <div class="glass-card login-page">
        <h1>🔐 Admin Login</h1>
        <p class="subtitle">Đăng nhập để quản lý thiệp chúc mừng</p>

        <div class="input-group">
          <label for="username">Tên đăng nhập</label>
          <input type="text" id="username" placeholder="Nhập username" autocomplete="username" />
        </div>

        <div class="input-group">
          <label for="password">Mật khẩu</label>
          <input type="password" id="password" placeholder="Nhập mật khẩu" autocomplete="current-password" />
        </div>

        <div id="login-error" class="error-message"></div>

        <button class="btn-primary" id="btn-login">Đăng Nhập</button>
      </div>
    </div>
  `;

    document.getElementById('btn-login').addEventListener('click', handleLogin);
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
}

async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');
    const btn = document.getElementById('btn-login');

    if (!username || !password) {
        showError(errorEl, 'Vui lòng nhập đầy đủ thông tin!');
        return;
    }

    btn.innerHTML = '<span class="loading-spinner"></span>';
    btn.disabled = true;

    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('username', username)
            .eq('password_hash', hashHex)
            .maybeSingle();

        if (error) throw error;

        if (!adminData) {
            showError(errorEl, 'Tên đăng nhập hoặc mật khẩu không đúng!');
            btn.innerHTML = 'Đăng Nhập';
            btn.disabled = false;
            return;
        }

        isLoggedIn = true;
        showToast('Đăng nhập thành công! 🎉', 'success');
        renderCardList();
    } catch (err) {
        console.error(err);
        showError(errorEl, 'Lỗi đăng nhập, vui lòng thử lại!');
        btn.innerHTML = 'Đăng Nhập';
        btn.disabled = false;
    }
}

// ==================== CARD LIST ====================

async function renderCardList() {
    currentCardId = null;
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-page">
      <div class="admin-header">
        <h1>💐 Quản Lý Thiệp 8/3</h1>
        <div>
          <button class="btn-primary" id="btn-new-card" style="width:auto; padding: 0.5rem 1.5rem;">➕ Tạo Thiệp Mới</button>
          <button class="btn-secondary" id="btn-logout" style="margin-left: 8px">🚪 Đăng Xuất</button>
        </div>
      </div>

      <div class="admin-section">
        <h2>📋 Danh Sách Thiệp</h2>
        <div id="cards-list" class="cards-grid">
          <p style="color: var(--color-text-muted)">Đang tải...</p>
        </div>
      </div>
    </div>
  `;

    document.getElementById('btn-logout').addEventListener('click', () => {
        isLoggedIn = false;
        currentCardId = null;
        renderLoginPage();
    });

    document.getElementById('btn-new-card').addEventListener('click', createNewCard);

    await loadCardList();
}

async function loadCardList() {
    const cardsListEl = document.getElementById('cards-list');

    const { data: cards, error } = await supabase
        .from('greeting_cards')
        .select('*, recipients(id, name, birthday)')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        cardsListEl.innerHTML = '<p style="color: #ff6b6b;">Lỗi tải danh sách thiệp</p>';
        return;
    }

    if (!cards || cards.length === 0) {
        cardsListEl.innerHTML = '<p style="color: var(--color-text-muted)">Chưa có thiệp nào. Bấm "Tạo Thiệp Mới" để bắt đầu!</p>';
        return;
    }

    cardsListEl.innerHTML = cards.map(card => {
        const recipientCount = card.recipients?.length || 0;
        const photoCount = card.photo_urls?.length || 0;
        const recipientNames = (card.recipients || []).map(r => r.name).join(', ') || 'Chưa có';
        return `
      <div class="card-list-item" data-id="${card.id}">
        <h3>${card.welcome_title || 'Thiệp chưa đặt tên'}</h3>
        <p class="card-meta">👥 ${recipientCount} người nhận &nbsp;|&nbsp; 📸 ${photoCount} ảnh</p>
        <p class="card-preview">👤 ${recipientNames}</p>
        ${card.sub_heading ? `<p class="card-preview">${card.sub_heading}</p>` : ''}
        <div class="card-actions">
          <button class="action-btn edit" data-id="${card.id}">✏️ Sửa</button>
          <button class="action-btn delete" data-id="${card.id}">🗑️ Xóa</button>
        </div>
      </div>
    `;
    }).join('');

    // Click card or edit button → open editor
    cardsListEl.querySelectorAll('.card-list-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('.action-btn')) return;
            currentCardId = item.getAttribute('data-id');
            renderCardEditor();
        });
    });

    cardsListEl.querySelectorAll('.action-btn.edit').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCardId = btn.getAttribute('data-id');
            renderCardEditor();
        });
    });

    cardsListEl.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            if (confirm('Xóa thiệp này và tất cả người nhận liên quan?')) {
                await deleteCard(id);
            }
        });
    });
}

async function createNewCard() {
    const { data, error } = await supabase
        .from('greeting_cards')
        .insert({ welcome_title: 'Thiệp mới' })
        .select()
        .single();

    if (error) {
        console.error(error);
        showToast('Lỗi tạo thiệp mới! ❌', 'error');
        return;
    }

    currentCardId = data.id;
    showToast('Đã tạo thiệp mới! ✨', 'success');
    renderCardEditor();
}

async function deleteCard(id) {
    // Delete recipients first
    await supabase.from('recipients').delete().eq('greeting_card_id', id);

    // Delete photos from storage (subfolder)
    const { data: files } = await supabase.storage.from('card-photos').list(id);
    if (files && files.length > 0) {
        await supabase.storage.from('card-photos').remove(files.map(f => `${id}/${f.name}`));
    }

    // Delete card
    const { error } = await supabase.from('greeting_cards').delete().eq('id', id);
    if (error) {
        console.error(error);
        showToast('Lỗi xóa thiệp! ❌', 'error');
        return;
    }

    showToast('Đã xóa thiệp! 🗑️', 'success');
    await loadCardList();
}

// ==================== CARD EDITOR ====================

async function renderCardEditor() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="admin-page">
      <div class="admin-header">
        <div style="display:flex; align-items:center; gap:12px;">
          <button class="btn-secondary" id="btn-back">⬅ Quay lại</button>
          <h1>📝 Chỉnh Sửa Thiệp</h1>
        </div>
        <button class="btn-secondary" id="btn-preview">👁️ Xem Trước</button>
      </div>

      <div class="admin-section">
        <h2>📝 Nội Dung Thiệp</h2>
        <div class="admin-form" id="card-form">
          <div class="input-group">
            <label>Tiêu đề chào mừng</label>
            <input type="text" id="welcome_title" placeholder="VD: Người đẹp đã sẵn sàng mở quà chưa?" />
          </div>
          <div class="input-group">
            <label>Phụ đề</label>
            <input type="text" id="sub_heading" placeholder="VD: Gửi người tôi yêu thương nhất" />
          </div>
          <div class="input-group">
            <label>Đoạn 1</label>
            <textarea id="para1" placeholder="Lời chúc đoạn 1..."></textarea>
          </div>
          <div class="input-group">
            <label>Đoạn 2</label>
            <textarea id="para2" placeholder="Lời chúc đoạn 2..."></textarea>
          </div>
          <div class="input-group">
            <label>Đoạn 3</label>
            <textarea id="para3" placeholder="Lời chúc đoạn 3..."></textarea>
          </div>
          <div class="input-group">
            <label>Đoạn 4</label>
            <textarea id="para4" placeholder="Lời chúc đoạn 4..."></textarea>
          </div>
          <div class="input-group">
            <label>Chữ ký 1</label>
            <input type="text" id="sig1" placeholder="VD: Mãi yêu em," />
          </div>
          <div class="input-group">
            <label>Chữ ký 2</label>
            <input type="text" id="sig2" placeholder="VD: Người yêu của em" />
          </div>
          <div class="input-group">
            <label>Tiêu đề cuối (hiện khi mở quà)</label>
            <input type="text" id="final_sub" placeholder="VD: Chúc em ngày 8/3 thật hạnh phúc" />
          </div>
          <div class="input-group">
            <label>Trích dẫn cuối</label>
            <textarea id="final_quote" placeholder="Trích dẫn hay..."></textarea>
          </div>
          <button class="btn-primary" id="btn-save-card">💾 Lưu Thiệp</button>
        </div>
      </div>

      <div class="admin-section">
        <h2>📸 Ảnh Kỷ Niệm <span id="photo-count" style="font-size:0.85em; font-weight:normal; color: var(--color-text-muted)"></span></h2>
        <div class="upload-area" id="upload-area">
          <div class="upload-icon">📁</div>
          <p>Kéo thả ảnh vào đây hoặc bấm để chọn</p>
          <p style="font-size:0.85em; color: var(--color-text-muted); margin-top:4px;">Tối đa ${MAX_PHOTOS} ảnh mỗi thiệp</p>
          <input type="file" id="file-input" multiple accept="image/*" style="display:none" />
        </div>
        <div id="upload-progress" style="display:none; margin-bottom: 16px;">
          <p style="color: var(--color-text-secondary)">Đang upload... <span class="loading-spinner"></span></p>
        </div>
        <div class="photo-preview-grid" id="photos-grid"></div>
      </div>

      <div class="admin-section">
        <h2>👥 Người Nhận Thiệp Này</h2>
        <div class="add-recipient-form" id="add-recipient-form">
          <input type="text" id="recipient-name" placeholder="Tên người nhận" />
          <input type="date" id="recipient-birthday" />
          <button id="btn-add-recipient">➕ Thêm</button>
        </div>
        <table class="recipients-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Ngày sinh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody id="recipients-list"></tbody>
        </table>
      </div>
    </div>
  `;

    // Load data
    await loadCardData();
    await loadRecipients();
    await loadPhotos();

    // Event listeners
    document.getElementById('btn-back').addEventListener('click', renderCardList);

    document.getElementById('btn-preview').addEventListener('click', () => {
        window.open(window.location.origin, '_blank');
    });

    document.getElementById('btn-save-card').addEventListener('click', saveCard);

    // Upload
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');

    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--color-pink)';
        uploadArea.style.background = 'rgba(255, 105, 180, 0.1)';
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '';
        uploadArea.style.background = '';
        handleFileUpload(e.dataTransfer.files);
    });
    fileInput.addEventListener('change', (e) => handleFileUpload(e.target.files));

    // Add recipient
    document.getElementById('btn-add-recipient').addEventListener('click', addRecipient);
}

async function loadCardData() {
    const { data, error } = await supabase
        .from('greeting_cards')
        .select('*')
        .eq('id', currentCardId)
        .maybeSingle();

    if (error) {
        console.error(error);
        return;
    }

    if (data) {
        const fields = ['welcome_title', 'sub_heading', 'para1', 'para2', 'para3', 'para4', 'sig1', 'sig2', 'final_sub', 'final_quote'];
        fields.forEach(field => {
            const el = document.getElementById(field);
            if (el && data[field]) el.value = data[field];
        });
    }
}

async function saveCard() {
    const btn = document.getElementById('btn-save-card');
    btn.innerHTML = '<span class="loading-spinner"></span> Đang lưu...';
    btn.disabled = true;

    const cardData = {
        welcome_title: document.getElementById('welcome_title').value,
        sub_heading: document.getElementById('sub_heading').value,
        para1: document.getElementById('para1').value,
        para2: document.getElementById('para2').value,
        para3: document.getElementById('para3').value,
        para4: document.getElementById('para4').value,
        sig1: document.getElementById('sig1').value,
        sig2: document.getElementById('sig2').value,
        final_sub: document.getElementById('final_sub').value,
        final_quote: document.getElementById('final_quote').value,
    };

    try {
        const { error } = await supabase
            .from('greeting_cards')
            .update(cardData)
            .eq('id', currentCardId);
        if (error) throw error;
        showToast('Đã lưu thiệp thành công! ✅', 'success');
    } catch (err) {
        console.error(err);
        showToast('Lỗi khi lưu thiệp! ❌', 'error');
    }

    btn.innerHTML = '💾 Lưu Thiệp';
    btn.disabled = false;
}

// ==================== PHOTOS (per card) ====================

async function loadPhotos() {
    const grid = document.getElementById('photos-grid');

    // List photos in the card's subfolder
    const { data: files, error } = await supabase
        .storage
        .from('card-photos')
        .list(currentCardId, { limit: 100, sortBy: { column: 'created_at', order: 'asc' } });

    if (error) {
        console.error(error);
        return;
    }

    const photoCount = files ? files.length : 0;
    const countEl = document.getElementById('photo-count');
    const uploadArea = document.getElementById('upload-area');
    if (countEl) countEl.textContent = `(${photoCount}/${MAX_PHOTOS})`;
    if (uploadArea) uploadArea.style.display = photoCount >= MAX_PHOTOS ? 'none' : '';

    if (!files || files.length === 0) {
        grid.innerHTML = '<p style="color: var(--color-text-muted); grid-column: 1/-1;">Chưa có ảnh nào</p>';
        return;
    }

    grid.innerHTML = files.map(file => {
        const path = `${currentCardId}/${file.name}`;
        const url = `${SUPABASE_URL}/storage/v1/object/public/card-photos/${path}`;
        return `
      <div class="photo-preview-item">
        <img src="${url}" alt="${file.name}" />
        <button class="delete-btn" data-name="${file.name}" title="Xóa ảnh">✕</button>
      </div>
    `;
    }).join('');

    // Delete buttons
    grid.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const fileName = btn.getAttribute('data-name');
            if (confirm(`Xóa ảnh "${fileName}"?`)) {
                await deletePhoto(fileName);
            }
        });
    });

    // Update photo_urls in greeting_cards
    updatePhotoUrls(files.map(f => `${currentCardId}/${f.name}`));
}

async function handleFileUpload(files) {
    if (!files || files.length === 0) return;

    // Check current photo count
    const { data: existingFiles } = await supabase
        .storage
        .from('card-photos')
        .list(currentCardId, { limit: 100 });

    const currentCount = existingFiles ? existingFiles.length : 0;
    const remaining = MAX_PHOTOS - currentCount;

    if (remaining <= 0) {
        showToast(`Thiệp đã đạt tối đa ${MAX_PHOTOS} ảnh! ❌`, 'error');
        return;
    }

    if (files.length > remaining) {
        showToast(`Chỉ có thể thêm ${remaining} ảnh nữa (tối đa ${MAX_PHOTOS})! ⚠️`, 'error');
        return;
    }

    const progress = document.getElementById('upload-progress');
    progress.style.display = 'block';

    for (const file of files) {
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const path = `${currentCardId}/${fileName}`;

        const { error } = await supabase
            .storage
            .from('card-photos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('Upload error:', error);
            showToast(`Lỗi upload ${file.name}! ❌`, 'error');
        }
    }

    progress.style.display = 'none';
    showToast('Upload ảnh thành công! 📸', 'success');
    await loadPhotos();
}

async function deletePhoto(fileName) {
    const path = `${currentCardId}/${fileName}`;

    const { error } = await supabase
        .storage
        .from('card-photos')
        .remove([path]);

    if (error) {
        console.error(error);
        showToast('Lỗi xóa ảnh! ❌', 'error');
        return;
    }

    showToast('Đã xóa ảnh! 🗑️', 'success');
    await loadPhotos();
}

async function updatePhotoUrls(paths) {
    if (!currentCardId) return;

    await supabase
        .from('greeting_cards')
        .update({ photo_urls: paths })
        .eq('id', currentCardId);
}

// ==================== RECIPIENTS (per card) ====================

async function loadRecipients() {
    const tbody = document.getElementById('recipients-list');

    const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('greeting_card_id', currentCardId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="color: var(--color-text-muted); text-align: center; padding: 20px;">Chưa có người nhận nào cho thiệp này</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.name}</td>
      <td>${formatDate(r.birthday)}</td>
      <td>
        <button class="action-btn delete" data-id="${r.id}" title="Xóa">🗑️ Xóa</button>
      </td>
    </tr>
  `).join('');

    tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.getAttribute('data-id');
            if (confirm('Xóa người nhận này?')) {
                await deleteRecipient(id);
            }
        });
    });
}

async function addRecipient() {
    const nameInput = document.getElementById('recipient-name');
    const birthdayInput = document.getElementById('recipient-birthday');

    const name = nameInput.value.trim();
    const birthday = birthdayInput.value;

    if (!name || !birthday) {
        showToast('Vui lòng nhập đủ tên và ngày sinh!', 'error');
        return;
    }

    const { error } = await supabase
        .from('recipients')
        .insert({
            name,
            birthday,
            greeting_card_id: currentCardId
        });

    if (error) {
        console.error(error);
        showToast('Lỗi thêm người nhận! ❌', 'error');
        return;
    }

    nameInput.value = '';
    birthdayInput.value = '';
    showToast(`Đã thêm ${name}! 🎉`, 'success');
    await loadRecipients();
}

async function deleteRecipient(id) {
    const { error } = await supabase
        .from('recipients')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(error);
        showToast('Lỗi xóa người nhận! ❌', 'error');
        return;
    }

    showToast('Đã xóa người nhận! 🗑️', 'success');
    await loadRecipients();
}

// ==================== UTILS ====================

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN');
}

function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

function showToast(msg, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
