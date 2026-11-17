(() => {
  const track = document.querySelector('.strip-track');
  const pauseButton = document.querySelector('.strip-controls button');
  const dialog = document.getElementById('photo-dialog');
  let paused = false;
  let previousFocus;

  function updateRibbon() {
    track.classList.toggle('is-paused', paused || dialog.open);
    pauseButton.textContent = paused ? 'Reanudar fotografías' : 'Pausar fotografías';
    pauseButton.setAttribute('aria-pressed', String(paused));
  }
  pauseButton.addEventListener('click', () => {
    paused = !paused;
    updateRibbon();
  });
  document.querySelectorAll('.strip-item, .experience-cover, .experience-photos button').forEach(button => {
    button.addEventListener('click', () => {
      const photo = button.querySelector('img');
      previousFocus = button;
      dialog.querySelector('img').src = photo.src;
      dialog.querySelector('img').alt = photo.alt || 'Interior de ONRITUAL';
      dialog.showModal();
      updateRibbon();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    updateRibbon();
    previousFocus?.focus({ preventScroll: true });
  });

  const audio = document.querySelector('.ambient-player audio');
  const player = document.querySelector('.ambient-player');
  const audioButton = player.querySelector('button');
  const volume = player.querySelector('input');
  const originalIcon = audioButton.innerHTML;
  audio.volume = Number(volume.value) / 100;
  const audioStatus = document.createElement('p');
  audioStatus.setAttribute('role', 'status');
  audioStatus.hidden = true;
  player.append(audioStatus);
  function updateAudio() {
    const playing = !audio.paused;
    player.classList.toggle('is-playing', playing);
    audioButton.setAttribute('aria-pressed', String(playing));
    const label = playing ? 'Pausar música ambiental' : 'Activar música ambiental';
    audioButton.setAttribute('aria-label', label);
    audioButton.title = label;
    audioButton.innerHTML = playing ? '<span aria-hidden="true">Ⅱ</span>' : originalIcon;
  }
  audioButton.addEventListener('click', async () => {
    audioStatus.hidden = true;
    if (!audio.paused) { audio.pause(); return; }
    audioButton.disabled = true;
    try { await audio.play(); }
    catch {
      audioStatus.textContent = 'No se pudo reproducir la música. Vuelve a intentarlo.';
      audioStatus.hidden = false;
    } finally { audioButton.disabled = false; }
  });
  audio.addEventListener('play', updateAudio);
  audio.addEventListener('pause', updateAudio);
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
    volume.setAttribute('aria-valuetext', `${volume.value} %`);
  });

  const form = document.getElementById('booking-form');
  const date = form.elements.namedItem('date');
  const status = form.querySelector('[role="status"]');
  date.min = new Date().toLocaleDateString('en-CA', { timeZone: 'Atlantic/Canary' });
  function prepareReservation(channel) {
    date.setCustomValidity(date.value && date.value < date.min ? 'Selecciona una fecha futura.' : '');
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const message = `Solicitud de reserva ONRITUAL\n\nNombre: ${data.get('name')}\nCorreo: ${data.get('email')}\nTratamiento: ${data.get('service')}\nFecha preferida: ${data.get('date')}\n\nPor favor, confirmad disponibilidad, duración y precio.`;
    const url = channel === 'email'
      ? `mailto:c.jonasramirez@gmail.com?subject=${encodeURIComponent('Solicitud de reserva ONRITUAL')}&body=${encodeURIComponent(message)}`
      : `https://wa.me/34640064617?text=${encodeURIComponent(message)}`;
    status.textContent = 'Solicitud preparada. Completa el envío en la aplicación que se abre. Si no se abre el correo, puedes usar WhatsApp.';
    if (channel === 'email') window.location.href = url;
    else window.open(url, '_blank', 'noopener,noreferrer');
  }
  form.addEventListener('submit', event => { event.preventDefault(); prepareReservation('email'); });
  document.getElementById('reserve-whatsapp').addEventListener('click', () => prepareReservation('whatsapp'));
  date.addEventListener('input', () => date.setCustomValidity(''));

  const progress = document.querySelector('.scroll-progress');
  let pendingFrame = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    pendingFrame = false;
  }
  window.addEventListener('scroll', () => {
    if (!pendingFrame) { pendingFrame = true; requestAnimationFrame(updateProgress); }
  }, { passive: true });
  updateProgress();

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('.reveal, .experience-feature, .experience-more, .instagram-invitation > *, .services article, .visit-steps li');
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.08 });
    targets.forEach(target => { target.classList.add('reveal'); observer.observe(target); });
    document.documentElement.classList.add('reveal-ready');
  }
})();
