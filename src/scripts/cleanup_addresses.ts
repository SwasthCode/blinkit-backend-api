
const API_URL = 'http://localhost:3000';

async function main() {
    console.log('🚀 Starting address cleanup script...');

    try {
        // 1. Fetch all addresses
        console.log('Fetching all addresses...');
        const response = await fetch(`${API_URL}/addresses?limit=10000`);
        if (!response.ok) {
            throw new Error(`Failed to fetch addresses: ${response.statusText}`);
        }
        const data = await response.json();
        const addresses = data.data || [];

        console.log(`Total addresses found: ${addresses.length}`);

        // 2. Group addresses by user_id
        const addressesByUser: Record<string, any[]> = {};
        const orphanedAddresses: any[] = [];

        addresses.forEach((addr: any) => {
            if (addr.user_id) {
                if (!addressesByUser[addr.user_id]) {
                    addressesByUser[addr.user_id] = [];
                }
                addressesByUser[addr.user_id].push(addr);
            } else {
                orphanedAddresses.push(addr);
            }
        });

        console.log(`Found addresses for ${Object.keys(addressesByUser).length} unique users.`);
        if (orphanedAddresses.length > 0) {
            console.log(`Found ${orphanedAddresses.length} orphaned addresses (no user_id). Ignoring them.`);
        }

        // 3. Identify extra addresses to delete
        let deletedCount = 0;
        let keptCount = 0;

        for (const userId in addressesByUser) {
            const userAddresses = addressesByUser[userId];

            if (userAddresses.length <= 1) {
                keptCount += userAddresses.length;
                continue;
            }

            // Sort: Prioritize isDefault=true, then created_at (if available), or just pick the first one
            // We want to KEEP one.
            // Let's find one to keep.
            const addressToKeep = userAddresses.find((a: any) => a.isDefault) || userAddresses[0];

            // The rest are to be deleted
            const addressesToDelete = userAddresses.filter((a: any) => a._id !== addressToKeep._id);

            console.log(`\nUser ${userId} has ${userAddresses.length} addresses. Keeping ID: ${addressToKeep._id}. Deleting ${addressesToDelete.length} addresses.`);

            for (const addr of addressesToDelete) {
                try {
                    const delRes = await fetch(`${API_URL}/addresses/${addr._id}`, {
                        method: 'DELETE'
                    });

                    if (delRes.ok) {
                        console.log(`  ✅ Deleted address ${addr._id}`);
                        deletedCount++;
                    } else {
                        console.error(`  ❌ Failed to delete ${addr._id}: ${delRes.status}`);
                    }
                } catch (err) {
                    console.error(`  ❌ Error deleting ${addr._id}:`, err);
                }
            }
            keptCount++;
        }

        console.log('\n-----------------------------------');
        console.log(`Cleanup completed.`);
        console.log(`Addresses kept: ${keptCount}`);
        console.log(`Addresses deleted: ${deletedCount}`);
        console.log('-----------------------------------');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

main();
