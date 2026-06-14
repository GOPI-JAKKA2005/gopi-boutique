import { adminDb, FieldValue } from "./firebaseAdmin.js";

const products = [
  {
    name: "Women Bridal Couture Look",
    description: "Designer blouse, lehenga, gown, and ethnic wear inspiration for the women collection.",
    price: 28500,
    discountPrice: 24900,
    category: "Women",
    brand: "Bell Couture",
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80"],
    stock: 8,
    rating: 4.9,
    reviewCount: 42,
    isFeatured: true,
    status: "active",
  },
  {
    name: "Men Traditional Sherwani Edit",
    description: "Custom groom sherwani and festive men's traditional wear collection post.",
    price: 42000,
    discountPrice: 39500,
    category: "Men",
    brand: "Bell Couture",
    imageUrl: "https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1600091166971-7f9faad6c1e2?auto=format&fit=crop&w=900&q=80"],
    stock: 6,
    rating: 4.8,
    reviewCount: 16,
    isFeatured: true,
    status: "active",
  },
  {
    name: "Kids Festive Collection",
    description: "Comfort-first kids festive wear with lightweight embroidery and soft lining.",
    price: 12500,
    discountPrice: 10900,
    category: "Kids",
    brand: "Celebration Wear",
    imageUrl: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=80",
    images: ["https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?auto=format&fit=crop&w=900&q=80"],
    stock: 13,
    rating: 4.5,
    reviewCount: 22,
    isFeatured: true,
    status: "active",
  },
];

const batch = adminDb.batch();

for (const product of products) {
  const ref = adminDb.collection("products").doc();
  batch.set(ref, {
    ...product,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

await batch.commit();
console.log(`Seeded ${products.length} boutique products.`);

