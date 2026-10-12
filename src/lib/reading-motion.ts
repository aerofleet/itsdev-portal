// Progressive enhancement: the article is readable without this script.
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
