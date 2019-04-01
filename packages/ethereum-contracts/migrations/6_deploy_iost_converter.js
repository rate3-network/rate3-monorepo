const ConversionReceiver = artifacts.require('./bridge/IOSTConversionReceiver.sol');

module.exports = function deployment(deployer, network, accounts) {
    // eslint-disable-next-line no-unused-vars
    const [owner, ...rest] = accounts;

    // TrueUSD
    // const deployFn = async () => {
    //     console.log('\nSetting converter of TUSD');
    //     const converterTUSD = await ConversionReceiver.new(
    //         '0x0000000000085d4780B73119b644AE5ecd22b376',
    //         '0x436F0F3a982074c4a05084485D421466a994FE53',
    //         new web3.utils.BN('1000000000000000000000'), // 1000 RTE tokens
    //         0,
    //         0,
    //         0,
    //         0,
    //         new web3.utils.BN('50000000000000000000'), // 50 token
    //         '0x40975D6758D955D997BD0016a66DB89dd1235566',
    //         '0x40975D6758D955D997BD0016a66DB89dd1235566',
    //         { from: owner }
    //     );


    //     console.log('\n===== Addresses ======');
    //     console.log('TUSD Converter:          ', converterTUSD.address);
    //     console.log('======================\n');
    // };

    const deployFn = async () => {
        console.log('\nSetting converter of USDC');
        const converterUSDC = await ConversionReceiver.new(
            '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            '0x436F0F3a982074c4a05084485D421466a994FE53',
            new web3.utils.BN('1000000000000000000000'), // 1000 RTE tokens
            0,
            0,
            0,
            0,
            new web3.utils.BN('50000000000000000000'), // 50 token
            '0x40975D6758D955D997BD0016a66DB89dd1235566',
            '0x40975D6758D955D997BD0016a66DB89dd1235566',
            { from: owner }
        );


        console.log('\n===== Addresses ======');
        console.log('USDC Converter:          ', converterUSDC.address);
        console.log('======================\n');
    };

    return deployer.then(() => deployFn()).catch(console.error);
};
