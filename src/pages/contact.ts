/**
 * ═══════════════════════════════════════════════════════════
 *  Contact — Contact form and information
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';

export const ContactPage = defineComponent('ContactPage', () => {
  const name = createSignal('');
  const email = createSignal('');
  const subject = createSignal('');
  const message = createSignal('');
  const sending = createSignal(false);

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!name() || !email() || !message()) {
      showToast('warning', 'Please fill in all required fields');
      return;
    }
    sending.set(true);
    setTimeout(() => {
      showToast('success', 'Message sent successfully! We\'ll get back to you soon.');
      name.set(''); email.set(''); subject.set(''); message.set('');
      sending.set(false);
    }, 1500);
  };

  return h('div', { class: 'contact-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'CONTACT US'),
        h('p', null, 'We\'d love to hear from you. Reach out with any questions, suggestions, or donation inquiries.'),
      ),

      h('div', { class: 'contact-grid' },
        // Info
        h('div', { class: 'contact-info-list' },
          h('h3', {
            style: 'font-family:var(--font-display); font-size:18px; font-weight:700; color:var(--text-primary); letter-spacing:1px; margin-bottom:16px;',
          }, 'GET IN TOUCH'),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '📍'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Address'),
              h('div', { class: 'contact-info-text' }, '3633+2W4, Richmond Hill Rd, Galle 80000, Sri Lanka'),
            ),
          ),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '📞'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Phone'),
              h('div', { class: 'contact-info-text' }, '+94 77 123 4567'),
            ),
          ),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '✉️'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Email'),
              h('div', { class: 'contact-info-text' }, 'info@richmondhopehub.lk'),
            ),
          ),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '🕐'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Office Hours'),
              h('div', { class: 'contact-info-text' }, 'Monday – Friday: 8:00 AM – 5:00 PM\nSaturday: 9:00 AM – 1:00 PM'),
            ),
          ),
        ),

        // Form
        h('form', { class: 'contact-form', onSubmit: handleSubmit },
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Full Name *'),
            h('input', {
              type: 'text',
              class: 'form-input',
              placeholder: 'Enter your name',
              value: name(),
              onInput: (e: Event) => name.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Email *'),
            h('input', {
              type: 'email',
              class: 'form-input',
              placeholder: 'your@email.com',
              value: email(),
              onInput: (e: Event) => email.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Subject'),
            h('input', {
              type: 'text',
              class: 'form-input',
              placeholder: 'What is this regarding?',
              value: subject(),
              onInput: (e: Event) => subject.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Message *'),
            h('textarea', {
              class: 'form-input form-textarea',
              placeholder: 'Type your message here...',
              value: message(),
              onInput: (e: Event) => message.set((e.target as HTMLTextAreaElement).value),
              style: 'min-height:120px; resize:vertical;',
            }),
          ),
          h('button', {
            type: 'submit',
            class: 'btn btn-primary btn-lg',
            disabled: sending(),
          }, sending() ? 'Sending...' : 'Send Message'),
        ),
      ),
    ),

    // Footer
    h('footer', { class: 'site-footer' },
      h('div', { class: 'footer-inner' },
        h('div', { class: 'footer-brand' },
          h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'footer-logo-img' }),
          h('div', { class: 'footer-phone' }, 'Phone: +94 77 123 4567'),
          h('div', { class: 'footer-location' }, '3633+2W4, Richmond Hill Rd, Galle 80000'),
        ),
        h('div', { class: 'footer-links' },
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Quick Links'),
            h('a', { href: '/' }, 'Home'),
            h('a', { href: '/about' }, 'About'),
            h('a', { href: '/contact' }, 'Contact'),
          ),
          h('div', { class: 'footer-link-group' },
            h('h4', null, 'Support'),
            h('a', { href: '/donation-request' }, 'Donate Now'),
            h('a', { href: '/notices' }, 'Notices'),
            h('a', { href: '/events' }, 'Events'),
          ),
        ),
        h('div', { class: 'footer-social' },
          h('a', { href: '#', title: 'Facebook' }, '📘'),
          h('a', { href: '#', title: 'Instagram' }, '📷'),
          h('a', { href: '#', title: 'YouTube' }, '🎬'),
          h('a', { href: '#', title: 'LinkedIn' }, '💼'),
        ),
      ),
      h('div', { class: 'footer-bottom' },
        h('span', null, '© 2025 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );
});
