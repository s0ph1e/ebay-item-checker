var url = require('url'),
  cheerio = require('cheerio'),
  request = require('request'),
  config = require('./config.js'),
  nodemailer = require('nodemailer'),
  smtpTransport = nodemailer.createTransport('SMTP', config.mail);
  
function compare(a,b) {
  if (a.total < b.total)
     return -1;
  if (a.total > b.total)
    return 1;
  return 0;
}

function createEmail(items){
  var text = '';
  for(var i = 0, len = items.length; i < len; i++){
    text += '<a href="' + items[i].url + '" + target="_blank">' + items[i].name + 
      ' $' + items[i].total + ' (price $' +items[i].price + ' + shipping $' + 
      items[i].ship + ')</a><br>';
  }
  return text;
}
  
function parsePrices(html){
  var $ = cheerio.load(html)
    resultContainer = '#ResultSetItems',
    priceRegexp = /\d+[.]\d{2}/,
    results = [];
  
  // Loop over all items on page
  $('table', resultContainer).each(function(){
  
    var nameBlock = $(this).find('td.dtl').find('.ittl h3 a'),
      priceBlock = $(this).find('td.prc'),
      url = nameBlock.attr('href'),
      name = nameBlock.text(),
      price = priceBlock.find('.g-b[itemprop="price"]').text().match(priceRegexp) || 0,
      shipping = priceBlock.find('.ship .fee').text().match(priceRegexp) || 0;
     
    // Convert price and shipping to float
    price = Number(Number(price[0]).toFixed(2));
    shipping = Number(Number(shipping[0]).toFixed(2));
    total = price + shipping;
    total = Number(total.toFixed(2));

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

function checkPrices(item, results){

  var itemsFound = [];
  
  for(var i = 0, len = results.length; i < len; i++){ 
    if(results[i].total < item.price){
      itemsFound.push(results[i]);
    }
  }
  
  if(itemsFound.length > 0){
    smtpTransport.sendMail({
       to: config.email, 
       subject: item.name + ' $' + itemsFound[0].total,
       html: createEmail(itemsFound),
    }, function(error, response){
      if(error){
        console.log(error);
      }else{
        console.log('Message sent: ' + response.message);
      }
    });
  }
}

function checkItem(item){
  console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''));
  console.log('Checking ' + item.name);
  request(item.url, function(error, response, body) {
    if (!error && response.statusCode == 200) {
      var results = parsePrices(body);
      checkPrices(item, results);
    }
  });
}
  
function checkAllItems(){
  for(var i = 0, len = config.items.length; i < len; i++){
    checkItem(config.items[i]);
  }
}  

checkAllItems();
setInterval(checkAllItems, config.delay);