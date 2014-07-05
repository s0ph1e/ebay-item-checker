var url = require('url'),
  cheerio = require('cheerio'),
  request = require('request'),
  config = require('./config.js'),
  nodemailer = require('nodemailer'),
  smtpTransport = nodemailer.createTransport('SMTP', config.mail),
  NodeCache = require('node-cache'),
  cache = new NodeCache({stdTTL: config.sameItemDelay});
  
function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}
  
function compare(a,b){
  if(a.total < b.total){
     return -1;
  } else if(a.total > b.total){
    return 1;
  } else {
    return 0;
  }
}

function filter(price){
  return function(obj) {
    if(obj.total > price){
      return false;
    } else {
      var cached = cache.get(obj.url);
      
      if(isEmptyObject(cached)){
        cache.set(obj.url);
        return true;
      } else {
        console.log(obj.url + ' cached');
        return false;
      }
    }
  }
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
    priceRegexp = /(\d{1,3},)*\d+\.\d{2}/,
    results = [];
  
  // Loop over all items on page
  $('table', resultContainer).each(function(){
  
    var nameBlock = $(this).find('td.dtl').find('.ittl h3 a'),
      priceBlock = $(this).find('td.prc'),
      url = nameBlock.attr('href'),
      name = nameBlock.text(),
      price = priceBlock.find('.g-b[itemprop="price"]').text().match(priceRegexp),
      shipping = priceBlock.find('.ship .fee').text().match(priceRegexp);
     
    // Convert price and shipping to float
    price = price ? price[0] : '0';
    price = price.replace(',', '');
    price = Number(Number(price).toFixed(2));
    
    shipping = shipping ? shipping[0] : '0';
    shipping = shipping.replace(',', '');
    shipping = Number(Number(shipping).toFixed(2));
    
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

  // get item with wanted price which are not cached
  var itemsFound = results.filter(filter(item.price));
  
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
setInterval(checkAllItems, config.delay * 1000);