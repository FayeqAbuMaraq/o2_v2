/* install.js — زر "ثبّت التطبيق": بيشغّل نافذة التثبيت الرسمية مباشرة (beforeinstallprompt)
   - الزر ظاهر دايماً إلا لو الموقع مثبّت أصلاً
   - لو المتصفح ما بيدعم التثبيت المباشر (آيفون مثلاً) بيطلع سطر تنبيه صغير بس */
(function () {
    'use strict';
    var deferred = null, btn = null, toastT = 0;
    var ua = navigator.userAgent || '';
    var standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
    var ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    function sync() { if (btn) btn.hidden = standalone; }
    function toast(msg) {
        var t = document.getElementById('o2-toast');
        if (!t) { t = document.createElement('div'); t.id = 'o2-toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
        t.textContent = msg; t.classList.add('on');
        clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, 4200);
    }

    window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferred = e; });
    window.addEventListener('appinstalled', function () { deferred = null; standalone = true; sync(); });

    function onClick() {
        if (deferred) {
            var p = deferred; deferred = null;
            p.prompt();
        } else if (ios) toast('على الآيفون: من سفاري اضغط مشاركة ← «إضافة إلى الشاشة الرئيسية»');
        else toast('التثبيت المباشر مش متاح هلأ — افتح الموقع بكروم أو إيدج');
    }

    function init() {
        btn = document.getElementById('install-btn'); if (!btn) return;
        btn.addEventListener('click', onClick); sync();
    }
    window.O2Install = { available: function () { return !!deferred; } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
