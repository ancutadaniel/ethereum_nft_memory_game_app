const MemoryToken = artifacts.require('MemoryToken');
const { assert } = require('chai');
const chai = require('chai');

chai.use(require('chai-as-promised')).should();

contract('MemoryToken', async ([deployer, author]) => {
  let memoryToken;

  before(async () => {
    memoryToken = await MemoryToken.deployed();
  });

  describe('deployment of the contract', async () => {
    it('contract deployed successfully and has a address', async () => {
      const address = await memoryToken.address;

      assert.notEqual(address, 0x0);
      assert.notEqual(address, '');
      assert.notEqual(address, null);
      assert.notEqual(address, undefined);
      assert.isString(address);
    });

    it('check the name of the contract', async () => {
      const name = await memoryToken.name();
      assert.equal(name, 'Memory Token', 'Contract has no name set');
    });

    it('should assert true', async function () {
      await MemoryToken.deployed();
      return assert.isTrue(true);
    });

    it('should have a symbol', async () => {
      const symbol = await memoryToken.symbol();
      assert.equal(symbol, 'DACETHER', 'Contract has no symbol set');
    });
  });

  describe('memory token distribution', async () => {
    let result;

    before(async () => {
      // mint two NFT's
      await memoryToken.awardItem(deployer, 'https://token-uri.com/nft');
      await memoryToken.awardItem(deployer, 'https://token-uri.com/nft1');
    });

    it('mint tokens should increase the tokens id', async () => {
      result = await memoryToken._tokenIds();
      assert.equal(result.toString(), '2', 'id should be update correct');
    });

    it('should increase the owner balance', async () => {
      result = await memoryToken.balanceOf(deployer);
      assert.equal(
        result.toString(),
        '2',
        'balanceOf should be update correct'
      );
    });

    it('token should belong to the owner', async () => {
      result = await memoryToken.ownerOf('0');
      assert.equal(
        result.toString(),
        deployer.toString(),
        'should have the correct owner'
      );
    });

    it('should see all the tokens of an address', async () => {
      let balanceOf = await memoryToken.balanceOf(deployer);
      let tokensId = [];
      for (let i = 0; i < balanceOf; i++) {
        tokensId.push(i.toString());
      }
      console.log(tokensId);
      let expected = ['0', '1'];
      assert.equal(
        tokensId.toString(),
        expected.toString(),
        'should have correct number of tokens'
      );
    });

    it('should have tokenURI correct set', async () => {
      let tokenURI = await memoryToken.tokenURI('0');
      let tokenURI1 = await memoryToken.tokenURI('1');
      assert.equal(tokenURI.toString(), 'https://token-uri.com/nft');
      assert.equal(tokenURI1.toString(), 'https://token-uri.com/nft1');
    });
  });
});
