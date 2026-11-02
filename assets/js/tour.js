/* tour.js — جولة تعريفية لأول زيارة (spotlight): كل قسم بينعرض ومعه شرح قصير
   - بتشتغل تلقائياً مرة وحدة (localStorage: o2.tour.v1) بعد انتهاء الإنترو
   - زر "؟" بالشريط العلوي بيعيدها بأي وقت، أو O2Tour.start(true)
   - الخطوات اللي عنصرها مش ظاهر (مثلاً السلة الفاضية أو زر التثبيت) بتنتخطى تلقائياً
   عدّل القائمة STEPS تحت: sel = محدّد العنصر (أول عنصر ظاهر بالقائمة) */
(function () {
    'use strict';
    var KEY = 'o2.tour.v1';
    var REDUCE = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

    var STEPS = [
        { t: 'أهلاً فيك بـ O2 Rewards 👋', d: 'جولة سريعة (أقل من دقيقة) بتعرّفك على كل قسم بالموقع وشو بتسوي فيه.', welcome: true },
        { sel: '#o2-bottle', t: 'زجاجتك', d: 'مع كل طلب بتجمع نقاط، والزجاجة بتمتلئ بالأحمر كل ما تقدمت. لما تمتلئ بتوصل للمستوى التالي.' },
        { sel: '#tier-road', t: 'مستويات العضوية', d: 'ستة مستويات من الفضي لحد الأسطوري. اضغط على أي مستوى لتعرف هديته وسحبه.' },
        { sel: '#perks .perks-head', t: 'الهدايا والمزايا', d: 'اختر أي مستوى وشوف هداياه ومزاياه. كل ما ترتقي بتفتح هدايا أكبر.' },
        { sel: '#rewards h2, #rewards h3, #rewards', t: 'استبدال المكافآت', d: 'هون بتصرف نقاطك على وجبات ومشروبات مجانية. المكافأة المقفلة بتبيّن لك كم نقطة ناقصك عشان تفتحها.' },
        { sel: '#invite', t: 'ادعُ أصدقاءك', d: 'شارك رابطك الخاص، ولما صديقك يسجّل بتاخد نقاط هدية تلقائياً.' },
        { sel: '.o2-tools', t: 'أدوات سريعة', d: '«شو آكل؟» بتسحب وبنختار لك وجبتك، «ابعت بطاقة» بتهدي صاحبك نقاط، و«عجلة الحظ» لفّة مجانية كل يوم.' },
        { sel: '#menu-search-input', t: 'ابحث بالمنيو', d: 'اكتب اسم الوجبة أو أي مكوّن وبتطلع لك النتائج فوراً.' },
        { sel: '#menu-cats-inner', t: 'أقسام المنيو', d: 'تنقّل بين الأقسام، واضغط ❤ على أي صنف لتحفظه بالمفضلة. ضيف للسلة وبتكسب نقاط على كل طلب.' },
        { sel: '#install-btn', t: 'ثبّت التطبيق', d: 'ثبّت O2 على جوالك بضغطة وحدة، وبيفتح مثل أي تطبيق من الشاشة الرئيسية.' },
        { sel: '#bottom-nav, #navbar .md\\:block', t: 'التنقل', d: 'من هون بتنتقل بسرعة بين الرئيسية والمكافآت والمنيو وطرق كسب النقاط.' },
        { sel: '#snd-btn', t: 'الصوت', d: 'الأصوات خفيفة، ولو ما بدك إياها اكتمها من هون.' },
        { t: 'جاهز! 🎉', d: 'بأي وقت بتقدر تعيد الجولة من زر «؟» فوق. بالتوفيق وصحتين وعافية!', welcome: true, last: true }
    ];

    var root, spot, card, els = {}, idx = -1, open = false, raf = 0, curEl = null, timer = 0, lastFocus = null;

    function seen() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
    function mark() { try { localStorage.setItem(KEY, '1'); } catch (e) {} }
    function visible(el) {
        if (!el) return false;
        var r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false;
        var s = getComputedStyle(el); return s.display !== 'none' && s.visibility !== 'hidden';
    }
    function find(sel) {
        var list = document.querySelectorAll(sel);
        for (var i = 0; i < list.length; i++) if (visible(list[i])) return list[i];
        return null;
    }
    function isFixed(el) {
        for (var n = el; n && n !== document.body; n = n.parentElement) if (getComputedStyle(n).position === 'fixed') return true;
        return false;
    }
    // أقرب خطوة صالحة بالاتجاه المطلوب
    function resolve(from, dir) {
        for (var i = from; i >= 0 && i < STEPS.length; i += dir) {
            var s = STEPS[i];
            if (s.welcome) return { i: i, el: null };
            var el = find(s.sel); if (el) return { i: i, el: el };
        }
        return null;
    }

    function build() {
        root = document.createElement('div'); root.id = 'o2t'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-labelledby', 'o2t-title');
        root.innerHTML = '<div class="o2t-block"></div><div class="o2t-spot"></div>' +
            '<div class="o2t-card"><div class="o2t-count"></div><h3 id="o2t-title"></h3><p></p><div class="o2t-dots"></div>' +
            '<div class="o2t-btns"><button type="button" class="o2t-skip">تخطي</button><span class="sp"></span><button type="button" class="o2t-prev">السابق</button><button type="button" class="o2t-next">التالي</button></div></div>';
        document.body.appendChild(root);
        spot = root.querySelector('.o2t-spot'); card = root.querySelector('.o2t-card');
        els = { count: root.querySelector('.o2t-count'), t: root.querySelector('h3'), d: root.querySelector('p'), dots: root.querySelector('.o2t-dots'),
            skip: root.querySelector('.o2t-skip'), prev: root.querySelector('.o2t-prev'), next: root.querySelector('.o2t-next') };
        els.skip.onclick = end; els.prev.onclick = function () { move(-1); }; els.next.onclick = function () { move(1); };
        root.querySelector('.o2t-block').onclick = function (e) { e.stopPropagation(); };
    }

    function layout() {
        raf = 0; if (!open) return;
        var vw = window.innerWidth, vh = window.innerHeight, cw = Math.min(340, vw - 24);
        card.style.width = cw + 'px';
        var ch = card.offsetHeight, left, top;
        if (curEl && visible(curEl)) {
            var r = curEl.getBoundingClientRect(), pad = 8, h = Math.min(r.height, vh * .55);
            var sl = r.left - pad, st = r.top - pad, sw = r.width + pad * 2, sh = h + pad * 2;
            spot.style.left = sl + 'px'; spot.style.top = st + 'px'; spot.style.width = sw + 'px'; spot.style.height = sh + 'px';
            var below = vh - (st + sh), above = st;
            if (below >= ch + 18) top = st + sh + 12;
            else if (above >= ch + 18) top = st - ch - 12;
            else top = vh - ch - 16;
            left = sl + sw / 2 - cw / 2;
        } else { top = (vh - ch) / 2; left = (vw - cw) / 2; }
        left = Math.max(12, Math.min(left, vw - cw - 12)); top = Math.max(12, Math.min(top, vh - ch - 12));
        card.style.left = left + 'px'; card.style.top = top + 'px';
        raf = requestAnimationFrame(layout);
    }

    function scrollTo(el, done) {
        if (isFixed(el)) { done(); return; }
        var r = el.getBoundingClientRect(), y = Math.max(0, r.top + window.scrollY - (window.innerWidth < 640 ? 96 : 112));
        if (Math.abs(y - window.scrollY) < 6) { done(); return; }
        if (REDUCE) { window.scrollTo(0, y); done(); return; }
        if (window.o2Lenis && window.o2Lenis.scrollTo) window.o2Lenis.scrollTo(y, { duration: .85 });
        else window.scrollTo({ top: y, behavior: 'smooth' });
        timer = setTimeout(done, 950);
    }

    function show(res) {
        var s = STEPS[res.i], total = STEPS.length;
        clearTimeout(timer); idx = res.i; curEl = res.el;
        var n = 0, pos = 0; STEPS.forEach(function (x, k) { n++; if (k === idx) pos = n; });
        els.count.textContent = s.last ? '' : (idx === 0 ? 'مرحباً' : 'الخطوة ' + (pos - 1) + ' من ' + (total - 2));
        els.t.textContent = s.t; els.d.textContent = s.d;
        els.dots.innerHTML = STEPS.map(function (x, k) { return '<i' + (k === idx ? ' class="on"' : '') + '></i>'; }).join('');
        var first = idx === 0, last = !!s.last;
        els.prev.hidden = first; els.skip.hidden = last;
        els.next.textContent = first ? 'يلا نبدأ' : last ? 'خلصنا' : 'التالي';
        root.classList.toggle('has-spot', !!res.el);
        if (res.el) { root.classList.add('moving'); scrollTo(res.el, function () { if (open) root.classList.remove('moving'); }); }
        else root.classList.remove('moving');
        if (!raf) raf = requestAnimationFrame(layout);
        els.next.focus({ preventScroll: true });
    }

    function move(dir) {
        var nx = idx + dir;
        if (dir > 0 && nx >= STEPS.length) { end(); return; }
        var res = resolve(nx, dir); if (!res) { if (dir > 0) end(); return; }
        show(res);
    }

    function onKey(e) {
        if (!open) return;
        if (e.key === 'Escape') end();
        else if (e.key === 'ArrowLeft' || e.key === 'Enter' && e.target.tagName !== 'BUTTON') { e.preventDefault(); move(1); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); move(-1); }
    }

    function end() {
        if (!open) return; open = false; clearTimeout(timer); cancelAnimationFrame(raf); raf = 0;
        document.removeEventListener('keydown', onKey, true);
        if (root) root.remove(); root = null;
        if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
    }

    function start(force) {
        if (open) return; if (!force && seen()) return;
        mark(); open = true; lastFocus = document.activeElement;
        var ls = document.getElementById('cart-sheet'); if (ls) ls.classList.remove('open');
        build(); document.addEventListener('keydown', onKey, true);
        show({ i: 0, el: null });
    }

    function auto() {
        if (seen()) return;
        var go = function () { setTimeout(function () { if (document.hidden) { document.addEventListener('visibilitychange', function f() { if (!document.hidden) { document.removeEventListener('visibilitychange', f); start(); } }); } else start(); }, 1000); };
        if (window.__o2IntroPlaying) { var done = false; var once = function () { if (done) return; done = true; go(); }; window.addEventListener('o2-intro-reveal', once, { once: true }); setTimeout(once, 16000); }
        else go();
    }

    function init() {
        var b = document.getElementById('tour-btn'); if (b) b.addEventListener('click', function () { start(true); });
        auto();
    }
    window.O2Tour = { start: start, end: end };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
