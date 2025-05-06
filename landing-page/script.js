// Typewriter effect
// function typeWriter(element, text, speed = 100) {
//     let i = 0;
//     element.innerHTML = '';

//     function type() {
//         if (i < text.length) {
//             element.innerHTML += text.charAt(i);
//             i++;
//             setTimeout(type, speed);
//         }
//     }

//     type();
// }

// Initialize typewriter effect
// document.addEventListener('DOMContentLoaded', () => {
//     const typewriterElement = document.querySelector('.typewriter');
//     if (typewriterElement) {
//         typeWriter(typewriterElement, 'Welcome to SciCommons');
//     }
// });

// FAQ Toggle
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const question = item.querySelector('.faq-question');

    question.addEventListener('click', () => {
      // Close all other items
      faqItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      // Toggle current item
      item.classList.toggle('active');
    });
  });
});
