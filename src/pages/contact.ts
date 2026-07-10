/**
 * ═══════════════════════════════════════════════════════════
 *  Contact — Contact form and information
 * ═══════════════════════════════════════════════════════════
 */

import { h, defineComponent } from '../vortex/component';
import { createSignal } from '../vortex/signals';
import { showToast } from '../services/toast';
import { getSupabase } from '../lib/supabase';

export const ContactPage = defineComponent('ContactPage', () => {
  const name = createSignal('');
  const email = createSignal('');
  const subject = createSignal('');
  const message = createSignal('');
  const sending = createSignal(false);

  // Auto-fill based on where the user came from
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref') || '';

  const refMap: Record<string, { subject: string; message: string }> = {
    'c2-society': {
      subject: 'Inquiry about C2 Society',
      message: 'Hello, I am interested in learning more about C2 Society and how I can get involved in leadership, debate, and civic engagement programs.',
    },
    'education-resources': {
      subject: 'Education Resources Inquiry',
      message: 'Hello, I would like to know more about the education resources available, including textbooks, digital learning, and scholarship opportunities.',
    },
    'counseling': {
      subject: 'Counseling & Referral Services',
      message: 'Hello, I would like to inquire about counseling and referral services available for students.',
    },
    'career-guidance': {
      subject: 'Career Guidance Inquiry',
      message: 'Hello, I am interested in career guidance programs, internship connections, and alumni mentorship opportunities.',
    },
    'donation': {
      subject: 'Donation Inquiry',
      message: 'Hello, I would like to make a donation or learn more about how I can support Richmond students.',
    },
    'event': {
      subject: 'Event Inquiry',
      message: 'Hello, I would like to know more about upcoming events at Richmond Hope Hub.',
    },
  };

  if (ref && refMap[ref]) {
    subject.set(refMap[ref].subject);
    message.set(refMap[ref].message);
  }

  const handleSubmit = async () => {
    if (!name() || !email() || !message()) {
      showToast('warning', 'Missing Fields', 'Please fill in all required fields');
      return;
    }
    sending.set(true);
    showToast('info', 'Sending...', 'Your message is being sent');

    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: name(),
          email: email(),
          subject: subject(),
          message: message(),
        },
      });

      if (error) throw error;

      showToast('success', 'Message Sent!', 'Your message has been sent to richmondc2society@gmail.com');
      name.set(''); email.set(''); subject.set(''); message.set('');
    } catch (err: any) {
      console.error('Contact form error:', err);
      showToast('error', 'Failed to Send', err.message || 'Could not send message. Please try again.');
    } finally {
      sending.set(false);
    }
  };

  return h('div', { class: 'contact-page' },
    h('section', { class: 'content-section', style: 'padding-top:80px;' },
      h('div', { class: 'section-header reveal' },
        h('h1', {
          style: 'font-family:var(--font-display); font-size:36px; font-weight:900; color:var(--text-primary); letter-spacing:3px;',
        }, 'CONTACT US'),
        h('p', null, 'We\'d love to hear from you. Reach out with any questions, suggestions, or donation inquiries.'),
      ),

      h('div', { class: 'contact-grid' },
        // Info
        h('div', { class: 'contact-info-list reveal-left' },
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
              h('div', { class: 'contact-info-label' }, 'Miss Udari Perusingha'),
              h('a', { href: 'tel:+94743871989', class: 'contact-info-text contact-phone-link', style: 'color:var(--primary); text-decoration:none; font-weight:600; transition:color 0.2s;' }, '+94 74 387 1989'),
            ),
          ),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '📞'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Mr. Thilan Lasantha'),
              h('a', { href: 'tel:+94777943085', class: 'contact-info-text contact-phone-link', style: 'color:var(--primary); text-decoration:none; font-weight:600; transition:color 0.2s;' }, '+94 77 794 3085'),
            ),
          ),
          h('div', { class: 'contact-info-item' },
            h('div', { class: 'contact-info-icon' }, '✉️'),
            h('div', null,
              h('div', { class: 'contact-info-label' }, 'Email'),
              h('div', { class: 'contact-info-text' }, 'richmondc2society@gmail.com'),
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
        h('div', { class: 'contact-form reveal-right' },
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Full Name *'),
            h('input', {
              type: 'text',
              class: 'form-input',
              placeholder: 'Enter your name',
              onInput: (e: Event) => name.set((e.target as HTMLInputElement).value),
            }),
          ),
          h('div', { class: 'form-group' },
            h('label', { class: 'form-label' }, 'Email *'),
            h('input', {
              type: 'email',
              class: 'form-input',
              placeholder: 'your@email.com',
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
            class: 'btn btn-primary btn-lg',
            onClick: handleSubmit,
          }, 'Send Message'),
        ),
      ),
    ),

    // Footer
    h('footer', { class: 'site-footer' },
      h('div', { class: 'footer-inner' },
        h('div', { class: 'footer-brand' },
          h('img', { src: '/logo.png', alt: 'Hope Hub', class: 'footer-logo-img' }),
          h('div', { class: 'footer-phone' }, 'Mr. Thilan Lasantha: ', h('a', { href: 'tel:+94777943085', style: 'color:inherit; text-decoration:none;' }, '+94 77 794 3085')),
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
        h('span', null, '© 2026 Richmond Hope Hub — Powered by Auravexon Codex'),
      ),
    ),
  );
});
