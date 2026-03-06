import { supabase } from '../lib/supabase.js';

export function renderBirthdayPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="page-container">
      <div class="glass-card birthday-page">
        <span class="logo-icon">🌹</span>
        <h1>Happy Women's Day</h1>
        <p class="subtitle">Nhập ngày sinh của bạn để nhận thiệp chúc mừng 💌</p>
        
        <div class="input-group">
          <label for="birthday">📅 Ngày sinh của bạn</label>
          <input type="date" id="birthday" placeholder="dd/mm/yyyy" />
        </div>
        
        <div id="error-msg" class="error-message"></div>
        
        <button class="btn-primary" id="btn-submit">
          ✨ Xem Thiệp Chúc Mừng
        </button>
      </div>
    </div>
  `;

    createFloatingParticles();

    const btnSubmit = document.getElementById('btn-submit');
    const birthdayInput = document.getElementById('birthday');
    const errorMsg = document.getElementById('error-msg');

    btnSubmit.addEventListener('click', async () => {
        const birthday = birthdayInput.value;
        if (!birthday) {
            showError(errorMsg, 'Vui lòng nhập ngày sinh của bạn 🙏');
            return;
        }

        btnSubmit.innerHTML = '<span class="loading-spinner"></span>';
        btnSubmit.disabled = true;

        try {
            const { data, error } = await supabase
                .from('recipients')
                .select('*, greeting_cards(*)')
                .eq('birthday', birthday)
                .limit(1)
                .maybeSingle();

            if (error) throw error;

            if (!data) {
                showError(errorMsg, 'Không tìm thấy thông tin. Vui lòng kiểm tra lại ngày sinh! 🤔');
                btnSubmit.innerHTML = '✨ Xem Thiệp Chúc Mừng';
                btnSubmit.disabled = false;
                return;
            }

            // Store data for next pages
            window.__greetingData = data;
            window.location.hash = '#greeting';
        } catch (err) {
            console.error(err);
            showError(errorMsg, 'Có lỗi xảy ra, vui lòng thử lại! 😢');
            btnSubmit.innerHTML = '✨ Xem Thiệp Chúc Mừng';
            btnSubmit.disabled = false;
        }
    });
}

function showError(el, msg) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 4000);
}

function createFloatingParticles() {
    const container = document.getElementById('particles-container');
    container.innerHTML = '';
    const emojis = ['🌸', '🌺', '💮', '🏵️', '✨', '💕'];

    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        particle.style.left = Math.random() * 100 + '%';
        particle.style.fontSize = (Math.random() * 1.5 + 0.8) + 'rem';
        particle.style.animationDuration = (Math.random() * 8 + 6) + 's';
        particle.style.animationDelay = (Math.random() * 5) + 's';
        container.appendChild(particle);
    }
}
