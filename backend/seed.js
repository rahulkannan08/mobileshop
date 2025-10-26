require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Models
const User = require('./models/User');
const Brand = require('./models/Brand');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const Review = require('./models/Review');

const dataFiles = {
  users: 'mobile_shop.users.json',
  brands: 'mobile_shop.brands.json',
  categories: 'mobile_shop.categories.json',
  products: 'mobile_shop.products.json',
  carts: 'mobile_shop.carts.json',
  orders: 'mobile_shop.orders.json',
  reviews: 'mobile_shop.reviews.json'
};

function convertExtendedJson(value) {
  // recursively convert MongoDB Extended JSON ($oid, $date)
  if (Array.isArray(value)) return value.map(convertExtendedJson);

  if (value && typeof value === 'object') {
    // { "$oid": "..." } -> ObjectId
    if (Object.keys(value).length === 1 && value.$oid) {
      return new mongoose.Types.ObjectId(value.$oid);
    }
    // { "$date": "..." } -> Date
    if (Object.keys(value).length === 1 && value.$date) {
      return new Date(value.$date);
    }
    // otherwise recurse properties
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = convertExtendedJson(value[k]);
    }
    return out;
  }

  return value;
}

function readAndNormalize(fileName) {
  const filePath = path.join(__dirname, fileName);
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  // Some files may contain trailing commas or invalid JSON; parse robustly
  const parsed = JSON.parse(raw);
  return parsed.map(doc => convertExtendedJson(doc));
}

async function importCollection(Model, docs, name) {
  if (!docs || docs.length === 0) {
    console.log(`- ${name}: no documents to import`);
    return;
  }
  await Model.deleteMany({});
  await Model.insertMany(docs, { ordered: false });
  console.log(`- ${name}: imported ${docs.length}`);
}

async function seed() {
  try {
    console.log('🌱 Starting DB seed...');
    await connectDB();

    const users = readAndNormalize(dataFiles.users);
    const brands = readAndNormalize(dataFiles.brands);
    const categories = readAndNormalize(dataFiles.categories);
    const products = readAndNormalize(dataFiles.products);
    const carts = readAndNormalize(dataFiles.carts);
    const orders = readAndNormalize(dataFiles.orders);
    const reviews = readAndNormalize(dataFiles.reviews);

    // Insert in order to satisfy references
    await importCollection(User, users, 'users');
    await importCollection(Brand, brands, 'brands');
    await importCollection(Category, categories, 'categories');
    await importCollection(Product, products, 'products');
    await importCollection(Cart, carts, 'carts');
    await importCollection(Order, orders, 'orders');
    await importCollection(Review, reviews, 'reviews');

    console.log('🎉 Seeding complete.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeder error:', err);
    try { await mongoose.connection.close(); } catch (e) {}
    process.exit(1);
  }
}

seed();
