// Solar Energy Simulation Logic - Multi-page Support
document.addEventListener('DOMContentLoaded', function() {
    // Check if on solar.html page
    if (document.body.classList.contains('solar-page')) {
        initSolarSimulation();
    } else {
        // Landing page (index.html) interactions
        const landingSun = document.getElementById('landing-sun');
        const welcomePanel = document.querySelector('.welcome-text');

        if (landingSun) {
            landingSun.addEventListener('click', function() {
                document.body.classList.add('sun-transition');
                setTimeout(function() {
                    window.location.href = 'solar.html';
                }, 280);
            });
        }

        // Subtle parallax for hero polish.
        window.addEventListener('mousemove', function(event) {
            if (!welcomePanel) {
                return;
            }

            const xRatio = (event.clientX / window.innerWidth - 0.5) * 8;
            const yRatio = (event.clientY / window.innerHeight - 0.5) * 8;
            welcomePanel.style.transform = 'translate(calc(-50% + ' + xRatio + 'px), calc(-50% + ' + yRatio + 'px))';
        });

        window.addEventListener('mouseleave', function() {
            if (welcomePanel) {
                welcomePanel.style.transform = 'translate(-50%, -50%)';
            }
        });

        // Modal for index.html
        const modalBtn = document.querySelector('.learn-btn:not(.sim-link)');
        const modal = document.getElementById('modal');
        const closeBtn = document.querySelector('.close');
        if (modalBtn && modal && closeBtn) {
            modalBtn.addEventListener('click', () => modal.style.display = 'block');
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    }
});

function initSolarSimulation() {
    // Binary sun/moon mode
    let isSunMode = true;
    const FULL_ENERGY = 88;
    let displayedEnergy = 0;
    let animationFrameId = null;

    // Elements
    const toggleBtn = document.getElementById('sun-moon-toggle');
    const solarPanel = document.getElementById('solar-panel');
    const panelRig = document.getElementById('panel-rig');
    const panelShine = document.getElementById('panel-shine');
    const wiringGlow = document.getElementById('wire-glow');
    const filament = document.getElementById('filament');
    const bulb = document.getElementById('bulb');
    const bulbGlow = document.getElementById('bulb-glow');
    const modePill = document.getElementById('state-mode');
    const flowPill = document.getElementById('state-flow');
    const workingBtn = document.getElementById('working-btn');
    const workingPanel = document.getElementById('working-panel');

    if (workingBtn && workingPanel) {
        workingBtn.addEventListener('click', function() {
            const isOpen = !workingPanel.hasAttribute('hidden');
            if (isOpen) {
                workingPanel.setAttribute('hidden', '');
                workingBtn.setAttribute('aria-expanded', 'false');
            } else {
                workingPanel.removeAttribute('hidden');
                workingBtn.setAttribute('aria-expanded', 'true');
            }
        });

        document.addEventListener('click', function(event) {
            if (!workingPanel.hasAttribute('hidden') && !event.target.closest('#working-help-wrap')) {
                workingPanel.setAttribute('hidden', '');
                workingBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Toggle sun/moon
    toggleBtn.addEventListener('click', function() {
        isSunMode = !isSunMode;
        toggleBtn.classList.toggle('is-moon', !isSunMode);
        toggleBtn.setAttribute('data-hint', isSunMode ? 'Click for Moon' : 'Click for Sun');
        toggleBtn.setAttribute('aria-label', isSunMode ? 'Switch to Moon mode' : 'Switch to Sun mode');

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }

        animationFrameId = requestAnimationFrame(updateCircuit);
    });

    function updateCircuit() {
        const targetEnergy = isSunMode ? FULL_ENERGY : 0;
        displayedEnergy += (targetEnergy - displayedEnergy) * 0.08;

        if (Math.abs(displayedEnergy - targetEnergy) < 0.3) {
            displayedEnergy = targetEnergy;
        }

        const energy = Math.round(displayedEnergy);

        if (modePill && flowPill) {
            modePill.textContent = isSunMode ? 'Mode: Sunlight' : 'Mode: Moon';
            flowPill.textContent = energy > 0 ? 'Current: Active' : 'Current: Idle';
        }

        // Sun mode visuals: panel shines, wiring glows, bulb lights
        const energyRatio = energy / 100;

        solarPanel.style.boxShadow = energy > 0
            ? '0 26px 52px rgba(255, 177, 74, 0.45), 0 0 34px rgba(111, 231, 255, 0.34)'
            : '0 24px 34px rgba(1, 11, 21, 0.45)';
        solarPanel.style.transform = 'perspective(900px) rotateX(' + String(8 - energyRatio * 3.2) + 'deg) rotateY(' + String(-14 + energyRatio * 7.5) + 'deg) translateY(' + String(18 - energyRatio * 8) + 'px)';
        if (panelRig) {
            panelRig.style.transform = 'translateY(' + String(-energyRatio * 1.5) + 'px)';
        }
        panelShine.style.opacity = String(energy / 100);
        panelShine.style.transform = 'translateX(' + String(-35 + energy * 0.52) + '%) skewX(' + String(5 + energyRatio * 7) + 'deg)';
        wiringGlow.style.opacity = String(energy / 120);
        wiringGlow.style.setProperty('--flow-speed', String(1.65 - energyRatio * 0.72) + 's');
        wiringGlow.style.setProperty('--spark-speed', String(1.92 - energyRatio * 0.82) + 's');
        wiringGlow.style.filter = 'brightness(' + String(0.82 + energyRatio * 0.35) + ')';
        filament.style.borderColor = energy > 0 ? '#ffb347' : '#76695d';
        filament.style.filter = energy > 0 ? 'drop-shadow(0 0 9px rgba(255, 194, 104, 0.95))' : 'none';
        bulbGlow.style.opacity = String(energy / 100);
        bulbGlow.style.transform = 'translateX(-50%) scale(' + String(0.94 + energyRatio * 0.11) + ')';
        bulbGlow.style.boxShadow = energy > 0
            ? '0 0 84px rgba(255, 245, 166, 0.95), 0 0 138px rgba(255, 165, 92, 0.5)'
            : 'none';
        if (bulb) {
            bulb.classList.toggle('is-active', energy > 0);
        }

        if (energy !== targetEnergy) {
            animationFrameId = requestAnimationFrame(updateCircuit);
        } else {
            animationFrameId = null;
        }
    }

    toggleBtn.classList.toggle('is-moon', !isSunMode);
    toggleBtn.setAttribute('data-hint', isSunMode ? 'Click for Moon' : 'Click for Sun');
    toggleBtn.setAttribute('aria-label', isSunMode ? 'Switch to Moon mode' : 'Switch to Sun mode');

    // Initial update
    animationFrameId = requestAnimationFrame(updateCircuit);
}
