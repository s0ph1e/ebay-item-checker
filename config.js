var config = {
	email: 'user@gmail.com',
  delay: 60000,
  items: [
    {
      name: 'GoPro Hero 3+ Black Edition',
      url: 'http://www.ebay.com/sch/i.html?_odkw=gopro+hero+3%2B+black+edition' +
      '&_dcat=11724&LH_BIN=1&_sop=15&LH_ItemCondition=1000%7C1500&gbr=1&_fcid=209' +
      '&Brand=GoPro&_osacat=11724&_from=R40&Type=Helmet%252FAction&_clu=2' + 
      '&_trksid=p2045573.m570.l1313.TR11.TRC1.A0.H0.TRS0' + 
      '&_nkw=gopro+hero+3%2B+black+edition&_sacat=11724',
      price: 350,
    }
  ],
  mail: {
    service: 'Gmail',
    auth: {
        user: 'user@gmail.com',
        pass: 'password'
    }
  },
};

module.exports = config;