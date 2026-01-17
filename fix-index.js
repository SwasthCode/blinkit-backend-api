const mongoose = require('mongoose');

async function fixIndex() {
    try {
        await mongoose.connect('mongodb+srv://vedatmanepc:uvnNRUsi2tS0HFLN@cluster0.hjuni3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            dbName: process.env.DATABASE_NAME || 'base-api', // Assuming 'base-api' from error message
        });

        
        const collection = mongoose.connection.db.collection('users');
        const indexes = await collection.indexes();
        console.log('Current Indexes:', indexes);

        // Find email index
        const emailIndex = indexes.find(i => i.key.email);
        if (emailIndex) {
            console.log('Dropping email index:', emailIndex.name);
            await collection.dropIndex(emailIndex.name);
            console.log('Email index dropped. Mongoose should recreate it as sparse on next app start.');
        } else {
            console.log('Email index not found.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixIndex();
