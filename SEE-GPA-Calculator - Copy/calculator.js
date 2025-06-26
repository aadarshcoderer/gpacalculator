// choose.js

document.addEventListener('DOMContentLoaded', () => {
  const radios = document.querySelectorAll('input[name="stream"]');
  const startBtn = document.getElementById('start-btn');

  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      startBtn.disabled = false;
    });
  });

  startBtn.addEventListener('click', () => {
    const selected = document.querySelector('input[name="stream"]:checked');
    if (selected) {
      window.location.href = selected.value;
    }
  });
});
