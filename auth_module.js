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
      <div class="flex-column" style="gap: 15px; padding: 10px;">
        <input type="email" id="authEmail" class="input-flat" placeholder="البريد الإلكتروني" style="width: 100%;">
        <input type="password" id="authPassword" class="input-flat" placeholder="كلمة المرور" style="width: 100%;">
        <div id="signupFields" style="display: none;" class="flex-column" style="gap: 15px;">
           <input type="text" id="authDisplayName" class="input-flat" placeholder="الاسم المستعار" style="width: 100%; margin-top:15px;">
           <input type="text" id="authUsername" class="input-flat" placeholder="اسم المستخدم (English)" style="width: 100%; margin-top:15px;">
        </div>
        <button id="authSubmitBtn" class="btn-flat active" style="width: 100%; height: 40px; margin-top: 10px;">دخول</button>
        <p style="text-align: center; font-size: 12px; cursor: pointer; margin-top: 10px; opacity: 0.7;" id="toggleAuth">ليس لديك حساب؟ إنشاء حساب جديد</p>
      </div>
    `;

    modalBg.classList.add('open');

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

    submitBtn.onclick = async () => {
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
          // لا نحتاج لريفريش، سنقوم بتحديث الحالة برمجياً
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

// جعل الموديول متاحاً عالمياً فور تحميله
window.AuthModule = AuthModule;
