
const API_URL = 'http://localhost:3000';

async function main() {
    console.log('🚀 Starting address seeding script...');

    try {
        // 1. Fetch all users
        console.log('Fetching users...');
        const usersResponse = await fetch(`${API_URL}/users?limit=1000`);
        if (!usersResponse.ok) {
            throw new Error(`Failed to fetch users: ${usersResponse.statusText}`);
        }
        const usersData = await usersResponse.json();
        const users = usersData.data || [];

        console.log(`Initial total users fetched: ${users.length}`);

        // 2. Filter users with no addresses
        // Note: The API might return addresses populated or as IDs. 
        // We check if the array is empty or undefined.
        const usersWithoutAddresses = users.filter((user: any) => {
            return !user.addresses || user.addresses.length === 0;
        });

        console.log(`Found ${usersWithoutAddresses.length} users without addresses.`);

        if (usersWithoutAddresses.length === 0) {
            console.log('No users found without addresses. Exiting.');
            return;
        }

        // 3. Add 4 dummy addresses for each user
        const dummyAddresses = [
            {
                name: "Home",
                shipping_phone: "9876543210",
                pincode: "110001",
                locality: "Connaught Place",
                address: "Flat 101, Building A",
                city: "New Delhi",
                state: "Delhi",
                type: "Home",
                isDefault: true
            },
            {
                name: "Work",
                shipping_phone: "9876543211",
                pincode: "122001",
                locality: "Cyber City",
                address: "Office 404, Tower B",
                city: "Gurugram",
                state: "Haryana",
                type: "Work",
                isDefault: false
            },
            {
                name: "Mom's Place",
                shipping_phone: "9876543212",
                pincode: "201301",
                locality: "Sector 18",
                address: "House 56, Block C",
                city: "Noida",
                state: "Uttar Pradesh",
                type: "Home",
                isDefault: false
            },
            {
                name: "Friend's House",
                shipping_phone: "9876543213",
                pincode: "110075",
                locality: "Dwarka",
                address: "Plot 12, Sector 10",
                city: "New Delhi",
                state: "Delhi",
                type: "Home",
                isDefault: false
            }
        ];

        for (const user of usersWithoutAddresses) {
            console.log(`\nProcessing user: ${user.first_name || 'Unknown'} ${user.last_name || ''} (${user._id})`);

            for (let i = 0; i < 4; i++) {
                const address = dummyAddresses[i];
                const addressPayload = {
                    ...address,
                    user_id: user._id,
                    name: user.first_name ? `${user.first_name} ${address.name}` : address.name // Personalize name slightly
                };

                console.log(`  Adding address ${i + 1}/4...`);

                try {
                    const response = await fetch(`${API_URL}/addresses`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(addressPayload),
                    });

                    if (response.ok) {
                        console.log(`  ✅ Address ${i + 1} added successfully.`);
                    } else {
                        const errorText = await response.text();
                        console.error(`  ❌ Failed to add address ${i + 1}: ${response.status} - ${errorText}`);
                    }
                } catch (err) {
                    console.error(`  ❌ Error adding address ${i + 1}:`, err);
                }
            }
        }

        console.log('\n✨ Address seeding completed!');

    } catch (error) {
        console.error('Fatal error:', error);
    }
}

main();
