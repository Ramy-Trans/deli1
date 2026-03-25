import { db } from "@workspace/db";
import {
  categoriesTable,
  productsTable,
  addOnsTable,
  productVariantsTable,
  branchesTable,
  couponsTable,
  usersTable,
} from "@workspace/db/schema";
import crypto from "crypto";
import { eq } from "drizzle-orm";

function hashPassword(pw: string): string {
  return crypto.createHash("sha256").update(pw + "seagull_salt").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Branches
  await db.delete(branchesTable);
  const branches = await db
    .insert(branchesTable)
    .values([
      {
        name: "Sea Gull Sheikh Zayed",
        nameAr: "سي غال الشيخ زايد",
        address: "Beverly Hills, Sheikh Zayed City",
        area: "Sheikh Zayed",
        city: "Giza",
        phone: "+20 2 3827-1234",
        latitude: "30.0444",
        longitude: "30.9867",
        acceptsDelivery: true,
        acceptsPickup: true,
      },
      {
        name: "Sea Gull Fifth Settlement",
        nameAr: "سي غال التجمع الخامس",
        address: "South Academy, Fifth Settlement",
        area: "Fifth Settlement",
        city: "Cairo",
        phone: "+20 2 2618-5678",
        latitude: "30.0131",
        longitude: "31.4703",
        acceptsDelivery: true,
        acceptsPickup: true,
      },
      {
        name: "Sea Gull Madinaty",
        nameAr: "سي غال مدينتي",
        address: "Madinaty Gate 1, New Cairo East",
        area: "Madinaty",
        city: "Cairo",
        phone: "+20 2 2618-9012",
        latitude: "30.1167",
        longitude: "31.6500",
        acceptsDelivery: true,
        acceptsPickup: true,
      },
      {
        name: "Sea Gull 6th of October",
        nameAr: "سي غال السادس من أكتوبر",
        address: "Waslet Dahshur Road, 6th of October City",
        area: "6th of October",
        city: "Giza",
        phone: "+20 2 3829-3456",
        latitude: "29.9697",
        longitude: "30.9180",
        acceptsDelivery: true,
        acceptsPickup: true,
      },
    ])
    .returning();

  // Categories
  await db.delete(categoriesTable);
  const categories = await db
    .insert(categoriesTable)
    .values([
      { name: "Seafood", nameAr: "مأكولات بحرية", icon: "fish", sortOrder: 1 },
      { name: "Grilled", nameAr: "مشويات", icon: "flame", sortOrder: 2 },
      { name: "Shrimp", nameAr: "جمبري", icon: "fish-outline", sortOrder: 3 },
      { name: "Salads", nameAr: "سلطات", icon: "leaf", sortOrder: 4 },
      { name: "Soups", nameAr: "شوربات", icon: "cafe", sortOrder: 5 },
      { name: "Family Meals", nameAr: "وجبات عائلية", icon: "people", sortOrder: 6 },
      { name: "Kids Menu", nameAr: "قائمة الأطفال", icon: "happy", sortOrder: 7 },
      { name: "Desserts", nameAr: "حلويات", icon: "ice-cream", sortOrder: 8 },
      { name: "Beverages", nameAr: "مشروبات", icon: "wine", sortOrder: 9 },
    ])
    .returning();

  const [seafood, grilled, shrimp, salads, soups, family, kids, desserts, beverages] = categories;

  // Products
  await db.delete(productsTable);
  const products = await db
    .insert(productsTable)
    .values([
      // Seafood
      {
        categoryId: seafood.id,
        name: "Sultan Ibrahim (Red Mullet)",
        nameAr: "سلطان إبراهيم",
        description: "Fresh Red Mullet fish, grilled or fried to perfection with our signature seasoning blend. Served with rice and salad.",
        price: "185.00",
        imageUrl: "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?w=800",
        prepTime: 20,
        spiceLevel: "mild",
        isFeatured: true,
        isBestSeller: true,
        calories: 320,
        tags: JSON.stringify(["grilled", "fresh", "local"]),
        rating: "4.9",
        reviewCount: 248,
        sortOrder: 1,
      },
      {
        categoryId: seafood.id,
        name: "Sea Bass (Qarous)",
        nameAr: "قاروص",
        description: "Premium Sea Bass prepared with lemon herb butter sauce. A Mediterranean delicacy at its finest.",
        price: "220.00",
        discountedPrice: "195.00",
        imageUrl: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800",
        prepTime: 25,
        spiceLevel: "none",
        isFeatured: true,
        calories: 280,
        tags: JSON.stringify(["premium", "mediterranean"]),
        rating: "4.8",
        reviewCount: 156,
        sortOrder: 2,
      },
      {
        categoryId: seafood.id,
        name: "Sea Bream (Denees)",
        nameAr: "دينيس",
        description: "Whole sea bream, char-grilled with olive oil, garlic, and fresh herbs. Simply exquisite.",
        price: "175.00",
        imageUrl: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?w=800",
        prepTime: 20,
        spiceLevel: "mild",
        isBestSeller: true,
        calories: 260,
        tags: JSON.stringify(["grilled", "healthy"]),
        rating: "4.7",
        reviewCount: 189,
        sortOrder: 3,
      },
      {
        categoryId: seafood.id,
        name: "Calamari Rings",
        nameAr: "حلقات كاليماري",
        description: "Crispy golden calamari rings served with our house garlic aioli and lemon wedges.",
        price: "95.00",
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
        prepTime: 15,
        spiceLevel: "none",
        isNew: true,
        calories: 380,
        tags: JSON.stringify(["fried", "starter"]),
        rating: "4.6",
        reviewCount: 312,
        sortOrder: 4,
      },
      // Grilled
      {
        categoryId: grilled.id,
        name: "Mixed Seafood Grill",
        nameAr: "مشكل مشويات بحرية",
        description: "A magnificent platter of grilled lobster tail, sea bass, shrimp, and calamari with herbs.",
        price: "380.00",
        imageUrl: "https://images.unsplash.com/photo-1611599538835-b52a8c2f9081?w=800",
        prepTime: 35,
        spiceLevel: "mild",
        isFeatured: true,
        isBestSeller: true,
        calories: 650,
        tags: JSON.stringify(["premium", "platter", "grilled"]),
        rating: "4.9",
        reviewCount: 421,
        sortOrder: 1,
      },
      {
        categoryId: grilled.id,
        name: "Grilled Octopus",
        nameAr: "أخطبوط مشوي",
        description: "Tender charred octopus with smoked paprika, olive oil, and a zesty lemon dressing.",
        price: "195.00",
        imageUrl: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=800",
        prepTime: 30,
        spiceLevel: "mild",
        isNew: true,
        calories: 290,
        rating: "4.7",
        reviewCount: 98,
        sortOrder: 2,
      },
      // Shrimp
      {
        categoryId: shrimp.id,
        name: "King Prawns Thermidor",
        nameAr: "جمبري ثيرميدور ملكي",
        description: "Jumbo king prawns in a rich creamy Thermidor sauce, gratinated with Gruyère cheese.",
        price: "245.00",
        imageUrl: "https://images.unsplash.com/photo-1565680018434-b2f1bcc02f3a?w=800",
        prepTime: 20,
        spiceLevel: "none",
        isFeatured: true,
        calories: 520,
        tags: JSON.stringify(["premium", "creamy"]),
        rating: "4.9",
        reviewCount: 203,
        sortOrder: 1,
      },
      {
        categoryId: shrimp.id,
        name: "Garlic Butter Shrimp",
        nameAr: "جمبري بالزبدة والثوم",
        description: "Succulent shrimp sautéed in garlic butter sauce with white wine and fresh parsley.",
        price: "145.00",
        imageUrl: "https://images.unsplash.com/photo-1574069498000-2c1174f5b08f?w=800",
        prepTime: 15,
        spiceLevel: "none",
        isBestSeller: true,
        calories: 410,
        rating: "4.8",
        reviewCount: 367,
        sortOrder: 2,
      },
      {
        categoryId: shrimp.id,
        name: "Spicy Chilli Shrimp",
        nameAr: "جمبري حار بالفلفل",
        description: "Bold and fiery shrimp stir-fried with red chillis, garlic, and aromatic spices.",
        price: "135.00",
        imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800",
        prepTime: 15,
        spiceLevel: "hot",
        calories: 380,
        rating: "4.6",
        reviewCount: 145,
        sortOrder: 3,
      },
      // Salads
      {
        categoryId: salads.id,
        name: "Seafood Caesar Salad",
        nameAr: "سلطة سيزر بالمأكولات البحرية",
        description: "Classic Caesar salad topped with grilled shrimp and calamari, house-made dressing.",
        price: "85.00",
        imageUrl: "https://images.unsplash.com/photo-1551248429-40975aa4de74?w=800",
        prepTime: 10,
        spiceLevel: "none",
        isHealthy: true,
        isVegetarian: false,
        calories: 320,
        rating: "4.5",
        reviewCount: 189,
        sortOrder: 1,
      },
      // Soups
      {
        categoryId: soups.id,
        name: "Lobster Bisque",
        nameAr: "شوربة لوبستر",
        description: "Velvety smooth lobster bisque with a touch of cognac and fresh cream. An indulgent classic.",
        price: "75.00",
        imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=800",
        prepTime: 10,
        spiceLevel: "none",
        isFeatured: true,
        calories: 280,
        rating: "4.8",
        reviewCount: 134,
        sortOrder: 1,
      },
      {
        categoryId: soups.id,
        name: "Seafood Chowder",
        nameAr: "يخنة المأكولات البحرية",
        description: "Hearty New England-style chowder loaded with clams, shrimp, and fish in cream broth.",
        price: "65.00",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        prepTime: 10,
        spiceLevel: "none",
        calories: 350,
        rating: "4.6",
        reviewCount: 97,
        sortOrder: 2,
      },
      // Family Meals
      {
        categoryId: family.id,
        name: "Family Seafood Feast",
        nameAr: "وليمة المأكولات البحرية العائلية",
        description: "Serves 4-6. A spectacular spread of whole fish, mixed grilled seafood, rice, salads and sides.",
        price: "895.00",
        imageUrl: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
        prepTime: 45,
        spiceLevel: "mild",
        isFeatured: true,
        isBestSeller: true,
        calories: 3200,
        tags: JSON.stringify(["family", "serves-4-6", "value"]),
        rating: "4.9",
        reviewCount: 287,
        sortOrder: 1,
      },
      // Kids Menu
      {
        categoryId: kids.id,
        name: "Kids Fish & Chips",
        nameAr: "سمكة وبطاطس للأطفال",
        description: "Tender fish fillets in crispy golden batter with chunky chips and ketchup.",
        price: "65.00",
        imageUrl: "https://images.unsplash.com/photo-1612392062798-fdf4f5d3df08?w=800",
        prepTime: 15,
        spiceLevel: "none",
        calories: 480,
        tags: JSON.stringify(["kids"]),
        rating: "4.7",
        reviewCount: 156,
        sortOrder: 1,
      },
      // Desserts
      {
        categoryId: desserts.id,
        name: "Crème Brûlée",
        nameAr: "كريم بروليه",
        description: "Classic French custard with a perfectly caramelized sugar crust. A timeless indulgence.",
        price: "55.00",
        imageUrl: "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=800",
        prepTime: 5,
        spiceLevel: "none",
        isVegetarian: true,
        calories: 420,
        rating: "4.8",
        reviewCount: 203,
        sortOrder: 1,
      },
      // Beverages
      {
        categoryId: beverages.id,
        name: "Fresh Lemonade",
        nameAr: "عصير ليمون طازج",
        description: "Freshly squeezed lemons with mint and a hint of rose water.",
        price: "35.00",
        imageUrl: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800",
        prepTime: 5,
        spiceLevel: "none",
        isVegetarian: true,
        isHealthy: true,
        calories: 120,
        rating: "4.7",
        reviewCount: 445,
        sortOrder: 1,
      },
      {
        categoryId: beverages.id,
        name: "Mango Lassi",
        nameAr: "لاسي المانجو",
        description: "Creamy blended mango with yogurt and a hint of cardamom. Refreshingly tropical.",
        price: "40.00",
        imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800",
        prepTime: 5,
        spiceLevel: "none",
        isVegetarian: true,
        calories: 180,
        rating: "4.6",
        reviewCount: 189,
        sortOrder: 2,
      },
    ])
    .returning();

  // Add-ons for first product
  const sultanIbrahimProduct = products.find(p => p.name === "Sultan Ibrahim (Red Mullet)");
  if (sultanIbrahimProduct) {
    await db.insert(addOnsTable).values([
      { productId: sultanIbrahimProduct.id, name: "Extra Rice", nameAr: "أرز إضافي", price: "15.00" },
      { productId: sultanIbrahimProduct.id, name: "Tahini Sauce", nameAr: "صلصة طحينة", price: "10.00" },
      { productId: sultanIbrahimProduct.id, name: "Extra Lemon", nameAr: "ليمون إضافي", price: "5.00" },
    ]);

    await db.insert(productVariantsTable).values([
      { productId: sultanIbrahimProduct.id, name: "Grilled", nameAr: "مشوي", priceDiff: "0", isDefault: true },
      { productId: sultanIbrahimProduct.id, name: "Fried", nameAr: "مقلي", priceDiff: "0" },
      { productId: sultanIbrahimProduct.id, name: "Baked", nameAr: "في الفرن", priceDiff: "15.00" },
    ]);
  }

  const mixedGrillProduct = products.find(p => p.name === "Mixed Seafood Grill");
  if (mixedGrillProduct) {
    await db.insert(addOnsTable).values([
      { productId: mixedGrillProduct.id, name: "Extra Bread", nameAr: "خبز إضافي", price: "10.00" },
      { productId: mixedGrillProduct.id, name: "Garlic Butter", nameAr: "زبدة بالثوم", price: "15.00" },
      { productId: mixedGrillProduct.id, name: "Extra Salad", nameAr: "سلطة إضافية", price: "20.00" },
    ]);
  }

  // Coupons
  await db.delete(couponsTable);
  await db.insert(couponsTable).values([
    {
      code: "WELCOME20",
      description: "20% off your first order",
      discountType: "percentage",
      discountValue: "20",
      maxDiscount: "100",
      minOrderAmount: "100",
    },
    {
      code: "SEAGULL50",
      description: "EGP 50 off any order",
      discountType: "fixed",
      discountValue: "50",
      minOrderAmount: "200",
    },
    {
      code: "FREEDEL",
      description: "Free delivery on your order",
      discountType: "free_delivery",
      discountValue: "0",
      minOrderAmount: "150",
    },
  ]);

  // Branch admin accounts
  const allBranches = await db.select().from(branchesTable);
  const branchAdmins = [
    { area: "Sheikh Zayed",    email: "sheikzayed@seagull.com",      password: "SheikhZayed@Admin2025!",     name: "Sheikh Zayed Admin",     phone: "+20100000001" },
    { area: "Fifth Settlement",email: "fifthsettlement@seagull.com", password: "FifthSettlement@Admin2025!", name: "Fifth Settlement Admin", phone: "+20100000002" },
    { area: "Madinaty",        email: "madinaty@seagull.com",        password: "Madinaty@Admin2025!",        name: "Madinaty Admin",         phone: "+20100000003" },
    { area: "6th of October",  email: "october@seagull.com",         password: "October@Admin2025!",         name: "6th of October Admin",   phone: "+20100000004" },
  ];
  for (const admin of branchAdmins) {
    const branch = allBranches.find(b => b.area === admin.area);
    if (!branch) continue;
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, admin.email)).limit(1);
    if (existing.length === 0) {
      await db.insert(usersTable).values({
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        passwordHash: hashPassword(admin.password),
        role: "admin",
        branchId: branch.id,
        isActive: true,
        preferredLanguage: "en",
        darkMode: false,
        loyaltyPoints: 0,
      });
      console.log(`Created admin for ${admin.area}: ${admin.email}`);
    } else {
      console.log(`Admin already exists for ${admin.area}: ${admin.email}`);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
