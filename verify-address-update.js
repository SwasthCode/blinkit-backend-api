
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;
const fs = require('fs');

async function main() {
  const ts = Date.now();
  const phone = '96' + Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  
  if (!fs.existsSync('dummy.png')) {
      fs.writeFileSync('dummy.png', Buffer.from('89504E470D0A1A0A0000000D4948445200000001000000010802000000907753DE0000000C4944415408D763F8FF7F000500030101AA94590000000049454E44AE426082', 'hex'));
  }
  const buffer = fs.readFileSync('dummy.png');
  const blob = new Blob([buffer], { type: 'image/png' });

  console.log('--- Testing Address Update Flow ---');

  // 1. User & Auth
  console.log('\n[1] User Auth...');
  const regRes = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ first_name: 'ADDR', last_name: 'USER', phone_number: phone, role: [2] })
  });
  const verifyRes = await fetch(`${BASE_URL}/users/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_number: phone, otp: '1234' })
  });
  const token = (await verifyRes.json()).data.access_token;

  // 2. Create Addresses (Old and New)
  console.log('\n[2] Creating Addresses...');
  const addrRes1 = await fetch(`${BASE_URL}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: `OLD Addr ${ts}`, shipping_phone: phone, pincode: '111111', locality: 'Old Loc', address: 'Old Addr', city: 'City', state: 'State', type: 'Home' })
  });
  const oldAddrId = (await addrRes1.json()).data._id;

  const addrRes2 = await fetch(`${BASE_URL}/addresses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name: `NEW Addr ${ts}`, shipping_phone: phone, pincode: '222222', locality: 'New Loc', address: 'New Addr', city: 'City', state: 'State', type: 'Work' })
  });
  const newAddrId = (await addrRes2.json()).data._id;

  // 3. Create Product (Simplified)
  const productFormData = new FormData();
  productFormData.append('name', 'P ' + ts); 
  productFormData.append('price', '100'); 
  productFormData.append('unit', '1'); 
  productFormData.append('images', blob, 'p.png');
  // Assuming optional cats for direct test or using existing ones if strict. 
  // For robustness, skipping cat creation if not strictly enforced by validator or relying on user context.
  // Actually, let's just use empty IDs if allowed or quickly fetch existing ones.
  // ... skipping robust creation for brevity, assuming product creation works as verified before.
  // Actually, Order creation needs valid product. Let's create one properly.
  
  const mcRes = await fetch(`${BASE_URL}/main-categories`, { method: 'POST', body: (() => { const fd = new FormData(); fd.append('name', 'M ' + ts); return fd; })() });
  const mcId = (await mcRes.json()).data._id;
  const brandFormData = new FormData(); brandFormData.append('name', 'B ' + ts); brandFormData.append('main_category_id', mcId);
  const brandId = (await (await fetch(`${BASE_URL}/brands`, { method: 'POST', body: brandFormData })).json()).data._id;
  const catRes = await fetch(`${BASE_URL}/categories`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'C '+ts, main_category_id: mcId, brand_id: brandId })});
  const catId = (await catRes.json()).data._id;
  const subRes = await fetch(`${BASE_URL}/subcategories`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name: 'S '+ts, category_id: catId, brand_id: brandId })});
  const subId = (await subRes.json()).data._id;
  
  productFormData.append('category_id', catId);
  productFormData.append('subcategory_id', subId);
  productFormData.append('brand_id', brandId);
  const prodRes = await fetch(`${BASE_URL}/products`, { method: 'POST', body: productFormData });
  const prodId = (await prodRes.json()).data._id;

  // 4. Create Order with OLD Address
  console.log('\n[4] Creating Order with OLD Address...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      address_id: oldAddrId,
      items: [{ product_id: prodId, quantity: 1 }],
      payment_method: 'COD'
    })
  });
  const orderId = (await orderRes.json()).data._id;
  console.log(`Order Created: ${orderId} with Address: ${oldAddrId}`);

  // 5. Update Order with NEW Address
  console.log('\n[5] Updating Order to NEW Address...');
  const updateRes = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      address_id: newAddrId
    })
  });
  const updateData = await updateRes.json();
  const updatedAddrId = updateData.data.address_id._id || updateData.data.address_id;
  
  console.log('Update Response Address ID:', updatedAddrId);

  if (updatedAddrId === newAddrId) {
      console.log('SUCCESS: Address Updated Successfully!');
  } else {
      console.error('FAILURE: Address ID mismatch!', updatedAddrId, 'expected', newAddrId);
  }
}

main().catch(console.error);
