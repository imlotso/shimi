const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

const MIN_LENGTH = 4;
const MAX_LENGTH = 300;

function cleanText(value, maxLength) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function getEmailConfig() {
  const {
    FEEDBACK_SMTP_HOST,
    FEEDBACK_SMTP_PORT,
    FEEDBACK_SMTP_USER,
    FEEDBACK_SMTP_PASS,
    FEEDBACK_MAIL_TO
  } = process.env;

  if (!FEEDBACK_SMTP_HOST || !FEEDBACK_SMTP_USER || !FEEDBACK_SMTP_PASS || !FEEDBACK_MAIL_TO) {
    return null;
  }

  return {
    host: FEEDBACK_SMTP_HOST,
    port: Number(FEEDBACK_SMTP_PORT || 465),
    secure: Number(FEEDBACK_SMTP_PORT || 465) === 465,
    auth: {
      user: FEEDBACK_SMTP_USER,
      pass: FEEDBACK_SMTP_PASS
    },
    to: FEEDBACK_MAIL_TO
  };
}

async function sendFeedbackEmail(feedback) {
  const config = getEmailConfig();
  if (!config) {
    return { sent: false, reason: 'email_not_configured' };
  }

  // nodemailer is optional for local development. Deploy this cloud function with npm dependencies installed.
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth
  });

  await transporter.sendMail({
    from: `"今晚有谱反馈" <${config.auth.user}>`,
    to: config.to,
    subject: `新的用户反馈：${feedback.feedbackId}`,
    text: [
      '收到一条新的匿名反馈：',
      '',
      feedback.content,
      '',
      `来源页面：${feedback.source}`,
      `反馈编号：${feedback.feedbackId}`,
      `提交时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`
    ].join('\n')
  });

  return { sent: true };
}

exports.main = async (event) => {
  const content = cleanText(event.content, MAX_LENGTH + 20);
  const source = cleanText(event.source || 'unknown', 32);

  if (content.length < MIN_LENGTH) {
    return {
      ok: false,
      message: '反馈内容太短'
    };
  }

  if (content.length > MAX_LENGTH) {
    return {
      ok: false,
      message: '反馈内容超过 300 字'
    };
  }

  const feedbackDoc = {
    content,
    source,
    status: 'new',
    anonymous: true,
    createdAt: db.serverDate()
  };

  const result = await db.collection('feedbacks').add({
    data: feedbackDoc
  });

  let email = { sent: false, reason: 'email_not_configured' };
  try {
    email = await sendFeedbackEmail({
      ...feedbackDoc,
      feedbackId: result._id
    });
  } catch (error) {
    await db.collection('feedbacks').doc(result._id).update({
      data: {
        emailError: cleanText(error.message, 180)
      }
    });
    email = { sent: false, reason: 'email_failed' };
  }

  return {
    ok: true,
    id: result._id,
    email
  };
};
