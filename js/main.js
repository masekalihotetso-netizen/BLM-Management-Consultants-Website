document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('#year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('#siteNav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  const form = document.querySelector('#contactForm');
  const status = document.querySelector('#formStatus');

  if (form && status) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      status.className = 'form-status';
      status.textContent = 'Sending your enquiry...';

      const data = Object.fromEntries(
        new FormData(form).entries()
      );

      try {
        const response = await fetch(
          'https://us-central1-blm-management-consultants.cloudfunctions.net/api/contact',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || 'Unable to send your enquiry.'
          );
        }

        status.className = 'form-status success';
        status.textContent =
          'Thank you. Your enquiry has been received. BLM Management Consultants will contact you shortly.';

        form.reset();

      } catch (error) {
        status.className = 'form-status error';

        console.error(
          'Contact form submission failed:',
          error
        );

        status.textContent =
          error.message ||
          'The enquiry could not be sent. Please try again later.';
      }
    });
  }
});