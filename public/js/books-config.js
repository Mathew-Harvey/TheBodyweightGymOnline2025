// Book links and settings. This is the only file to edit when the Amazon listings go live.
//
// Paste each Amazon URL exactly as Amazon gives it. While a value is still "TODO_AMAZON_URL"
// its button shows a disabled "Coming soon on Amazon" state (never a dead link).
// Visitors in Australia get the amazon.com.au link when one is set, otherwise the amazon.com link.

const HANDSTAND_KINDLE_URL = 'https://www.amazon.com/dp/B0HMZJD7DX';
const HANDSTAND_PAPERBACK_URL = 'TODO_AMAZON_URL';
const MUSCLEUP_KINDLE_URL = 'https://www.amazon.com/dp/B0HMZ4LXDS';
const MUSCLEUP_PAPERBACK_URL = 'TODO_AMAZON_URL';

// Optional amazon.com.au links for Australian visitors.
const HANDSTAND_KINDLE_URL_AU = 'https://www.amazon.com.au/dp/B0HMZJD7DX';
const HANDSTAND_PAPERBACK_URL_AU = 'TODO_AMAZON_URL';
const MUSCLEUP_KINDLE_URL_AU = 'https://www.amazon.com.au/dp/B0HMZ4LXDS';
const MUSCLEUP_PAPERBACK_URL_AU = 'TODO_AMAZON_URL';

// Email signup ("Tell me about new books").
//   mode 'mailto'    -> a button that opens the visitor's email app (nothing stored by the site).
//   mode 'formspree' -> a form posting to Formspree's free tier. Create a form at formspree.io,
//                       then set FORMSPREE_ID to its ID (the part after /f/).
// While the needed value is still TODO, the signup shows a "coming soon" note instead.
const SIGNUP_MODE = 'mailto';
const SIGNUP_EMAIL = 'TODO_EMAIL';
const FORMSPREE_ID = 'TODO';

window.BWG_BOOKS = {
    books: {
        handstand: {
            title: 'The Handstand',
            page: '/books/handstand',
            urls: {
                kindle: { us: HANDSTAND_KINDLE_URL, au: HANDSTAND_KINDLE_URL_AU },
                paperback: { us: HANDSTAND_PAPERBACK_URL, au: HANDSTAND_PAPERBACK_URL_AU }
            }
        },
        'ring-muscle-up': {
            title: 'The Ring Muscle Up',
            page: '/books/ring-muscle-up',
            urls: {
                kindle: { us: MUSCLEUP_KINDLE_URL, au: MUSCLEUP_KINDLE_URL_AU },
                paperback: { us: MUSCLEUP_PAPERBACK_URL, au: MUSCLEUP_PAPERBACK_URL_AU }
            }
        }
    },
    signup: {
        mode: SIGNUP_MODE,
        email: SIGNUP_EMAIL,
        formspreeId: FORMSPREE_ID,
        subject: 'Tell me about new books'
    }
};
