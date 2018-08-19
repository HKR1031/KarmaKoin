App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load items.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-price').text(data[i].price);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-purchase').attr('data-id', data[i].id);
        petTemplate.find('.btn-purchase').attr('data-price', data[i].price);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {

    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      // If no injected web3 instance is detected, fall back to Ganache
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }

    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Purchase.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract
      var PurchaseArtifact = data;

      App.contracts.Purchase = TruffleContract(PurchaseArtifact);

      // Set the provider for our contract
      App.contracts.Purchase.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the bought items
      return App.markPurchased();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-purchase', App.handlePurchase);
  },

  markPurchased: function(purchasers, account) {
    var purchaseInstance;

    App.contracts.Purchase.deployed()
      .then(function(instance) {
        purchaseInstance = instance;
        return purchaseInstance.getPurchasers.call();
      })
      .then(function(purchasers) {
        // if item has been purchased, disable access to it
        for (i = 0; i < purchasers.length; i++) {
          if (purchasers[i] !== '0x0000000000000000000000000000000000000000') {
            $('.panel-item').eq(i).find('button').text('Success').attr('disabled', true);
          }
        }
      })
      .catch(function(err) {
        console.log(err.message);
      });
  },

  handlePurchase: function(event) {
    event.preventDefault();

    console.log(event);

    var itemId = parseInt($(event.target).data('id'));
    var price = parseInt($(event.target).data('price'));

    var purchaseInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Purchase.deployed()
        .then(function(instance) {
          purchaseInstance = instance;

          // pay for it
          purchaseInstance.sendTransaction({
            from: account,
            value: web3.toWei("1", "ether")
          }).then(function(result) {
            // then get the item -- is this really talking to MetaMask
            return purchaseInstance.purchase(itemId, {from: account, value: 1 });
            console.log(result);
          }).then(function(result) {
            return App.markPurchased();
          }).catch(function(err) {
            console.error(err)
          });
        });
    });
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
