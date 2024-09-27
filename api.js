
// Author: Mehmet Kahya
// Created: 17 March 2024
// Last Updated: 28.08.2024

const axios = require('axios');
const fs = require('fs');

// Đọc domain từ tệp domain.txt
const domains = fs.readFileSync('temp-mail/domain.txt', 'utf-8').split('\n');

// Đọc API key từ tệp mailgun.txt
const mailgunApiKey = fs.readFileSync('temp-mail/mailgun.txt', 'utf-8').trim();

console.log(`
  ████████╗███████╗███╗   ███╗██████╗     ███╗   ███╗ █████╗ ██╗██╗     
  ╚══██╔══╝██╔════╝████╗ ████║██╔══██╗    ████╗ ████║██╔══██╗██║██║     
     ██║   █████╗  ██╔████╔██║██████╔╝    ██╔████╔██║███████║██║██║     
     ██║   ██╔══╝  ██║╚██╔╝██║██╔═══╝     ██║╚██╔╝██║██╔══██║██║██║     
     ██║   ███████╗██║ ╚═╝ ██║██║         ██║ ╚═╝ ██║██║  ██║██║███████╗
     ╚═╝   ╚══════╝╚═╝     ╚═╝╚═╝         ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝
  `);

console.log("API is ready!");

function warningAlert() {
  alert(
    "⚠️ This project is purely for educational purposes. We do not allow illegal things to be done with this project and we are not responsible for any incidents that may occur. This project use Mailgun's API for create e-mails. Use it legally ⚠️"
  );
}

function getUserAndDomain() {
  const addr = $("#addr").val();
  if (!addr) {
    alert("Please generate or input an email address first!");
    return null;
  }

  const [user, domain] = addr.split("@");
  return { user, domain };
}

function populateDomainSelect() {
    const domainSelect = document.getElementById('domain-select');
    console.log('Populating domain select with domains:', domains);
    domains.forEach(domain => {
        const option = document.createElement('option');
        option.value = domain;
        option.text = domain;
        domainSelect.appendChild(option);
    });
}

function genEmail() {
    const domainSelect = document.getElementById('domain-select');
    const domain = domainSelect.value;
  const user = Math.random().toString(36).substring(2, 15);
  const email = `${user}@${domain}`;
  $("#addr").val(email);
  refreshMail();
}

async function refreshMail() {
  const { user, domain } = getUserAndDomain();

  if (!user || !domain) return;

  try {
    const response = await axios.get(`https://api.mailgun.net/v3/${domain}/messages`, {
      auth: {
        username: 'api',
        password: mailgunApiKey
      },
      params: {
        to: `${user}@${domain}`
      }
    });

    const emails = response.data.items;
    const emailsElement = $("#emails");
    emailsElement.empty();

    emailsElement.append(`
        <tr>
          <th><b>ID</b></th>
          <th><b>From</b></th>
          <th><b>Subject</b></th>
          <th><b>Date</b></th>
          <th><b>Content</b></th>
        </tr>
      `);

    for (const email of emails) {
      emailsElement.append(`
          <tr>
            <td>${email.id}</td>
            <td>${email.from}</td>
            <td>${email.subject}</td>
            <td>${email.date}</td>
            <td id="${email.id}"><a onclick="loadEmail('${email.id}')">Load content...</a></td>
          </tr>
        `);
    }
  } catch (error) {
    console.error('Error fetching emails:', error);
  }
}

async function loadEmail(id) {
  const { user, domain } = getUserAndDomain();

  if (!user || !domain) return;

  try {
    const response = await axios.get(`https://api.mailgun.net/v3/${domain}/messages/${id}`, {
      auth: {
        username: 'api',
        password: mailgunApiKey
      }
    });

    const email = response.data;
    const elm = $(`#${id}`);
    if (email['body-html']) {
      elm.html(email['body-html']);
    } else {
      elm.text(email['body-plain']);
    }

    const atts = $("<div></div>");
    for (const file of email.attachments) {
      atts.append(
        `<a href='https://api.mailgun.net/v3/${domain}/messages/${id}/attachments/${file.id}'>${file.filename}</a>`
      );
    }
    elm.append(atts);
  } catch (error) {
    console.error('Error loading email:', error);
  }
}
