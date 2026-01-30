const mongoose = require('mongoose');

async function debug() {
    await mongoose.connect('mongodb+srv://anshu:Anshu123@testingcluster.s2vkdgu.mongodb.net/?appName=TestingCluster', { dbName: 'blinket' });
    const Brand = mongoose.model('Brand', new mongoose.Schema({}, { strict: false }), 'brands');
    const brand = await Brand.findOne();
    console.log('Raw Brand:', JSON.stringify(brand, null, 2));
    process.exit();
}

debug();
