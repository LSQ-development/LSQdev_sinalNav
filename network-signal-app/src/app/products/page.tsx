"use client";

import { Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const products = [
  {
    id: 1,
    name: "5G Router",
    image: "/images/image1.png",
    description: "High-speed 5G wireless router for home and office",
    price: "R1,499.99",
    category: "Hardware",
  },
  {
    id: 2,
    name: "Signal Booster",
    image: "/images/image2.png",
    description: "Enhanced network signal amplifier for remote areas",
    price: "R899.99",
    category: "Hardware",
  },
  {
    id: 3,
    name: "Premium Data Plan",
    image: "/images/image1.png",
    description: "Unlimited data with priority network access",
    price: "R599/month",
    category: "Service",
  },
  {
    id: 4,
    name: "WiFi Extender",
    image: "/images/image2.png",
    description: "Extend your WiFi coverage up to 1,500 sq ft",
    price: "R799.99",
    category: "Hardware",
  },
];

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col p-4 pb-20">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Package className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">Our Products</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {product.category}
                </span>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <p className="text-xl font-bold text-blue-600">
                  {product.price}
                </p>
                <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                  Learn More
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
