// Progressive enhancement: the article is readable without this script.

// Image lightbox: click a prose image to view it in a modal with zoom.
(() => {
  const imgs = document.querySelectorAll<HTMLImageElement>('.prose img');
  if (!imgs.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'img-lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', '이미지 확대');
  overlay.innerHTML = `<div class="img-lightbox-wrap"><img class="img-lightbox-img" alt=""/><button class="img-lightbox-close" type="button" aria-label="닫기">&times;</button></div>`;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector<HTMLImageElement>('.img-lightbox-img')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.img-lightbox-close')!;
  let scale = 1;
  let prevFocus: HTMLElement | null = null;

  function open(src: string, alt: string) {
    lbImg.src = src;
    lbImg.alt = alt;
    scale = 1;
    lbImg.style.transform = '';
    overlay.classList.add('open');
    prevFocus = document.activeElement as HTMLElement;
    closeBtn.focus();
  }

  function close() {
    overlay.classList.remove('open');
    lbImg.src = '';
    prevFocus?.focus();
  }

  imgs.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => open(img.src, img.alt));
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  overlay.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale = Math.min(5, Math.max(0.5, scale + (e.deltaY < 0 ? 0.25 : -0.25)));
    lbImg.style.transform = `scale(${scale})`;
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === '+' || e.key === '=') { scale = Math.min(5, scale + 0.25); lbImg.style.transform = `scale(${scale})`; }
    if (e.key === '-') { scale = Math.max(0.5, scale - 0.25); lbImg.style.transform = `scale(${scale})`; }
  });
})();
document.querySelectorAll<HTMLElement>('.prose pre').forEach((pre, index) => {
  const code = pre.querySelector('code');
  if (!code || !navigator.clipboard?.writeText) return;
  const tools = document.createElement('div');
  tools.className = 'im-code-tools';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'im-copy im-button';
  button.textContent = '코드 복사';
  button.setAttribute('aria-label', `코드 ${index + 1} 복사`);
  const status = document.createElement('span');
  status.className = 'im-copy-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let timer: ReturnType<typeof setTimeout>;
  let copying = false;
  button.addEventListener('click', async () => {
    if (copying) return;
    copying = true;
    clearTimeout(timer);
    status.textContent = '';
    button.setAttribute('aria-disabled', 'true');
    try {
      await navigator.clipboard.writeText(code.textContent ?? '');
      button.dataset.copied = 'true';
      button.textContent = '복사 완료';
      status.textContent = '코드를 복사했습니다.';
    } catch {
      status.textContent = '복사하지 못했습니다. 코드를 직접 선택해 복사해주세요.';
    } finally {
      copying = false;
      button.removeAttribute('aria-disabled');
      timer = setTimeout(() => {
        button.textContent = '코드 복사';
        delete button.dataset.copied;
        status.textContent = '';
      }, 2500);
    }
  });
  tools.append(status, button);
  pre.before(tools);
});
