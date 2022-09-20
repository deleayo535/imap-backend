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
var fs = require("fs");
// fileStream
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

  // ab = JSON.parse(a.split(/\s/).join(""));
  // console.log(ab);

  // inboxs = inboxs.filter(function (inbox) {
  //   inbox.replace(/\{|\}/gi, "");
  // return /\S/.test(inbox.trim());
  // });
  const newInboxs = inboxs.map(function (inbox) {
    inbox.replace(/\{|\}/gi, "");
  });

  const nw = newInboxs;
  // const vw = JSON.parse(nw);
  // });
  // console.log(newInboxs);

  function openInbox(cb) {
    mailServer.openBox("INBOX", true, cb);
  }

  // mailServer.once("ready", function () {
  mailServer.openBox("INBOX", true, function (err, box) {
    if (err) throw err;
    mailServer.search(
      ["SEEN", ["SINCE", "September 15, 2022"]],
      function (err, results) {
        if (err) throw err;

        var f = mailServer.seq.fetch("7:9", {
          // bodies: [""],
          bodies: ["HEADER.FIELDS (FROM TO SUBJECT)", "TEXT"],
          struct: true,
        });

        f.on("message", function (msg, seqno) {
          var prefix = "(" + seqno + ")";

          msg.on("body", function (stream, info) {
            let buffer = "";

            // stream.pipe(fs.createWriteStream("-body.txt"));
            stream.on("data", function (chunk) {
              buffer += chunk.toString("utf8");
            });

            stream.once("end", function () {
              inboxs.push(inspect(Imap.parseHeader(buffer)));
            });
          });

          // msg.once("attribute", function (attrs) {
          //   console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
          // });

          // msg.once("end", function () {});
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
          // res.send(newInboxs);
          res.on("data", (chunk) => {
            inboxs += chunk;
          });
          const newInboxs = inboxs.map((inbox) => {
            const serializedInbox = inbox
              .trim("")
              // .slice(1, -1)
              .replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, "")
              .replace(/\[|\]/gi, "")
              .replace(/(\r\n|\n|\r)/gm, "")
              .replace(/'/g, '"')
              .replace(/[']/g, '"')
              .replace(/\]$/, "")
              .replace(/^\[/, "")
              .replace(/^\s+|\s+$/g, "")
              .replace(/&quot;/gi, '"')
              .replace(/([{,])(\s*)([A-Za-z0-9_\-]+?)\s*:/g, '$1"$3":');
            // .replace(/['{ }']/g, "")

            // .split(";;;")'

            const parsedInbox = JSON.parse(serializedInbox);

            return parsedInbox;
          });
          console.log("newInboxs", newInboxs);
          res.send(newInboxs);
        });
      }
    );
  });
});
// });

app.get("/inbox/:id", (req, res) => {
  //display specific email

  res.send(req.params.id);
});

app.listen(port, () => console.log(`Listening on port ${port}...`));
