const sgMail = require('@sendgrid/mail');
// const nodemailer = require('nodemailer');

// const transport = nodemailer.createTransport({
//   host: 'smtp.mailtrap.io',
//   port: '2525',
//   auth: {
//     user: 'f5e2e0d7f9100f',
//     pass: '63db6ea9eb7121',
//   }
// });

// transport.sendMail({
//   from: 'Naz Lav <jackil182@gmail.com>',
//   to: 'jackil182@gmail.com',
//   subject: 'This is my first creation',
//   // html: 'Hey, <strong>Friend</strong>',
//   text: 'I hope this works'
// });

const sendgridAPIKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridAPIKey);

// sgMail.send({
//   to: 'nazariy.lavrenchuk@gmail.com',
//   from: 'nazariy.lavrenchuk@gmail.com',
//   subject: 'This is my first creation',
//   text: 'I hope this works'
// });

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'nazariy.lavrenchuk@gmail.com',
    subject: 'Thanks for joining in!',
    text: `Hello, ${name}! I hop you enjoy the app`
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'nazariy.lavrenchuk@gmail.com',
    subject: 'Your account has been canceled',
    text: `Goodbye, ${name}. Sad to see you go`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
};
