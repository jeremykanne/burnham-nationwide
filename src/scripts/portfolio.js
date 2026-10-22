// Portfolio sector filter. Without JS every project stays visible and the filter stays hidden.
document.addEventListener('DOMContentLoaded', () => {
  const filter = document.querySelector('[data-portfolio-filter]');
  const items = Array.from(document.querySelectorAll('.portfolio-grid > li'));
  if (!filter || !items.length) return;
  const buttons = Array.from(filter.querySelectorAll('[data-filter]'));
  const status = filter.querySelector('[data-filter-status]');
  filter.hidden = false;

  const apply = (key) => {
    let shown = 0;
    items.forEach((li) => {
      const match = key === 'all' || li.dataset.sectors.split(' ').includes(key);
      li.hidden = !match;
      if (match) shown += 1;
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === key)));
    status.textContent = `Showing ${shown} of ${items.length} projects`;
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter)));
  apply('all');
});
