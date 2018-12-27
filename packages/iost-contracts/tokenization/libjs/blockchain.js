var Int64 = require('./int64.js');

class BlockChain
{
    transfer(from, to, amount) {
        if (!(amount instanceof Int64)) {
            amount = new Int64(amount);
        }
        console.log("transfer ", from, to, amount.toString());
        return 0;
    }

    withdraw(to, amount) {
        if (!(amount instanceof Int64)) {
            amount = new Int64(amount);
        }
        console.log("withdraw ", to, amount.toString());
        return 0;
    }

    deposit(from, amount) {
        if (!(amount instanceof Int64)) {
            amount = new Int64(amount);
        }
        console.log("deposit ", from, amount.toString());
        return 0;
    }

    topUp(contract, from, amount) {
        if (!(amount instanceof Int64)) {
            amount = new Int64(amount);
        }
        console.log("topup ", contract, from, amount.toString());
        return 0;
    }

    countermand(contract, to, amount) {
        if (!(amount instanceof Int64)) {
            amount = new Int64(amount);
        }
        console.log("countermand ", contract, to, amount.toString());
        return 0;
    }

    blockInfo() {
        var blkInfo = {};
        blkInfo["parent_hash"] = "0x00";
        blkInfo["number"] = 10;
        blkInfo["witness"] = "IOSTwitness";
        blkInfo["time"] = 1537000000;
        return JSON.stringify(blkInfo);
    }

    txInfo() {
        var txInfo = {};
        txInfo["time"] = 1537000000;
        txInfo["hash"] = "0x01";
        txInfo["expiration"] = 1637000000;
        txInfo["gas_limit"] = 1e10;
        txInfo["gas_price"] = 1;
        txInfo["auth_list"] = ["IOSTpublisher"];

        return JSON.stringify(txInfo);
    }

    call(contract, api, args) {
        console.log("call ", contract, api, args);
        return 0;
    }

    callWithReceipt(contract, api, args) {
        console.log("callWithReceipt ", contract, api, args);
        return this.call(contract, api, args);
    }

    requireAuth(pubKey) {
        console.log("requireAuth ", pubKey);
        return true;
    }

    grantServi(pubKey, amount) {
        console.log("grantServi ", pubKey, amount.toString());
        return 0;
    }
};

module.exports = BlockChain;