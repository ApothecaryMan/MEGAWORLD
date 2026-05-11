import { supabase } from './supabase_client.js';
import { CONFIG } from './config.js';

export const AuthModule = {
  /**
   * تهيئة Google One Tap (تسجيل الدخول الحديث)
   */
  initOneTap() {
    // التأكد من تحميل المكتبة وجود الكلاينت آيدي
    if (typeof google === 'undefined' || !CONFIG.GOOGLE_CLIENT_ID || CONFIG.GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID_HERE') {
      return;
    }

    google.accounts.id.initialize({
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          });
          if (error) throw error;
          window.location.reload();
        } catch (err) {
          console.error('Google One Tap Error:', err.message);
        }
      },
      auto_select: true, // تسجيل دخول تلقائي إذا كان المستخدم مسجلاً مسبقاً
      itp_support: true
    });

    google.accounts.id.prompt((notification) => {
       if (notification.isNotDisplayed()) {
          console.log('One Tap prompt not displayed:', notification.getNotDisplayedReason());
       }
    });
  },
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
   * تسجيل الدخول باستخدام Google
   */
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  },


  /**
   * رسم واجهة الدخول (Modal) باستخدام المودال العالمي للمشروع
   */
  renderLoginModal() {
    const modalBg = document.getElementById('modalBg');
    const modalBody = document.getElementById('modalBody');
    const modalTitle = document.getElementById('modalTitle');
    const modalBtns = document.getElementById('modalBtns');

    if (!modalBg || !modalBody) return;

    modalTitle.textContent = 'تسجيل الدخول';
    modalBtns.innerHTML = ''; // تنظيف الأزرار القديمة

    modalBody.innerHTML = `
      <form id="authForm" class="flex-column" style="gap: 15px; padding: 10px;" autocomplete="off">
        <input type="email" id="authEmail" class="input-flat" dir="ltr" placeholder="البريد الإلكتروني" style="width: 100%;" required autocomplete="off">
        <div class="input-wrap">
          <input type="password" id="authPassword" class="input-flat" dir="ltr" placeholder="كلمة المرور" style="width: 100%; padding-right: 40px;" required autocomplete="new-password">
          <i class="ti ti-eye input-icon" id="togglePassword" style="cursor: pointer; pointer-events: all; right: 12px; left: auto;"></i>
        </div>
        <div id="signupFields" style="display: none;" class="flex-column" style="gap: 15px;">
           <input type="text" id="authDisplayName" class="input-flat" placeholder="الاسم المستعار" style="width: 100%; margin-top:15px;">
           <input type="text" id="authUsername" class="input-flat" placeholder="اسم المستخدم (English)" style="width: 100%; margin-top:15px;">
        </div>
        <button type="submit" id="authSubmitBtn" class="btn-flat active" style="width: 100%; height: 40px; margin-top: 10px;">دخول</button>
        <p style="text-align: center; font-size: 12px; cursor: pointer; margin-top: 10px; opacity: 0.7;" id="toggleAuth">ليس لديك حساب؟ إنشاء حساب جديد</p>
        <p style="text-align: center; font-size: 11px; cursor: pointer; margin-top: 5px; opacity: 0.5; color: var(--color-theme); display: none;" id="resendVerify">لم تصلك رسالة التحقق؟ إعادة الإرسال</p>
        
        <div style="display: flex; align-items: center; gap: 10px; margin: 15px 0;">
          <div style="flex: 1; height: 1px; background: var(--ui-border); opacity: 0.3;"></div>
          <span style="font-size: 10px; opacity: 0.5;">أو</span>
          <div style="flex: 1; height: 1px; background: var(--ui-border); opacity: 0.3;"></div>
        </div>

        <button type="button" id="googleAuthBtn" class="btn-flat" style="width: 100%; height: 42px; display: flex; align-items: center; justify-content: center; gap: 12px; background: white; color: #3c4043; border: 1px solid #dadce0; font-family: 'Roboto', arial, sans-serif; font-weight: 500; font-size: 14px; cursor: pointer;">
          <svg width="18" height="18" viewBox="0 0 18 18" style="display: block;">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
            <path fill="#FBBC05" d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.172.282-1.712V4.956H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.044l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.582C13.463.891 11.426 0 9 0 5.482 0 2.443 2.048.957 4.956L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
          </svg>
          الدخول باستخدام Google
        </button>
      </form>
    `;


    modalBg.querySelector('.modal').classList.add('modal-small');
    modalBg.classList.add('open');

    // Resend Verification Logic
    modalBody.querySelector('#resendVerify').onclick = async () => {
      const email = modalBody.querySelector('#authEmail').value;
      if (!email) {
        alert('يرجى إدخال البريد الإلكتروني أولاً');
        return;
      }
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      if (error) alert('خطأ: ' + error.message);
      else alert('تم إعادة إرسال رسالة التحقق بنجاح، تحقق من صندوق الوارد');
    };

    // Google Auth Logic
    modalBody.querySelector('#googleAuthBtn').onclick = async () => {
      try {
        await this.signInWithGoogle();
      } catch (err) {
        alert('خطأ في الاتصال بجوجل: ' + err.message);
      }
    };

    // Password Toggle Logic
    const passInput = modalBody.querySelector('#authPassword');
    const passToggle = modalBody.querySelector('#togglePassword');
    passToggle.onclick = () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      passToggle.className = `ti ti-eye${isPass ? '-off' : ''} input-icon`;
    };

    // منطق التبديل والإرسال (نفس المنطق السابق مع تحديث الـ Selectors)
    let isSignup = false;
    const toggleBtn = modalBody.querySelector('#toggleAuth');
    const signupFields = modalBody.querySelector('#signupFields');
    const submitBtn = modalBody.querySelector('#authSubmitBtn');

    toggleBtn.onclick = () => {
      isSignup = !isSignup;
      signupFields.style.display = isSignup ? 'flex' : 'none';
      modalTitle.textContent = isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول';
      submitBtn.textContent = isSignup ? 'إنشاء الحساب' : 'دخول';
      toggleBtn.textContent = isSignup ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ إنشاء حساب جديد';
    };

    modalBody.querySelector('#authForm').onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = modalBody.querySelector('#authSubmitBtn');
      const isSignup = modalTitle.textContent === 'إنشاء حساب جديد';
      
      const email = modalBody.querySelector('#authEmail').value;
      const password = modalBody.querySelector('#authPassword').value;

      try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'جاري العمل...';
        
        if (isSignup) {
          const dn = modalBody.querySelector('#authDisplayName').value;
          const un = modalBody.querySelector('#authUsername').value;
          await this.signUp(email, password, dn, un);
          alert('تم إنشاء الحساب بنجاح! راجع بريدك للتفعيل.');
        } else {
          await this.signIn(email, password);
          modalBg.classList.remove('open');
          window.location.reload(); 
        }
      } catch (err) {
        alert('خطأ: ' + err.message);
        // إظهار خيار إعادة الإرسال إذا كان الخطأ متعلق بالتفعيل
        if (err.message.toLowerCase().includes('confirm') || err.message.toLowerCase().includes('verify')) {
          modalBody.querySelector('#resendVerify').style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isSignup ? 'إنشاء الحساب' : 'دخول';
      }
    };
  }
};

// جعل الموديول متاحاً عالمياً فور تحميله
window.AuthModule = AuthModule;
