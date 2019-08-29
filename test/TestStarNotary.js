const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

before(async function() {
  instance = await StarNotary.deployed();
  user1 = accounts[1];
  user2 = accounts[2];
})

it('can Create a Star', async() => {
    let tokenId = 1; // This is bad
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async() => {
    let starId = 2;
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let starId = 3;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let starId = 4;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Task 2

it('can add the star name and star symbol properly', async() => {
    let starId = 6;
    await instance.createStar('awesome star', starId, { from: user1 });
    assert.equal('Udacity Star Token', await instance.name());
    assert.equal('UST', await instance.symbol());
});

it('lets 2 users exchange stars', async() => {
    let starId1 = 7;
    let starId2 = 8;
    await instance.createStar('awesome star 1', starId1, {from: user1});
    await instance.createStar('awesome star 2', starId2, {from: user2});
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    await instance.exchangeStars(starId1, starId2);
    // 3. Verify that the owners changed
    assert.equal(user1, await instance.ownerOf.call(starId1));
    assert.equal(user2, await instance.ownerOf.call(starId2));
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let starId = 9;
    await instance.createStar('awesome star', starId, { from: user1 });
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(user2, starId, { from: user1 });
    // 3. Verify the star owner changed.
    let newOwner = await instance.ownerOf.call(starId);
    assert.equal(user2, newOwner);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let starId = 10;
    let expectedName = 'despicable star'
    await instance.createStar(expectedName, starId, { from: user1 });
    // 2. Call your method lookUptokenIdToStarInfo
    let lookedUpName = await instance.lookUptokenIdToStarInfo(starId);
    // 3. Verify if you Star name is the same
    assert.equal(lookedUpName, expectedName);
});
