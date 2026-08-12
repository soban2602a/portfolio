/* =============================================================
   SOBAN AHMAD — PORTFOLIO SCRIPTS
   -------------------------------------------------------------
   Uses jQuery for UI conveniences (smooth scroll, nav, form)
   and modern JS (IntersectionObserver, rAF) for performance.
   Sections: 1.config  2.loader  3.particles  4.cursor  5.navbar
             6.hero  7.reveal  8.projects  9.skills  10.counters
             11.contact  12.back-to-top  13.progress  14.typewriter
             15.filter  16.cta-tilt
   ============================================================= */

(function ($) {
    'use strict';

    /* lock body scroll while the loader is showing (hides scrollbar) */
    $('body').addClass('no-scroll');

    /* always start at the top on reload, never restore old scroll position */
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    /* =========================================================
       1. CONFIG — edit this data
       ========================================================= */
    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var IS_FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* Project data — replace urls & text with your own projects.
       Order must match the cards in index.html (data-index). */
    var PROJECTS = [
        {
            img: 'images/BRIGHTWORLD-LED-LIGHTS.png',
            number: 'PROJECT 01',
            title: 'BRIGHTWORLD-LED-LIGHTS',
            desc: 'A bright and modern LED lights website with a clean, responsive and user-friendly layout.',
            tech: 'HTML • CSS • Bootstrap • JavaScript',
            demo: 'https://soban2602a.github.io/BRIGHTWORLD-LED-LIGHTS/',   // <-- put your live demo URL here
            github: 'https://github.com/soban2602a/BRIGHTWORLD-LED-LIGHTS.git'  // <-- put your GitHub URL here
        },
        {
            img: 'images/infinity-watches.png',
            number: 'PROJECT 02',
            title: 'INFINITY-WATCHES',
            desc: 'A luxury watches website with an elegant, responsive design and a premium shopping experience.',
            tech: 'HTML • CSS • JavaScript • Bootstrap',
            demo: 'https://soban2602a.github.io/infinity-watches/',
            github: 'https://github.com/soban2602a/infinity-watches.git'
        },
        {
            img: 'images/brewnest.png',
            number: 'PROJECT 03',
            title: 'BREWNEST',
            desc: 'A coffee shop website with a custom loader, order/cart system and smooth animations.',
            tech: 'HTML • CSS • jQuery • Bootstrap',
            demo: 'https://soban2602a.github.io/brewnest/',
            github: 'https://github.com/soban2602a/brewnest.git'
        }
    ];

    /* Skill progress values — edit data-progress in index.html to
       change bar widths/percentages. */

    /* run a scroll callback at most once per frame (cheap on mobile) */
    function rafThrottle(fn) {
        var ticking = false;
        return function () {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(function () {
                ticking = false;
                fn();
            });
        };
    }

    /* =========================================================
       2. LOADER — fast, uses page ready state
       ========================================================= */
    function initLoader() {
        var $loader = $('#loader');
        var $percent = $('#loaderPercent');
        var $status = $('#loaderStatus');
        var loaded = false;

        var el = document.getElementById('loaderFill');
        var tick = null;

        /* changing status line as the loader fills */
        var statusSteps = [
            [20, 'INITIALIZING'],
            [45, 'WAKING UP THE BITS'],
            [70, 'STYLING THE LAYOUT'],
            [90, 'POLISHING PIXELS'],
            [100, 'ALMOST THERE']
        ];

        function updateProgress(p) {
            if (el) {
                el.style.width = p + '%';
            }
            if ($percent.length) {
                $percent.text('LOADING ' + p + '%');
            }
            if ($status.length) {
                for (var i = 0; i < statusSteps.length; i++) {
                    if (p <= statusSteps[i][0]) {
                        $status.text(statusSteps[i][1]);
                        break;
                    }
                }
            }
        }

        function finish() {
            clearInterval(tick);
            $('body').removeClass('no-scroll');
            if (!$loader.length) return;

            /* reveal the page first, then fade the loader out on top of it */
            window.dispatchEvent(new CustomEvent('loader:done'));
            setTimeout(function () {
                $loader.addClass('done');
                setTimeout(function () {
                    $loader.css('display', 'none');
                }, 650);
            }, 300);
        }

        /* fill 0 -> 100 smoothly over ~2.6s */
        function startCounting() {
            if (tick) return;
            var start = performance.now();
            var duration = 2600;
            tick = setInterval(function () {
                var p = Math.round(((performance.now() - start) / duration) * 100);
                if (p >= 100) p = 100;
                updateProgress(p);
                if (p >= 100) {
                    clearInterval(tick);
                    tick = null;
                    setTimeout(finish, 300);
                }
            }, 30);
        }

        window.addEventListener('load', function () {
            loaded = true;
            startCounting();
        });

        /* safety: never let the loader hang longer than ~2.8s */
        setTimeout(function () {
            if (!loaded) {
                startCounting();
            }
        }, 1800);

        /* reduced-motion: skip the animations entirely */
        if (REDUCED) {
            updateProgress(100);
            finish();
        }
    }

    /* =========================================================
       4. CUSTOM CURSOR (desktop only)
       ========================================================= */
    function initCursor() {
        if (!IS_FINE_POINTER || REDUCED) return;

        var dot = document.getElementById('cursorDot');
        var ring = document.getElementById('cursorRing');
        if (!dot || !ring) return;

        document.body.classList.add('cursor-on');

        var mx = -100, my = -100;      /* mouse position */
        var rx = -100, ry = -100;      /* ring position (lerped) */
        var raf = null;

        /* interactive selectors that grow the ring */
        var interactive = 'a, button, .project-card, .info-card, .social-link, ' +
            '.form-input, .hero-img-wrap, .back-to-top, .custom-toggler, input, textarea';

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX;
            my = e.clientY;
            dot.style.transform = 'translate(' + (mx - 4) + 'px,' + (my - 4) + 'px)';

            if (!raf) {
                raf = requestAnimationFrame(loop);
            }
        }, { passive: true });

        function loop() {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = 'translate(' + (rx - ring.offsetWidth / 2) + 'px,' +
                (ry - ring.offsetHeight / 2) + 'px)';
            raf = null;
        }

        /* grow ring over interactive elements (event delegation) */
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(interactive)) ring.classList.add('grow');
            if (e.target.closest('.project-card')) ring.classList.add('view');
        });

        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(interactive)) ring.classList.remove('grow');
            if (e.target.closest('.project-card')) ring.classList.remove('view');
        });

        /* hide cursor when leaving window */
        document.addEventListener('mouseleave', function () {
            dot.style.opacity = '0';
            ring.style.opacity = '0';
        });

        document.addEventListener('mouseenter', function () {
            dot.style.opacity = '1';
            ring.style.opacity = '1';
        });
    }

    /* =========================================================
       5. NAVBAR — scroll effect + active link
       ========================================================= */
    function initNavbar() {
        var $nav = $('#mainNav');
        var $links = $nav.find('.nav-link');
        var lastY = window.scrollY;

        function onScroll() {
            var y = window.scrollY;

            /* auto-hide navbar on scroll down, reveal on scroll up */
            var $collapse = $('#navMenu');
            var menuOpen = $collapse.length && $collapse.hasClass('show');
            if (!menuOpen && y > lastY && y > 140) {
                $nav.addClass('nav-hidden');
            } else if (y < lastY || y <= 140) {
                $nav.removeClass('nav-hidden');
            }
            lastY = y;

            if (y > 40) {
                $nav.addClass('scrolled');
            } else {
                $nav.removeClass('scrolled');
            }

            /* scrollspy — highlight current section link */
            var pos = y + 120;
            $links.each(function () {
                var id = $(this).attr('href');
                if (id && id.charAt(0) === '#') {
                    var $sec = $(id);
                    if ($sec.length && pos >= $sec.offset().top) {
                        $links.removeClass('active');
                        $(this).addClass('active');
                    }
                }
            });
        }

        window.addEventListener('scroll', rafThrottle(onScroll), { passive: true });
        onScroll();

        /* close the mobile menu after clicking a link */
        $links.on('click', function () {
            var $collapse = $('#navMenu');
            if ($collapse.hasClass('show')) {
                /* use Bootstrap collapse API if available */
                var bs = bootstrap.Collapse.getInstance($collapse[0]);
                if (bs) bs.hide();
            }
        });
    }

    /* helper: run a callback only after the loader has finished
       (used so hero/hero reveal animations play as the loader fades) */
    function onLoaderDone(cb) {
        var $loader = $('#loader');
        var alreadyDone = !$loader.length || $loader.hasClass('done') ||
            $loader.css('display') === 'none';

        if (alreadyDone) {
            cb();
            return;
        }

        window.addEventListener('loader:done', function () {
            cb();
        }, { once: true });

        /* safety fallback — never block the page */
        setTimeout(function () {
            if ($loader.length && !$loader.hasClass('done') && $loader.css('display') !== 'none') {
                cb();
            }
        }, 3600);
    }

    /* =========================================================
       6. HERO — letter reveal, tilt, parallax
       ========================================================= */
    function initHeroName() {
        var $name = $('#heroName');
        if (!$name.length) return;

        var text = $name.text();

        onLoaderDone(function () {
            var delay = 0;
            var html = '';

            for (var i = 0; i < text.length; i++) {
                var ch = text.charAt(i);
                if (ch === ' ') {
                    html += '<span class="letter space" aria-hidden="true"></span>';
                } else {
                    html += '<span class="letter" style="animation-delay:' + delay + 'ms">' + ch + '</span>';
                }
                delay += 28;
            }

            $name.html(html);
            $name.attr('aria-label', text);
        });
    }

    function initHeroTilt() {
        if (REDUCED) return;

        var $wrap = $('#heroImgWrap');
        var $img = $('#heroImg');
        if (!$wrap.length) return;

        var wrap = $wrap[0];
        var rect = null;
        var tiltX = 0, tiltY = 0;

        $wrap.parent('.hero-visual').on('mousemove', function (e) {
            rect = wrap.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;

            tiltY = (e.clientX - cx) / 26;
            tiltX = -(e.clientY - cy) / 26;

            /* parallax: translate the image inside slightly */
            var px = (e.clientX - cx) / 40;
            var py = (e.clientY - cy) / 40;

            wrap.style.transform =
                'perspective(900px) rotateY(' + tiltY + 'deg) rotateX(' + tiltX + 'deg)';

            if ($img.length) {
                $img[0].style.transform = 'translate(' + px + 'px,' + py + 'px) scale(1.04)';
            }
        });

        $wrap.parent('.hero-visual').on('mouseleave', function () {
            wrap.style.transform = '';
            if ($img.length) {
                $img[0].style.transform = '';
            }
        });
    }

    /* =========================================================
       7. SCROLL REVEAL — IntersectionObserver
       ========================================================= */
    function initReveal() {
        var targets = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
        if (!targets.length) return;

        if (REDUCED || !('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('in-view'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var el = entry.target;
                var delay = el.getAttribute('data-delay') || 0;
                el.style.transitionDelay = delay + 'ms';
                el.classList.add('in-view');
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        /* wait for the loader so the hero reveals as it fades out */
        onLoaderDone(function () {
            targets.forEach(function (el) { io.observe(el); });
        });
    }

    /* =========================================================
       8. PROJECTS — 3D hover, glow follow, modal
       ========================================================= */
    function initProjects() {
        var $cards = $('.project-card');

        /* mouse-follow glow + subtle 3D tilt */
        if (IS_FINE_POINTER && !REDUCED) {
            $cards.on('mousemove', function (e) {
                var rect = this.getBoundingClientRect();
                var mx = e.clientX - rect.left;
                var my = e.clientY - rect.top;
                this.style.setProperty('--mx', mx + 'px');
                this.style.setProperty('--my', my + 'px');

                var rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 10;
                var rotX = -((e.clientY - rect.top) / rect.height - 0.5) * 10;
                this.style.transform = 'perspective(1000px) rotateX(' + rotX +
                    'deg) rotateY(' + rotY + 'deg) translateY(-6px)';
            });

            $cards.on('mouseleave', function () {
                this.style.transform = '';
            });
        }

        /* open modal on click / Enter / Space (keyboard accessible) */
        $cards.on('click keydown', function (e) {
            if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
            if (e.type === 'keydown') e.preventDefault();

            openProjectModal(parseInt(this.getAttribute('data-index'), 10));
        });
    }

    function openProjectModal(index) {
        var data = PROJECTS[index];
        if (!data) return;

        $('#modalImg').attr('src', data.img);
        $('#modalImg').attr('alt', data.title + ' project preview');
        $('#modalNumber').text(data.number);
        $('#modalTitle').text(data.title);
        $('#modalDesc').text(data.desc);
        $('#modalTech').text(data.tech);
        $('#modalLive').attr('href', data.demo);
        $('#modalGithub').attr('href', data.github);

        /* guard against placeholder # links */
        if (data.demo === '#') {
            $('#modalLive').attr('href', 'javascript:void(0)');
        }
        if (data.github === '#') {
            $('#modalGithub').attr('href', 'javascript:void(0)');
        }

        var modalEl = document.getElementById('projectModal');
        if (modalEl) {
            var modal = bootstrap.Modal.getOrCreateInstance(modalEl);
            modal.show();
        }
    }

    /* =========================================================
       9. SKILLS — animated progress bars
       ========================================================= */
    function initSkills() {
        var $bars = $('.skill-progress');
        if (!$bars.length) return;

        if (REDUCED || !('IntersectionObserver' in window)) {
            $bars.each(function () {
                var p = this.getAttribute('data-progress') || '0';
                $(this).find('.progress-bar').css('width', p + '%');
                $(this).closest('.skill-card').find('.skill-percent').text(p + '%');
            });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;

                var bar = entry.target;
                var p = bar.getAttribute('data-progress') || '0';
                var $bar = $(bar);
                var $percent = $bar.closest('.skill-card').find('.skill-percent');

                $bar.find('.progress-bar').css('width', p + '%');

                /* count the percent number up to match */
                if ($percent.length) {
                    var start = 0;
                    var end = parseInt(p, 10);
                    var step = Math.max(1, Math.round(end / 60));
                    var timer = setInterval(function () {
                        start += step;
                        if (start >= end) {
                            start = end;
                            clearInterval(timer);
                        }
                        $percent.text(start + '%');
                    }, 18);
                }

                io.unobserve(bar);
            });
        }, { threshold: 0.4 });

        $bars.each(function () { io.observe(this); });
    }

    /* =========================================================
       10. COUNTERS
       ========================================================= */
    function initCounters() {
        var $counters = $('.counter');
        if (!$counters.length) return;

        function runCounter(el) {
            var target = parseInt(el.getAttribute('data-target'), 10) || 0;
            var cur = 0;
            var step = Math.max(1, Math.round(target / 60));

            var timer = setInterval(function () {
                cur += step;
                if (cur >= target) {
                    cur = target;
                    clearInterval(timer);
                }
                el.textContent = cur;
            }, 20);
        }

        if (REDUCED || !('IntersectionObserver' in window)) {
            $counters.each(function () { this.textContent = this.getAttribute('data-target'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.5 });

        $counters.each(function () { io.observe(this); });
    }

    /* =========================================================
       11. CONTACT FORM — frontend validation + demo success
       ========================================================= */
    function initContactForm() {
        var $form = $('#contactForm');
        if (!$form.length) return;

        var $send = $('#sendBtn');
        var $status = $('#formStatus');

        function setField($input, state) {
            var $field = $input.closest('.form-field');
            $field.removeClass('error success');
            if (state) $field.addClass(state);
        }

        function validateEmail(value) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }

        $form.on('submit', function (e) {
            e.preventDefault();

            var ok = true;

            var $name = $('#fName');
            var $email = $('#fEmail');
            var $subject = $('#fSubject');
            var $message = $('#fMessage');

            /* reset states */
            setField($name, '');
            setField($email, '');
            setField($subject, '');
            setField($message, '');
            $status.text('');

            if ($name.val().trim().length < 2) {
                setField($name, 'error'); ok = false;
            } else {
                setField($name, 'success');
            }

            if (!validateEmail($email.val().trim())) {
                setField($email, 'error'); ok = false;
            } else {
                setField($email, 'success');
            }

            if ($subject.val().trim().length < 2) {
                setField($subject, 'error'); ok = false;
            } else {
                setField($subject, 'success');
            }

            if ($message.val().trim().length < 5) {
                setField($message, 'error'); ok = false;
            } else {
                setField($message, 'success');
            }

            if (!ok) return;

            /* demo submission — connect to a real mail service later */
            $send.addClass('sending').prop('disabled', true);
            $status.text('SENDING...');
            $status.css('color', 'var(--cyan)');

            setTimeout(function () {
                $send.removeClass('sending').addClass('sent');
                $status.text('✓ MESSAGE SENT SUCCESSFULLY');
                $status.css('color', '#34d399');

                setTimeout(function () {
                    $send.removeClass('sent').prop('disabled', false);
                    $form[0].reset();
                    $('.form-field').removeClass('success');
                    $status.text('');
                }, 3200);
            }, 1400);
        });

        /* clear error state while typing */
        $form.find('.form-input').on('input', function () {
            setField($(this), '');
        });
    }

    /* =========================================================
       12. BACK TO TOP
       ========================================================= */
    function initBackToTop() {
        var $btn = $('#backToTop');
        var $ring = $('#topRing');
        var CIRC = 100.53;
        if (!$btn.length) return;

        function update() {
            var show = window.scrollY > 500;
            $btn.toggleClass('visible', show);

            var max = document.documentElement.scrollHeight - window.innerHeight;
            var p = max > 0 ? (window.scrollY / max) : 0;
            if ($ring.length) {
                $ring[0].style.strokeDashoffset = (CIRC * (1 - p)).toFixed(2);
            }
        }

        window.addEventListener('scroll', rafThrottle(update), { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();

        $btn.on('click', function () {
            $('html, body').animate({ scrollTop: 0 }, 650, 'swing');
        });
    }

    /* =========================================================
       13. SCROLL PROGRESS — top gradient bar
       ========================================================= */
    function initScrollProgress() {
        var $bar = $('#scrollBar');
        if (!$bar.length) return;

        function update() {
            var max = document.documentElement.scrollHeight - window.innerHeight;
            var p = max > 0 ? (window.scrollY / max) * 100 : 0;
            $bar.css('width', p + '%');
        }

        window.addEventListener('scroll', rafThrottle(update), { passive: true });
        window.addEventListener('resize', update, { passive: true });
        update();
    }

    /* =========================================================
       14. TYPEWRITER — cycles the hero role text
       (starts with WEB DEVELOPER, deletes it, types the next, ...)
       ========================================================= */
    function initTypewriter() {
        var $el = $('#roleText');
        if (!$el.length) return;

        var roles = ['WEB DEVELOPER', 'FRONTEND DEVELOPER', 'UI DESIGNER'];
        var index = 0;
        var char = 0;
        var deleting = false;
        var timer = null;

        /* mobile keeps one static role — no typing / no backspace */
        var mqMobile = window.matchMedia('(max-width: 767px)');
        if (mqMobile.addEventListener) {
            mqMobile.addEventListener('change', boot);
        } else if (mqMobile.addListener) {
            mqMobile.addListener(boot);
        }
        boot();

        function boot() {
            if (timer) { clearTimeout(timer); timer = null; }

            if (mqMobile.matches) {
                $el.text(roles[0]);
                return;
            }

            /* desktop: start typing cleanly from scratch */
            $el.text('');
            index = 0;
            char = 0;
            deleting = false;

            onLoaderDone(function () {
                if (!mqMobile.matches) {
                    timer = setTimeout(tick, 400);
                }
            });
        }

        function tick() {
            var word = roles[index];

            if (deleting) {
                char--;
                $el.text(word.substring(0, char));
                if (char <= 0) {
                    deleting = false;
                    index = (index + 1) % roles.length;
                }
            } else {
                char++;
                $el.text(word.substring(0, char));
                if (char >= word.length) {
                    deleting = true;
                }
            }

            /* wait after a word is fully typed, before backspacing */
            var speed = 100;
            if (char === word.length) {
                speed = 2000;              /* hold the full word for 2s */
            } else if (deleting) {
                speed = 2000 / word.length; /* backspace whole word in 2s */
            }

            timer = setTimeout(tick, speed);
        }
    }

    /* =========================================================
       15. CTA TILT — subtle 3D tilt on the hire-me box
       ========================================================= */
    function initCtaTilt() {
        var $box = $('.cta-box');
        if (!IS_FINE_POINTER || REDUCED || !$box.length) return;

        $box.on('mousemove', function (e) {
            var r = this.getBoundingClientRect();
            var rx = (e.clientX - r.left) / r.width - 0.5;
            var ry = (e.clientY - r.top) / r.height - 0.5;
            this.style.transform = 'perspective(900px) rotateX(' + (-ry * 5).toFixed(2) +
                'deg) rotateY(' + (rx * 5).toFixed(2) + 'deg)';
        });

        $box.on('mouseleave', function () {
            this.style.transform = '';
        });
    }

    /* =========================================================
       SMOOTH SCROLL for all anchor links (jQuery)
       ========================================================= */
    function initSmoothScroll() {
        if (REDUCED) return;

        $('a[href^="#"]').on('click', function (e) {
            var href = $(this).attr('href');
            if (href.length <= 1) return;

            var $target = $(href);
            if (!$target.length) return;

            e.preventDefault();
            var offset = $target.offset().top - 70;

            $('html, body').animate({ scrollTop: offset }, 700, 'swing');
        });
    }

    /* =========================================================
       CV DOWNLOAD — force direct download, never open in browser
       ========================================================= */
    function initCvDownload() {
        $('a[download][href$=".pdf"]').on('click', function (e) {
            var href = $(this).attr('href');
            var fileName = $(this).attr('download') || 'Soban-Ahmad-CV.pdf';
            if (!href) return;

            e.preventDefault();

            /* native fallback: re-trigger an anchor with the download attr */
            function nativeDownload() {
                var a = document.createElement('a');
                a.href = href;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            /* fetch as blob so the browser always saves it instead of opening */
            fetch(href)
                .then(function (res) { return res.blob(); })
                .then(function (blob) {
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
                })
                .catch(nativeDownload);
        });
    }

    /* =========================================================
       INIT
       ========================================================= */
    $(function () {
        initLoader();
        initCursor();
        initNavbar();
        initHeroName();
        initHeroTilt();
        initReveal();
        initProjects();
        initSkills();
        initCounters();
        initContactForm();
        initBackToTop();
        initScrollProgress();
        initTypewriter();
        initCtaTilt();
        initSmoothScroll();
        initCvDownload();
    });

})(jQuery);
