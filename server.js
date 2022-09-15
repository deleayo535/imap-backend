require("dotenv").config();
var client = require("./app.js");
const express = require("express");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const path = require("path");
const bodyParser = require("body-parser");

const isDev = process.env.NODE_ENV !== "production";
const port = process.env.PORT || 5000;
const app = express();

const Imap = require("imap");
const inspect = require("util").inspect;
const mailServer = require("./app.js");
const cors = require("cors");

app.use(cors());
var fs = require("fs"),
  fileStream;
// const inbox = [];
let count = 0;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("HOME PAGE");
});

app.get("/inbox", (req, res) => {
  //display mails in inbox
  let inboxs = [];
  // var newInboxs = inboxs.reduce(function (s, a) {
  //   s.push({ name: a });
  //   return { s };
  // });
  // console.log(newInboxs);

  mailServer.openBox("INBOX", true, function (err, box) {
    if (err) throw err;
    mailServer.search(
      ["SEEN", ["SINCE", "September 08, 2022"]],
      function (err, results) {
        if (err) throw err;
        var f = mailServer.seq.fetch("1:5", {
          // id: true,
          // type: "",
          bodies: ["HEADER.FIELDS (FROM TO SUBJECT BODY)"],
          struct: true,

          // extensions: "X-MAILBOX",
          // modifiers:
        });

        f.on("message", function (msg, seqno) {
          var prefix = +seqno;

          msg.on("body", function (stream, info) {
            let buffer = "";

            // stream.pipe(fs.createWriteStream("-body.txt"));
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", function () {
              inboxs.push(prefix + inspect(Imap.parseHeader(buffer)));
            });
          });
          // count = count + 1;
          // inbox.push(count);
        });
        f.once("error", function (err) {
          console.log("Fetch error: " + err);
        });

        f.once("end", function () {
          console.log("Done fetching all messages!");
          console.log(inboxs);
          // mailServer.end();
          res.send(inboxs);
        });
      }
    );
  });
});

app.get("/inbox/:id", (req, res) => {
  //display specific email

  res.send(req.params.id);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
