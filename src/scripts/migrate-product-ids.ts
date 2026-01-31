import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Product, ProductDocument } from '../schemas/product.schema';
import { generateProductId } from '../common/utils/helper';

async function bootstrap() {
  console.log('Initializing product migration script context...');
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const productModel = app.get<Model<ProductDocument>>(
      getModelToken(Product.name),
    );
    console.log('Connected to database and retrieved Product model.');

    // Find products without product_id or where product_id is null
    const query = {
      $or: [{ product_id: { $exists: false } }, { product_id: null }],
    };
    const totalToMigrate = await productModel.countDocuments(query);
    console.log(`Found ${totalToMigrate} products pending migration.`);

    if (totalToMigrate === 0) {
      console.log('No products to migrate. Exiting.');
      await app.close();
      process.exit(0);
    }

    const batchSize = 100;
    let processedCount = 0;
    let successCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    // Use cursor for efficient memory usage
    const cursor = productModel.find(query).sort({ createdAt: 1 }).cursor();

    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      try {
        if (doc.product_id) {
          skippedCount++;
          continue;
        }

        let saved = false;
        let attempts = 0;
        const maxAttempts = 5;

        // Use createdAt for the date part of the ID
        const createdAt = (doc as any).createdAt || new Date();

        while (!saved && attempts < maxAttempts) {
          attempts++;
          const newProductId = generateProductId(createdAt);

          try {
            const result = await productModel.updateOne(
              {
                _id: doc._id,
                $or: [{ product_id: { $exists: false } }, { product_id: null }],
              },
              { $set: { product_id: newProductId } },
            );

            if (result.modifiedCount === 1) {
              saved = true;
              successCount++;
            } else {
              // Check if it was already updated
              const current = await productModel.findById(doc._id);
              if (current && current.product_id) {
                skippedCount++;
                saved = true;
              } else {
                console.warn(
                  `Failed to update product ${doc._id}, retrying...`,
                );
              }
            }
          } catch (err) {
            if (err.code === 11000) {
              // Duplicate key error
              console.warn(
                `Duplicate ID generated ${newProductId}, retrying...`,
              );
            } else {
              throw err;
            }
          }
        }

        if (!saved) {
          console.error(
            `Failed to generate unique ID for product ${doc._id} after ${maxAttempts} attempts.`,
          );
          failedCount++;
        }
      } catch (err) {
        console.error(`Error processing product ${doc._id}: ${err.message}`);
        failedCount++;
      }

      processedCount++;
      if (processedCount % batchSize === 0) {
        console.log(
          `Progress: ${processedCount}/${totalToMigrate} processed. Success: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`,
        );
      }
    }

    console.log('Migration completed.');
    console.log(`Total: ${totalToMigrate}`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${failedCount}`);
    console.log(`Skipped: ${skippedCount}`);

    // Ensure unique index
    console.log('Ensuring unique index on product_id...');
    try {
      await productModel.syncIndexes();
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
