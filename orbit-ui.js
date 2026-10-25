(() => {
  'use strict';
  const dialog = document.getElementById('project-dialog');
  const title = document.getElementById('project-title');
  const desc = document.getElementById('project-description');
  const category = document.getElementById('project-category');
  const art = document.getElementById('project-art');
  const actions = document.getElementById('project-actions');
  const reader = document.getElementById('project-reader');
  const close = document.getElementById('project-close');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let lastTrigger = null;
  const projects = {
    magazine: {
      title: '个人杂志', category: '01 / MAGAZINE', image: 'planet.png',
      description: '关于时尚、人物、影像与视觉叙事的个人杂志，展示版本共 9 页。',
      frame: 'magazine-hualong-yuan.pdf',
      links: [['新窗口阅读 ↗', 'magazine-hualong-yuan.pdf'], ['下载杂志 PDF ↓', 'magazine-hualong-yuan.pdf', '袁华龙_个人杂志.pdf']]
    },
    guishan: {
      title: '归山录', category: '02 / 游戏策划文字作品', image: 'moon.png',
      description: '家园生活、探索任务与回合制战棋的原创策划案例。记录核心循环、系统方案、UI/UX、MVP 拆解和迭代复盘，并区分已完成成果与后续规划。',
      frame: 'guishan-game-design.html',
      links: [['新窗口阅读 ↗', 'guishan-game-design.html'], ['下载 Word 作品集 ↓', 'guishan-game-design.docx', '归山录_游戏策划实习作品集.docx']]
    },
    aigc: {
      title: 'AIGC 真人类视频', category: '03 / 影像创作', image: 'nebula.png',
      description: '我的 AIGC 真人类视频创作方向。视频样片尚未加入网站，之后会在这里补充播放入口。',
      placeholder: '从想法，到影像。',
      note: '视频样片整理中。需要了解作品或交流创作，可以通过邮箱联系我。',
      links: [['联系袁华龙 ↗', 'mailto:13350898255@163.com']]
    },
    resume: {
      title: '袁华龙的简历', category: '04 / 关于创作者', image: 'star-sun.png',
      description: '编辑与游戏策划实习方向。本科毕业于东伦敦大学 Fashion Studies，曾为阅文集团签约作家，现居成都。',
      frame: 'resume-yuan-hualong.pdf',
      links: [['新窗口查看 ↗', 'resume-yuan-hualong.pdf'], ['下载 PDF 简历 ↓', 'resume-yuan-hualong.pdf', '袁华龙_简历.pdf'], ['下载 Word 简历 ↓', 'resume-yuan-hualong.docx', '袁华龙_简历.docx']]
    }
  };
  function openProject(trigger) {
    const project = projects[trigger.dataset.projectKey];
    if (!project) return;
    lastTrigger = trigger;
    document.querySelectorAll('.orbit-node.active').forEach(el => el.classList.remove('active'));
    trigger.classList.add('active');
    title.textContent = project.title;
    desc.textContent = project.description;
    category.textContent = project.category;
    art.src = project.image;
    art.alt = `${project.title}的星际主题封面`;
    actions.replaceChildren();
    project.links.forEach(([label, href, download]) => {
      const link = document.createElement('a');
      link.textContent = label;
      link.href = href;
      if (download) link.download = download;
      else if (!href.startsWith('mailto:')) { link.target = '_blank'; link.rel = 'noopener'; }
      actions.append(link);
    });
    reader.replaceChildren();
    if (project.frame) {
      const frame = document.createElement('iframe');
      frame.className = 'project-frame';
      frame.title = `${project.title}阅读预览`;
      frame.src = project.frame;
      frame.addEventListener('pointerenter', hideCursor);
      reader.append(frame);
    } else {
      const box = document.createElement('div');
      box.className = 'project-placeholder';
      const heading = document.createElement('strong'); heading.textContent = project.placeholder;
      const note = document.createElement('p'); note.textContent = project.note;
      box.append(heading, note); reader.append(box);
    }
    document.body.classList.add('project-window-open');
    dialog.showModal();
    dialog.querySelector('.project-sheet').scrollTop = 0;
    close.focus({ preventScroll: true });
    if (window.gsap && !reduce.matches) gsap.fromTo('.project-sheet', {y:18, opacity:0}, {y:0, opacity:1, duration:.38, ease:'power3.out', clearProps:'transform,opacity'});
  }
  document.querySelectorAll('[data-project-key]').forEach(trigger => trigger.addEventListener('click', () => openProject(trigger)));
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('project-window-open');
    reader.replaceChildren();
    if (lastTrigger) { lastTrigger.classList.remove('active'); lastTrigger.focus({preventScroll:true}); }
  });

  // Keep one cursor in the document and one inside the native dialog top layer.
  const cursors = [...document.querySelectorAll('.cursor-orb')];
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const root = document.documentElement;
  function hideCursor() {
    cursors.forEach(el => { el.style.opacity = '0'; el.classList.remove('is-hover', 'is-pressed'); });
    root.classList.remove('planet-cursor-on');
  }
  const movers = cursors.map(el => window.gsap && !reduce.matches ? {
    x: gsap.quickTo(el, 'x', {duration:.11, ease:'power3.out'}),
    y: gsap.quickTo(el, 'y', {duration:.11, ease:'power3.out'})
  } : null);
  let cursorVisible = false;
  document.addEventListener('pointermove', event => {
    if (!fine.matches || event.pointerType === 'touch') { cursorVisible = false; hideCursor(); return; }
    const target = event.target;
    if (target.closest('input,textarea,[contenteditable="true"],iframe')) { cursorVisible = false; hideCursor(); return; }
    const interactive = Boolean(target.closest('a,button,[role="button"]'));
    cursors.forEach((el, index) => {
      if (movers[index] && cursorVisible) { movers[index].x(event.clientX); movers[index].y(event.clientY); }
      else if (window.gsap) gsap.set(el, {x:event.clientX, y:event.clientY});
      else el.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      el.style.opacity = '1';
      el.classList.toggle('is-hover', interactive);
    });
    root.classList.add('planet-cursor-on'); cursorVisible = true;
  }, {passive:true});
  document.addEventListener('pointerdown', event => { if(event.pointerType !== 'touch') cursors.forEach(el => el.classList.add('is-pressed')); });
  document.addEventListener('pointerup', () => cursors.forEach(el => el.classList.remove('is-pressed')));
  document.documentElement.addEventListener('pointerleave', () => { cursorVisible = false; hideCursor(); });
  window.addEventListener('blur', () => { cursorVisible = false; hideCursor(); });
  fine.addEventListener('change', () => { cursorVisible = false; hideCursor(); });
})();
