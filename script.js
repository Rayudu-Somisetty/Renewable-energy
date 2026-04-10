// Solar Energy Simulation Logic - Multi-page Support
document.addEventListener('DOMContentLoaded', function() {
    // Check if on solar.html page
    if (document.body.classList.contains('solar-page')) {
        initSolarSimulation();
    } else if (document.body.classList.contains('wind-page')) {
        initWindSimulation();
    } else {
        // Landing page (index.html) interactions
        const landingSun = document.getElementById('landing-sun');
        const landingWindmill = document.getElementById('landing-windmill');
        const welcomePanel = document.querySelector('.welcome-text');

        if (landingSun) {
            landingSun.addEventListener('click', function() {
                document.body.classList.add('sun-transition');
                setTimeout(function() {
                    window.location.href = 'solar.html';
                }, 280);
            });
        }

        if (landingWindmill) {
            landingWindmill.addEventListener('click', function() {
                document.body.classList.add('sun-transition');
                setTimeout(function() {
                    window.location.href = 'wind.html';
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
    const panelPopup = document.getElementById('solar-panel-popup');
    const panelPopupClose = document.getElementById('panel-popup-close');
    const wiringGlow = document.getElementById('wire-glow');
    const filament = document.getElementById('filament');
    const bulb = document.getElementById('bulb');
    const bulbGlow = document.getElementById('bulb-glow');
    const modePill = document.getElementById('state-mode');
    const flowPill = document.getElementById('state-flow');
    const workingBtn = document.getElementById('working-btn');
    const workingPanel = document.getElementById('working-panel');
    let isPanelPopupPinned = false;
    let panelPopupHideTimer = null;

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

    function showPanelPopup(pin) {
        if (!panelPopup) {
            return;
        }

        if (panelPopupHideTimer) {
            window.clearTimeout(panelPopupHideTimer);
            panelPopupHideTimer = null;
        }

        if (pin) {
            isPanelPopupPinned = true;
        }

        panelPopup.hidden = false;
        panelPopup.classList.add('is-visible');
    }

    function hidePanelPopup(force) {
        if (!panelPopup) {
            return;
        }

        if (force) {
            isPanelPopupPinned = false;
        }

        if (isPanelPopupPinned && !force) {
            return;
        }

        panelPopup.classList.remove('is-visible');
        panelPopupHideTimer = window.setTimeout(function() {
            panelPopup.hidden = true;
        }, 180);
    }

    if (solarPanel && panelPopup) {
        solarPanel.addEventListener('mouseenter', function() {
            showPanelPopup(false);
        });

        solarPanel.addEventListener('focusin', function() {
            showPanelPopup(false);
        });

        solarPanel.addEventListener('mouseleave', function() {
            hidePanelPopup(false);
        });

        solarPanel.addEventListener('click', function(event) {
            event.stopPropagation();
            isPanelPopupPinned = !isPanelPopupPinned;
            if (isPanelPopupPinned) {
                showPanelPopup(true);
            } else {
                hidePanelPopup(true);
            }
        });

        solarPanel.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                solarPanel.click();
            }
        });
    }

    if (panelPopup) {
        panelPopup.addEventListener('mouseenter', function() {
            showPanelPopup(false);
        });

        panelPopup.addEventListener('mouseleave', function() {
            hidePanelPopup(false);
        });
    }

    if (panelPopupClose) {
        panelPopupClose.addEventListener('click', function(event) {
            event.stopPropagation();
            hidePanelPopup(true);
        });
    }

    document.addEventListener('click', function(event) {
        if (panelPopup && !panelPopup.hidden && !event.target.closest('#solar-panel-popup') && !event.target.closest('#solar-panel')) {
            hidePanelPopup(true);
        }
    });

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

function initWindSimulation() {
    const CUT_IN_SPEED = 14;
    const MAX_SPEED = 80;
    const MAX_FLOW = 92;
    const MIN_ACTIVE_FLOW = 42;
    const MIN_ACTIVE_RPM = 7;
    const MAX_ACTIVE_RPM = 52;
    let currentRpm = 0;
    let targetRpm = 0;
    let rotorAngle = 0;
    let lastFrameTime = 0;
    let rotorFrameId = null;

    const speedSlider = document.getElementById('wind-speed');
    const turbine = document.getElementById('wind-turbine');
    const windRotor = document.getElementById('wind-rotor');
    const speedPill = document.getElementById('wind-speed-pill');
    const statePill = document.getElementById('wind-state-pill');
    const flowPill = document.getElementById('wind-flow-pill');
    const wireGlow = document.getElementById('wind-wire-glow');
    const windBulb = document.getElementById('wind-bulb');
    const windFilament = document.getElementById('wind-filament');
    const windBulbGlow = document.getElementById('wind-bulb-glow');
    const workingBtn = document.getElementById('wind-working-btn');
    const workingPanel = document.getElementById('wind-working-panel');
    const windPartsPopup = document.getElementById('wind-parts-popup');
    const windPartsClose = document.getElementById('wind-parts-close');
    let isWindPopupPinned = false;
    let windPopupHideTimer = null;

    if (!speedSlider || !turbine || !windRotor || !wireGlow || !windBulb || !windFilament || !windBulbGlow) {
        return;
    }

    function getTargetRpm(windSpeed) {
        if (windSpeed < CUT_IN_SPEED) {
            return 0;
        }

        const normalizedSpeed = (windSpeed - CUT_IN_SPEED) / (MAX_SPEED - CUT_IN_SPEED);
        return MIN_ACTIVE_RPM + Math.max(0, normalizedSpeed) * (MAX_ACTIVE_RPM - MIN_ACTIVE_RPM);
    }

    function animateRotor(timestamp) {
        if (!lastFrameTime) {
            lastFrameTime = timestamp;
        }

        const deltaTime = timestamp - lastFrameTime;
        lastFrameTime = timestamp;
        const response = targetRpm > currentRpm ? 0.08 : 0.02;

        currentRpm += (targetRpm - currentRpm) * response;
        if (targetRpm === 0 && currentRpm < 0.03) {
            currentRpm = 0;
        }

        rotorAngle = (rotorAngle + currentRpm * 0.006 * deltaTime) % 360;
        windRotor.style.transform = 'rotate(' + String(rotorAngle.toFixed(2)) + 'deg)';

        if (currentRpm > 0 || targetRpm > 0) {
            rotorFrameId = requestAnimationFrame(animateRotor);
        } else {
            rotorFrameId = null;
            lastFrameTime = 0;
        }
    }

    function ensureRotorAnimation() {
        if (!rotorFrameId) {
            rotorFrameId = requestAnimationFrame(animateRotor);
        }
    }

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
            if (!workingPanel.hasAttribute('hidden') && !event.target.closest('#wind-working-wrap')) {
                workingPanel.setAttribute('hidden', '');
                workingBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    function showWindPartsPopup(pin) {
        if (!windPartsPopup) {
            return;
        }

        if (windPopupHideTimer) {
            window.clearTimeout(windPopupHideTimer);
            windPopupHideTimer = null;
        }

        if (pin) {
            isWindPopupPinned = true;
        }

        windPartsPopup.hidden = false;
        windPartsPopup.classList.add('is-visible');
    }

    function hideWindPartsPopup(force) {
        if (!windPartsPopup) {
            return;
        }

        if (force) {
            isWindPopupPinned = false;
        }

        if (isWindPopupPinned && !force) {
            return;
        }

        windPartsPopup.classList.remove('is-visible');
        windPopupHideTimer = window.setTimeout(function() {
            windPartsPopup.hidden = true;
        }, 180);
    }

    if (windPartsPopup) {
        turbine.addEventListener('mouseenter', function() {
            showWindPartsPopup(false);
        });

        turbine.addEventListener('focusin', function() {
            showWindPartsPopup(false);
        });

        turbine.addEventListener('mouseleave', function() {
            hideWindPartsPopup(false);
        });

        turbine.addEventListener('click', function(event) {
            event.stopPropagation();
            isWindPopupPinned = !isWindPopupPinned;
            if (isWindPopupPinned) {
                showWindPartsPopup(true);
            } else {
                hideWindPartsPopup(true);
            }
        });

        turbine.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                turbine.click();
            }
        });

        windPartsPopup.addEventListener('mouseenter', function() {
            showWindPartsPopup(false);
        });

        windPartsPopup.addEventListener('mouseleave', function() {
            hideWindPartsPopup(false);
        });
    }

    if (windPartsClose) {
        windPartsClose.addEventListener('click', function(event) {
            event.stopPropagation();
            hideWindPartsPopup(true);
        });
    }

    document.addEventListener('click', function(event) {
        if (windPartsPopup && !windPartsPopup.hidden && !event.target.closest('#wind-parts-popup') && !event.target.closest('#wind-turbine')) {
            hideWindPartsPopup(true);
        }
    });

    speedSlider.addEventListener('input', updateWindCircuit);

    function updateWindCircuit() {
        const windSpeed = Number(speedSlider.value);
        const hasThresholdSpeed = windSpeed >= CUT_IN_SPEED;
        const canGenerate = hasThresholdSpeed;
        targetRpm = getTargetRpm(windSpeed);

        if (targetRpm > 0 || currentRpm > 0) {
            ensureRotorAnimation();
        }

        let flow = 0;
        if (canGenerate) {
            const normalized = (windSpeed - CUT_IN_SPEED) / (MAX_SPEED - CUT_IN_SPEED);
            const clamped = Math.min(1, Math.max(0, normalized));
            flow = Math.round(MIN_ACTIVE_FLOW + clamped * (MAX_FLOW - MIN_ACTIVE_FLOW));
        }
        turbine.classList.toggle('has-threshold', hasThresholdSpeed);
        turbine.classList.add('is-running');
        turbine.classList.toggle('is-generating', canGenerate);

        const flowRatio = flow / 100;
        wireGlow.style.opacity = String(flow / 120);
        wireGlow.style.setProperty('--flow-speed', String(1.8 - flowRatio * 0.8) + 's');
        wireGlow.style.setProperty('--spark-speed', String(1.9 - flowRatio * 0.9) + 's');

        windFilament.style.borderColor = flow > 0 ? '#ffb347' : '#76695d';
        windFilament.style.filter = flow > 0 ? 'drop-shadow(0 0 9px rgba(255, 194, 104, 0.95))' : 'none';

        windBulbGlow.style.opacity = String(flow / 100);
        windBulbGlow.style.transform = 'translateX(-50%) scale(' + String(0.93 + flowRatio * 0.13) + ')';
        windBulbGlow.style.boxShadow = flow > 0
            ? '0 0 84px rgba(255, 245, 166, 0.95), 0 0 138px rgba(255, 165, 92, 0.5)'
            : 'none';
        windBulb.classList.toggle('is-active', flow > 0);

        if (speedPill) {
            speedPill.textContent = 'Wind Speed: ' + String(windSpeed) + ' km/h';
        }

        if (statePill) {
            if (!hasThresholdSpeed) {
                statePill.textContent = 'Turbine: Running, Low Wind';
            } else {
                statePill.textContent = 'Turbine: Running';
            }
        }

        if (flowPill) {
            flowPill.textContent = flow > 0 ? 'Current: Active' : 'Current: Idle';
        }
    }

    updateWindCircuit();
}
