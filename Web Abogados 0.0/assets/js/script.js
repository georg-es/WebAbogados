const modales = document.querySelectorAll('.about-item');
const modal = document.querySelector('.modal');
const modalContent = modal.querySelector('.modal-body');
const closeButton = modal.querySelector('.close');

modales.forEach(item => {
  item.addEventListener('click', () => {
    const title = item.querySelector('h3').innerHTML;
    const content = item.querySelector('p').innerHTML;
    const hiddenContent = item.querySelector('.hidden-content').innerHTML;

    modalContent.innerHTML = `
      <h3>${title}</h3>
      <p>${content}</p>
      <div class="hidden-content">${hiddenContent}</div>
    `;
    modal.classList.add('active');
  });
});

closeButton.addEventListener('click', () => {
  modal.classList.remove('active');
});

window.addEventListener('click', (event) => {
  if (event.target == modal) {
    modal.classList.remove('active');
  }
});
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("toggle-dark");
  toggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
  });
});
