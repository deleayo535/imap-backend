//const { parseBODYSTRUCTURE } = require('emailjs-imap-client/dist/command-parser');

require("dotenv").config();

const Imap = require("imap"),
  inspect = require("util").inspect;
const fs = require("fs"),
  fileStream = require("util").inspect;

const myMail = "erisoyemi@gmail.com";
const myPwd = "oqufwcbqkgmajzvr";
const inbox = [];
const components = [];
let count = 0;

let mailServer = new Imap({
  user: myMail,
  password: myPwd,
  host: "imap.gmail.com",
  port: 993,
  tls: true,
  tlsOptions: {
    rejectUnauthorized: false,
  },
  authTimeout: 3000,
}).once("error", function (err) {
  console.log("Source Server Error:- ", err);
});

mailServer.connect();

module.exports = mailServer;
// module.exports = openInbox;
