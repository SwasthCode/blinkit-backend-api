import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Order, OrderDocument } from '../schemas/order.schema';
import { generateOrderId } from '../common/utils/helper';

async function bootstrap() {
    console.log('Initializing migration script context...');
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const orderModel = app.get<Model<OrderDocument>>(getModelToken(Order.name));
        console.log('Connected to database and retrieved Order model.');

        // Find orders without order_id or where order_id is null
        const query = { $or: [{ order_id: { $exists: false } }, { order_id: null }] };
        const totalToMigrate = await orderModel.countDocuments(query);
        console.log(`Found ${totalToMigrate} orders pending migration.`);

        if (totalToMigrate === 0) {
            console.log('No orders to migrate. Exiting.');
            await app.close();
            process.exit(0);
        }

        const batchSize = 100;
        let processedUrl = 0;
        let successCount = 0;
        let skippedCount = 0;
        let failedCount = 0;

        // Use cursor for efficient memory usage
        const cursor = orderModel.find(query).sort({ createdAt: 1 }).cursor();

        for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
            try {
                if (doc.order_id) {
                    skippedCount++;
                    continue;
                }

                let saved = false;
                let attempts = 0;
                const maxAttempts = 5;

                while (!saved && attempts < maxAttempts) {
                    attempts++;
                    const newOrderId = generateOrderId();

                    try {
                        // Determine if we should use updateOne to be atomic and safe against race conditions
                        // or just doc.save(). Since we are in a cursor, doc.save() might overwrite other changes 
                        // if concurrent, but request says "Target only documents...". 
                        // Using updateOne is safer for atomicity on the specific field.

                        const result = await orderModel.updateOne(
                            { _id: doc._id, $or: [{ order_id: { $exists: false } }, { order_id: null }] },
                            { $set: { order_id: newOrderId } }
                        );

                        if (result.modifiedCount === 1) {
                            saved = true;
                            successCount++;
                        } else {
                            // Could happen if another process updated it, or if it already had an ID (race condition)
                            // Double check
                            const current = await orderModel.findById(doc._id);
                            if (current && current.order_id) {
                                skippedCount++;
                                saved = true; // functionally saved
                            } else {
                                // Optimistic concurrency failure? Retry.
                                console.warn(`Failed to update order ${doc._id}, retrying...`);
                            }
                        }
                    } catch (err) {
                        if (err.code === 11000) { // Duplicate key error
                            console.warn(`Duplicate ID generated ${newOrderId}, retrying...`);
                        } else {
                            throw err;
                        }
                    }
                }

                if (!saved) {
                    console.error(`Failed to generate unique ID for order ${doc._id} after ${maxAttempts} attempts.`);
                    failedCount++;
                }

            } catch (err) {
                console.error(`Error processing order ${doc._id}: ${err.message}`);
                failedCount++;
            }

            processedUrl++;
            if (processedUrl % batchSize === 0) {
                console.log(`Progress: ${processedUrl}/${totalToMigrate} processed. Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
            }
        }

        console.log('Migration completed.');
        console.log(`Total: ${totalToMigrate}`);
        console.log(`Success: ${successCount}`);
        console.log(`Failed: ${failedCount}`);
        console.log(`Skipped: ${skippedCount}`);

        // Ensure unique index
        console.log('Ensuring unique index on order_id...');
        try {
            await orderModel.syncIndexes();
            console.log('Index synchronization complete.');
        } catch (err) {
            console.error('Failed to sync indexes:', err.message);
        }

    } catch (error) {
        console.error('Migration failed fatal:', error);
    } finally {
        await app.close();
        process.exit(0);
    }
}

bootstrap();
