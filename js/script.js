const demoPaths = {
  pixiandestroy: 'demos/pixiandestroy/index.html',
  bam: 'demos/bam/index.html',
  campus: 'demos/campus/index.html',
  rails: 'demos/rails/index.html'
};

const tabs = document.querySelectorAll('.demo-tab');
const frame = document.getElementById('demo-frame');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    const key = tab.dataset.demo;
    if (demoPaths[key]) {
      frame.src = demoPaths[key];
    }
  });
});
