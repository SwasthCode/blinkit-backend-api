

async function testCreateOrder() {
    try {
        const payload = {
            user_id: "697198a2fe614c1cd8f83060",
            address_id: "697198a2fe614c1cd8f83060",
            items: [{
                product_id: "697b04f10248e072e55bd644",
                quantity: 1
            }],
            payment_method: "COD"
        };

        // Using fetch locally if axios isn't around or just rely on fetch
        // But axios was problematic earlier, let's use fetch directly.
    } catch (e) { console.error(e); }
}

async function run() {
    const payload = {
        user_id: "697198a2fe614c1cd8f83060",
        address_id: "697198a2fe614c1cd8f83060",
        items: [{
            product_id: "697b04f10248e072e55bd644",
            quantity: 1
        }],
        payment_method: "COD"
    };

    try {
        const response = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Created Order:', JSON.stringify(data, null, 2));

    } catch (e) {
        console.error('Error:', e);
    }
}

run();
