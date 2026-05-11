import { supabase } from './supabase_client.js';

export const AuthModule = {
  /**
   * تسجيل مستخدم جديد
   */
  async signUp(email, password, displayName, username) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          username: username
        }
      }
    });

    if (error) throw error;
    return data;
  },

  /**
   * تسجيل الدخول
   */
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * تسجيل الخروج
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    window.location.reload(); // إعادة تحميل لتهيئة الحالة
  },

  /**
   * رسم واجهة الدخول (Modal)
   */
  renderLoginModal() {
    // إنشاء العنصر إذا لم يكن موجوداً
    let modal = document.getElementById('authModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'authModal';
      modal.className = 'modal-bg'; // استخدم نفس الستايل اللي في التطبيق
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-content-flat" style="max-width: 400px;">
        <div class="modal-header">
          <h2 id="authTitle">تسجيل الدخول</h2>
          <button class="btn-icon" onclick="document.getElementById('authModal').classList.remove('open')">
            <i class="ti ti-x"></i>
          </button>
        </div>
        <div class="modal-body flex-column" style="gap: 15px;">
          <input type="email" id="authEmail" class="input-flat" placeholder="البريد الإلكتروني">
          <input type="password" id="authPassword" class="input-flat" placeholder="كلمة المرور">
          <div id="signupFields" style="display: none;" class="flex-column" style="gap: 15px;">
             <input type="text" id="authDisplayName" class="input-flat" placeholder="الاسم المستعار">
             <input type="text" id="authUsername" class="input-flat" placeholder="اسم المستخدم (English)">
          </div>
          <button id="authSubmitBtn" class="btn-flat active" style="width: 100%; height: 40px;">دخول</button>
          <p style="text-align: center; font-size: 12px; cursor: pointer;" id="toggleAuth">ليس لديك حساب؟ إنشاء حساب جديد</p>
        </div>
      </div>
    `;

    modal.classList.add('open');

    // منطق التبديل بين Login و Signup
    let isSignup = false;
    const toggleBtn = modal.querySelector('#toggleAuth');
    const signupFields = modal.querySelector('#signupFields');
    const title = modal.querySelector('#authTitle');
    const submitBtn = modal.querySelector('#authSubmitBtn');

    toggleBtn.onclick = () => {
      isSignup = !isSignup;
      signupFields.style.display = isSignup ? 'flex' : 'none';
      title.textContent = isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
      submitBtn.textContent = isSignup ? 'إنشاء الحساب' : 'دخول';
      toggleBtn.textContent = isSignup ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ إنشاء حساب جديد';
    };

    // منطق الإرسال
    submitBtn.onclick = async () => {
      const email = modal.querySelector('#authEmail').value;
      const password = modal.querySelector('#authPassword').value;
      
      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري العمل...';
        
        if (isSignup) {
          const dn = modal.querySelector('#authDisplayName').value;
          const un = modal.querySelector('#authUsername').value;
          await this.signUp(email, password, dn, un);
          alert('تم إنشاء الحساب بنجاح! برجاء تفعيل البريد الإلكتروني إذا لزم الأمر.');
        } else {
          await this.signIn(email, password);
          modal.classList.remove('open');
          window.location.reload();
        }
      } catch (err) {
        alert('خطأ: ' + err.message);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? 'إنشاء الحساب' : 'دخول';
      }
    };
  }
};
