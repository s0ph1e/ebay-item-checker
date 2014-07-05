var config = {
  // Email for notifications
  email: 'user@gmail.com, user@gmail.com',
  
  // Delay between checks in seconds
  // Default 3600 = each hour
  delay: 3600,
  
  // Delay between the notifications of the same item in seconds
  // Default 43200 = twice a day
  // 0 = never notify
  sameItemDelay: 43200,
  
  // Array of items to check
  items: [
    {
      // Unique name of item in checker. (Not used in search)
      name: 'GoPro Hero 3+ Black Edition',
      
      // Ebay search page url
      url: 'http://www.ebay.com/sch/i.html?_odkw=gopro+hero+3%2B+black+edition' +
      '&_dcat=11724&LH_BIN=1&_sop=15&LH_ItemCondition=1000%7C1500&gbr=1&_fcid=209' +
      '&Brand=GoPro&_osacat=11724&_from=R40&Type=Helmet%252FAction&_clu=2' + 
      '&_trksid=p2045573.m570.l1313.TR11.TRC1.A0.H0.TRS0' + 
      '&_nkw=gopro+hero+3%2B+black+edition&_sacat=11724',
      
      // Search items which cost low then specified price
      price: 350,

      // Email for notification only about this item
      // Uncomment this line, if you want get notification only about this item
      //email: 'gopro-only@gmail.com',
    }
  ],
  
  // Nodemailer config.
  // https://github.com/andris9/Nodemailer
  mail: {
    service: 'Gmail',
    auth: {
        user: 'user@gmail.com',
        pass: 'password'
    }
  },
};

module.exports = config;
