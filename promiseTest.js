function resolveAfter2Seconds() {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve('resolved');
      }, 2000);
    });
  }

  var rp = require('request-promise');
  var request = require('request');

  async function loadBalance(publicKey) {
    var self = this
    let testAddress = 'https://horizon-testnet.stellar.org' + '/accounts/' + publicKey
    await rp(testAddress)
    .then(function (htmlString) {
        self.balance = JSON.parse(htmlString).balances[0].balance
        console.log(self.balance)
    })
    .catch(function (err) {
        console.log('Error in loading balance')
    });
    return self.balance
  }

async function asyncCall() {
    var self = this
    let publicKey = 'GDF3AUGB2RPN3EL3MJ2T2NAQYRPWZDMX56HJF6TYERNNAJBNYNBAU2RR'
    let testAddress = 'https://horizon-testnet.stellar.org' + '/accounts/' + publicKey
    let balance = await loadBalance(publicKey)
    if (balance == null) {
      await rp({
        url: 'https://friendbot.stellar.org',
        qs: { addr: publicKey },
        json: true
        }).then(async function(htmlString) {
          self.balance = await loadBalance(publicKey)
        })
        .catch(function (err) {
          console.log(err)
        });
    } else {
      console.log('the account is already on the testnet')
    }
  }
  
  asyncCall();