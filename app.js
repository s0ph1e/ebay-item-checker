var url = require('url');
var cheerio = require('cheerio');
var request = require('request');
var nodemailer = require('nodemailer');
var NodeCache = require('node-cache');
var _ = require('lodash');

var config = require('./config.js');
var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
var cache = new NodeCache({stdTTL: config.sameItemDelay});


function createEmailText(items) {
  return _.reduce(items, function (text, item) {
    var itemLine = '<a href="' + item.url + '" + target="_blank">' + item.name +
      ' $' + item.total + ' (price $' + item.price + ' + shipping $' +
      item.ship + ')</a><br>';
    return text += itemLine;
  }, '');
}

function sendEmail(item, results) {
  var emailTo = _.compact([config.email, item.email]).join(',');
  var emailText = createEmailText(results);
  var emailSubject = item.name + ' $' + results[0].total;

  smtpTransport.sendMail({
    to: emailTo,
    subject: emailSubject,
    html: emailText
  }, function (error, response) {
    if (error) {
      console.log(error);
    } else {
      console.log('Message sent: ' + response.message);
    }
  });
}

function parsePrices(html) {
  var $ = cheerio.load(html);
  var resultContainer = '#ListViewInner';
  var priceRegexp = /(\d{1,3},)*\d+\.\d{2}/;
  var results = [];

  // Loop over all items on page
  $('li.lvresult', resultContainer).each(function () {
    var self = $(this);

    var nameBlock = self.find('h3.lvtitle').find('a');
    var totalPriceBlock = self.find('ul.lvprices');
    var itemPriceBlock = totalPriceBlock.find('li.lvprice').find('.g-b');
    var shippingBlock = totalPriceBlock.find('li.lvshipping');

    var url = nameBlock.attr('href');
    var name = nameBlock.text();
    var price, shipping, total;

    // Extract price
    if (!_.isEmpty(itemPriceBlock)) {

      price = itemPriceBlock.text();
      price = price.match(priceRegexp)[0].replace(',', '');
      price = +((+price).toFixed(2));

    }

    // Detect if shipping is set
    if (!_.isEmpty(shippingBlock.find('.fee'))) {      // Shipping price is set

      shipping = shippingBlock.find('.fee').text();
      shipping = shipping.match(priceRegexp)[0].replace(',', '');
      shipping = +((+shipping).toFixed(2));

    } else if (!_.isEmpty(shippingBlock.find('.gvbfree'))) {  // Free shipping

      shipping = 0;

    } else if (shippingBlock.text().indexOf('not specified')) { // Not specified

      console.log(url + ' shipping not specified');
      return;

    }

    if (!(typeof price == 'number' && typeof shipping == 'number')) {
      console.log(url + 'something wrong with price or shipping');
      return;
    }

    total = price + shipping;
    total = +total.toFixed(2);

    results.push({
      name: name,
      url: url,
      price: price,
      ship: shipping,
      total: total
    });
  });

  return results;
}

function filterByPrice(item, results) {
  // get item with wanted price which are not cached
  return _.filter(results, function (result) {
    if (result.total <= item.price && _.isEmpty(cache.get(result.url))) {
      cache.set(result.url);
      return true;
    }
    return false;
  });
}

function checkAll() {
  _.each(config.items, function (item) {

    console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
    console.log('Checking ' + item.name);

    request(item.url, function (error, response, body) {
      if (!error && response.statusCode == 200) {

        var results = parsePrices(body);
        var filtered = filterByPrice(item, results);

        if (!_.isEmpty(filtered)) {
          console.log(filtered);
          sendEmail(item, filtered);
        }
      }
    });
  });
}

checkAll();
setInterval(checkAll, config.delay * 1000);