import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  ShoppingBag, Star, Plus, Minus, X, ShoppingCart, CheckCircle, MapPin
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { trpc } from "@/lib/trpc";
import { usePaystack } from "@/hooks/usePaystack";
import { toast } from "sonner";
import { nanoid } from "nanoid";

type StoreProduct = {
  id: number;
  name: string;
  category: string;
  price: number;
  memberPrice?: number;
  vipPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  badge: string | null;
  colors: string[];
  sizes: string[];
  description: string;
  stock?: number;
};

const PRODUCTS: StoreProduct[] = [
  {
    id: 1, name: "Hike Kings Classic Tee", category: "apparel",
    price: 8000, memberPrice: 7200, vipPrice: 6400,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80",
    rating: 0, reviews: 0, badge: "Best Seller",
    colors: ["Forest Green", "Charcoal", "Sand"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    description: "Premium quality cotton tee with the iconic Hike Kings logo. Perfect for trails and everyday wear.",
  },
  {
    id: 2, name: "Adventure Cap", category: "accessories",
    price: 6000, memberPrice: 5400, vipPrice: 4800,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80",
    rating: 0, reviews: 0, badge: "Top Rated",
    colors: ["Black", "Olive", "Navy"],
    sizes: ["One Size"],
    description: "Structured 6-panel cap with embroidered Hike Kings crown logo. UV protection included.",
  },
  {
    id: 3, name: "Trail Water Bottle (1L)", category: "gear",
    price: 12000, memberPrice: 10800, vipPrice: 9600,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
    rating: 0, reviews: 0, badge: "New",
    colors: ["Silver", "Black", "Gold"],
    sizes: ["1L"],
    description: "Insulated stainless steel bottle keeps drinks cold for 24 hours. Leak-proof lid.",
  },
  {
    id: 4, name: "Explorer Backpack (30L)", category: "gear",
    price: 45000, memberPrice: 40500, vipPrice: 36000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    rating: 0, reviews: 0, badge: "Premium",
    colors: ["Forest Green", "Black"],
    sizes: ["30L"],
    description: "Durable 30L hiking backpack with hydration bladder compartment, rain cover, and ergonomic straps.",
  },
  {
    id: 5, name: "Hike Kings Hoodie", category: "apparel",
    price: 18000, memberPrice: 16200, vipPrice: 14400,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80",
    rating: 0, reviews: 0, badge: "Popular",
    colors: ["Charcoal", "Forest Green", "Black"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    description: "Heavyweight fleece hoodie with kangaroo pocket and embroidered logo. Perfect for cool mornings.",
  },
  {
    id: 6, name: "Trekking Poles (Pair)", category: "gear",
    price: 25000, memberPrice: 22500, vipPrice: 20000,
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80",
    rating: 0, reviews: 0, badge: null,
    colors: ["Aluminum"],
    sizes: ["Adjustable"],
    description: "Lightweight aluminum trekking poles with anti-shock system and ergonomic cork handles.",
  },
  {
    id: 7, name: "Adventure Bandana", category: "accessories",
    price: 3000, memberPrice: 2700, vipPrice: 2400,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
    rating: 0, reviews: 0, badge: null,
    colors: ["Green", "Black", "Orange"],
    sizes: ["One Size"],
    description: "Multi-purpose bandana with Hike Kings pattern. Use as headband, neck gaiter, or dust mask.",
  },
  {
    id: 8, name: "Trail Socks (3-Pack)", category: "apparel",
    price: 5000, memberPrice: 4500, vipPrice: 4000,
    image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80",
    rating: 0, reviews: 0, badge: "Value Pack",
    colors: ["Mixed"],
    sizes: ["S/M", "L/XL"],
    description: "Cushioned hiking socks with moisture-wicking technology. Reduces blisters on long trails.",
  },
];

const CATEGORIES = ["all", "apparel", "accessories", "gear", "drinkware"];
const DEMO_STORE_ENABLED = import.meta.env.VITE_STORE_DEMO_MODE === "true";

const asStringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value) && value.length > 0
    ? value.filter((item): item is string => typeof item === "string")
    : fallback;

const normalizeLiveProducts = (rows: unknown[]): StoreProduct[] =>
  rows.map((row) => {
    const product = row as Record<string, unknown>;
    const price = Number(product.price ?? 0);
    return {
      id: Number(product.id),
      name: String(product.name ?? "Hike Kings product"),
      category: String(product.category ?? "apparel"),
      price,
      memberPrice: Math.round(price * 0.9),
      vipPrice: Math.round(price * 0.8),
      image: String(product.imageUrl || "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80"),
      rating: 0,
      reviews: 0,
      badge: product.featured ? "Featured" : null,
      colors: asStringArray(product.colors, ["Standard"]),
      sizes: asStringArray(product.sizes, ["One Size"]),
      description: String(product.description ?? "Official Hike Kings & Tours merchandise."),
      stock: Number(product.stock ?? 0),
    };
  });

interface CartItem {
  product: StoreProduct;
  qty: number;
  color: string;
  size: string;
}

export default function Store() {
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<StoreProduct | null>(null);
  const [selectedColor, setSelectedColor] = useState<Record<number, string>>({});
  const [selectedSize, setSelectedSize] = useState<Record<number, string>>({});
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: dbProducts, isLoading: productsLoading, isError: productsError } = trpc.store.list.useQuery({});
  const products = productsLoading
    ? []
    : dbProducts && dbProducts.length > 0
      ? normalizeLiveProducts(dbProducts)
      : DEMO_STORE_ENABLED
        ? PRODUCTS
        : [];

  const pay = usePaystack();
  const createOrder = trpc.store.createOrder.useMutation();
  const confirmPayment = trpc.store.confirmPayment.useMutation();

  const getPrice = (p: StoreProduct) => {
    const authUser = user as { membershipType?: string } | null;
    if (authUser?.membershipType === "vip") return p.vipPrice ?? p.price;
    if (authUser?.membershipType === "regular") return p.memberPrice ?? p.price;
    return p.price;
  };
  const fmt = (n: number) => `₦${n.toLocaleString("en-NG")}`;

  const addToCart = (product: StoreProduct) => {
    const color = selectedColor[product.id] || product.colors[0] || "Standard";
    const size = selectedSize[product.id] || product.sizes[0] || "One Size";
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id && i.color === color && i.size === size);
      if (existing) return prev.map((i) => i === existing ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1, color, size }];
    });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (idx: number) => setCart((prev) => prev.filter((_, i) => i !== idx));
  const updateQty = (idx: number, delta: number) => setCart((prev) =>
    prev.map((item, i) => i === idx ? { ...item, qty: Math.max(1, item.qty + delta) } : item)
  );

  const cartTotal = cart.reduce((sum, item) => sum + getPrice(item.product) * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCheckout = async () => {
    if (!user) return;
    if (!deliveryAddress.trim()) {
      setShowAddressForm(true);
      return;
    }
    setIsProcessing(true);
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        qty: item.qty,
        price: String(getPrice(item.product)),
        size: item.size,
        color: item.color,
      }));
      const totalAmount = String(cartTotal);
      const { orderRef } = await createOrder.mutateAsync({ items, totalAmount, deliveryAddress });

      const authUser = user as { email?: string };
      pay({
        email: authUser.email ?? "customer@hikekings.com",
        amount: cartTotal * 100, // kobo
        ref: `ORDER-${orderRef}-${nanoid(6)}`,
        metadata: { orderRef },
        onSuccess: async (paymentRef) => {
          await confirmPayment.mutateAsync({ orderRef, paymentRef });
          setCart([]);
          setCartOpen(false);
          setOrderSuccess(orderRef);
          setShowAddressForm(false);
          setDeliveryAddress("");
          toast.success(`Order ${orderRef} confirmed! We'll contact you for delivery.`);
        },
        onClose: () => {
          toast.info("Payment cancelled. Your order is saved — you can pay later.");
        },
      });
    } catch {
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      {/* Order Success Banner */}
      {orderSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <div className="font-bold">Order Confirmed!</div>
            <div className="text-sm opacity-90">Order #{orderSuccess} — we'll contact you for delivery details.</div>
          </div>
          <button onClick={() => setOrderSuccess(null)} className="ml-4 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="pt-24 pb-12 bg-[oklch(0.09_0.012_240)]">
        <div className="container flex items-end justify-between">
          <div>
            <div className="section-label mb-4">Official Gear</div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-3">Hike Kings Store</h1>
            <p className="text-[oklch(0.62_0.02_240)]">Premium adventure gear and branded merchandise. Members save up to 20%.</p>
          </div>
          <button onClick={() => setCartOpen(true)} className="relative btn-outline-gold">
            <ShoppingCart className="w-5 h-5" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--gold)] text-[oklch(0.08_0.01_240)] text-xs font-bold flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 bg-[oklch(0.10_0.015_240)] border-b border-white/5 py-4">
        <div className="container flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-sm text-white placeholder-[oklch(0.45_0.02_240)] focus:outline-none focus:border-[var(--gold)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${category === cat ? "bg-[var(--gold)] text-[oklch(0.08_0.01_240)]" : "bg-[var(--muted)] text-[oklch(0.62_0.02_240)] hover:text-white"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container py-12">
        {productsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-80 rounded-2xl bg-white/5 animate-pulse" />)}
          </div>
        ) : productsError ? (
          <div className="text-center py-24 glass-card rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Store temporarily unavailable</h2>
            <p className="text-white/50">Please try again shortly or contact Hike Kings & Tours for assistance.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-white/30 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No products available</h2>
            <p className="text-white/50">Our store team is preparing the next collection. Please check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <div key={product.id} className="glass-card rounded-2xl overflow-hidden group">
                <div className="relative overflow-hidden" style={{ height: "220px" }}>
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  {product.badge && (
                    <div className="absolute top-3 left-3">
                      <span className="badge-pill badge-gold text-xs">{product.badge}</span>
                    </div>
                  )}
                  <button onClick={() => setQuickView(product)}
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/90 text-[oklch(0.08_0.01_240)] text-xs font-bold px-4 py-2 rounded-full">Quick View</span>
                  </button>
                </div>
                <div className="p-5">
                  <div className="text-xs text-[oklch(0.45_0.02_240)] uppercase tracking-wider mb-1">{product.category}</div>
                  <h3 className="font-semibold text-white mb-2">{product.name}</h3>
                  {product.rating > 0 ? (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < Math.floor(product.rating) ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[oklch(0.35_0.02_240)]"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-[oklch(0.55_0.02_240)]">({product.reviews})</span>
                    </div>
                  ) : <div className="h-5 mb-3" />}
                  <div className="flex items-center justify-between">
                    <span className="font-hero text-xl text-[var(--gold)]">{fmt(getPrice(product))}</span>
                    <button onClick={() => addToCart(product)} className="btn-gold text-xs py-2 px-3">
                      <ShoppingCart className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setQuickView(null)}>
          <div className="glass-card max-w-2xl w-full rounded-3xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto">
                <img src={quickView.image} alt={quickView.name} className="w-full h-full object-cover" />
                <button onClick={() => setQuickView(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-8">
                <div className="text-xs text-[oklch(0.45_0.02_240)] uppercase tracking-wider mb-2">{quickView.category}</div>
                <h3 className="font-display text-2xl font-bold text-white mb-3">{quickView.name}</h3>
                {quickView.rating > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} className={`w-3.5 h-3.5 ${j < Math.floor(quickView.rating) ? "fill-[var(--gold)] text-[var(--gold)]" : "text-[oklch(0.35_0.02_240)]"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-[oklch(0.55_0.02_240)]">{quickView.rating} ({quickView.reviews} reviews)</span>
                  </div>
                )}
                <p className="text-sm text-[oklch(0.65_0.02_240)] mb-5 leading-relaxed">{quickView.description}</p>
                <div className="mb-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2">Color</div>
                  <div className="flex gap-2 flex-wrap">
                    {quickView.colors.map((color) => (
                      <button key={color} onClick={() => setSelectedColor((p) => ({ ...p, [quickView.id]: color }))}
                        className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${(selectedColor[quickView.id] || quickView.colors[0] || "Standard") === color ? "border-[var(--gold)] text-[var(--gold)]" : "border-[var(--border)] text-[oklch(0.62_0.02_240)]"}`}>
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
                {quickView.sizes.length > 1 && (
                  <div className="mb-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-[oklch(0.55_0.02_240)] mb-2">Size</div>
                    <div className="flex gap-2 flex-wrap">
                      {quickView.sizes.map((size) => (
                        <button key={size} onClick={() => setSelectedSize((p) => ({ ...p, [quickView.id]: size }))}
                          className={`w-10 h-10 rounded-lg text-xs font-semibold border transition-all ${(selectedSize[quickView.id] || quickView.sizes[0] || "One Size") === size ? "border-[var(--gold)] text-[var(--gold)] bg-[oklch(0.72_0.18_75/0.1)]" : "border-[var(--border)] text-[oklch(0.62_0.02_240)]"}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                  <span className="font-hero text-3xl text-[var(--gold)]">{fmt(getPrice(quickView))}</span>
                  <button onClick={() => { addToCart(quickView); setQuickView(null); }} className="btn-gold">
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-[var(--card)] border-l border-[var(--border)] flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
              <h3 className="font-display text-xl font-bold text-white">Cart ({cartCount})</h3>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-lg bg-[var(--muted)] flex items-center justify-center text-[oklch(0.62_0.02_240)] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-[oklch(0.35_0.02_240)] mx-auto mb-4" />
                  <p className="text-[oklch(0.55_0.02_240)]">Your cart is empty</p>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl bg-[var(--muted)]">
                    <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{item.product.name}</div>
                      <div className="text-xs text-[oklch(0.55_0.02_240)] mt-0.5">{item.color} · {item.size}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(idx, -1)} className="w-6 h-6 rounded-full bg-[var(--stone)] flex items-center justify-center text-white hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)] transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-semibold text-white w-5 text-center">{item.qty}</span>
                          <button onClick={() => updateQty(idx, 1)} className="w-6 h-6 rounded-full bg-[var(--stone)] flex items-center justify-center text-white hover:bg-[var(--gold)] hover:text-[oklch(0.08_0.01_240)] transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-hero text-[var(--gold)]">{fmt(getPrice(item.product) * item.qty)}</span>
                          <button onClick={() => removeFromCart(idx)} className="text-[oklch(0.45_0.02_240)] hover:text-red-400 transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-[var(--border)] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[oklch(0.65_0.02_240)]">Subtotal</span>
                  <span className="font-hero text-2xl text-[var(--gold)]">{fmt(cartTotal)}</span>
                </div>

                {/* Delivery address form */}
                {showAddressForm && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[oklch(0.62_0.02_240)] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Delivery Address
                    </label>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] text-white text-sm focus:outline-none focus:border-[var(--gold)] transition-colors resize-none"
                    />
                  </div>
                )}

                {isAuthenticated ? (
                  <button
                    onClick={handleCheckout}
                    disabled={isProcessing}
                    className="btn-gold w-full justify-center py-4 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : showAddressForm ? "Pay Now" : "Proceed to Checkout"}
                  </button>
                ) : (
                  <a href={getLoginUrl()} className="btn-gold w-full justify-center py-4 flex items-center gap-2">
                    Sign In to Checkout
                  </a>
                )}
                <p className="text-xs text-center text-[oklch(0.45_0.02_240)]">Secure payment via Paystack</p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
