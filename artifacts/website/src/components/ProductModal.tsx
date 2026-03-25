import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Flame, Leaf, Clock, Star, Check,
  ShoppingCart, AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

const FALLBACK_IMG = "https://images.unsplash.com/photo-1559742811-822873691df8?w=800&q=80&fit=crop";

interface Variant { id: number; name: string; priceModifier: string; }
interface AddOn { id: number; name: string; price: string; isAvailable: boolean; }
interface ProductDetail {
  id: number; name: string; description: string; price: string;
  discountedPrice?: string; imageUrl?: string;
  isVegetarian: boolean; spiceLevel: number; preparationTime: number;
  isFeatured: boolean; isBestSeller: boolean;
  variants?: Variant[];
  addOns?: AddOn[];
  averageRating?: number; totalReviews?: number;
}

interface Props {
  productId: number;
  onClose: () => void;
}

export default function ProductModal({ productId, onClose }: Props) {
  const { addItem } = useCart();
  const { t, isRTL } = useLanguage();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [imgSrc, setImgSrc] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${productId}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data);
        const src = data.imageUrl?.trim() || FALLBACK_IMG;
        setImgSrc(src);
        if (data.variants?.length) setSelectedVariant(data.variants[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const basePrice = product
    ? Number(product.discountedPrice && Number(product.discountedPrice) < Number(product.price) ? product.discountedPrice : product.price)
    : 0;
  const variantExtra = selectedVariant ? Number(selectedVariant.priceModifier) : 0;
  const addOnTotal = selectedAddOns.reduce((s, a) => s + Number(a.price), 0);
  const unitPrice = basePrice + variantExtra + addOnTotal;
  const totalPrice = unitPrice * quantity;

  const toggleAddOn = (ao: AddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.id === ao.id) ? prev.filter((a) => a.id !== ao.id) : [...prev, ao]
    );
  };

  const handleAdd = () => {
    if (!product) return;
    addItem({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
      image: imgSrc === FALLBACK_IMG ? undefined : imgSrc,
      variantName: selectedVariant?.name,
      addOnNames: selectedAddOns.map((a) => a.name),
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 800);
  };

  return (
    <AnimatePresence>
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{
            background: "#fff", borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 640,
            maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column",
            direction: isRTL ? "rtl" : "ltr",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero image */}
          <div style={{ position: "relative", height: 260, flexShrink: 0, background: "var(--gray-100)" }}>
            {!imgLoaded && (
              <div className="sg-skeleton" style={{ position: "absolute", inset: 0 }} />
            )}
            <img
              src={imgSrc}
              alt={product?.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: imgLoaded ? 1 : 0, transition: "opacity 0.3s" }}
              onLoad={() => setImgLoaded(true)}
              onError={() => { setImgSrc(FALLBACK_IMG); setImgLoaded(true); }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)" }} />
            {/* Tags on image */}
            {product && (
              <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", gap: 6, justifyContent: isRTL ? "flex-end" : "flex-start" }}>
                {product.isBestSeller && <span className="sg-tag sg-tag-best">{t("bestSeller")}</span>}
                {product.isVegetarian && <span className="sg-tag sg-tag-veg"><Leaf size={9} /> {t("veg")}</span>}
                {product.spiceLevel > 0 && <span className="sg-tag sg-tag-spicy"><Flame size={9} /> {t("spicy")}</span>}
              </div>
            )}
            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                position: "absolute", top: 14, right: isRTL ? "auto" : 14, left: isRTL ? 14 : "auto",
                width: 36, height: 36, borderRadius: "50%",
                background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <X size={17} color="#fff" />
            </button>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0" }}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="sg-skeleton" style={{ height: 24, width: "70%", borderRadius: 6 }} />
                <div className="sg-skeleton" style={{ height: 16, borderRadius: 6 }} />
                <div className="sg-skeleton" style={{ height: 16, width: "80%", borderRadius: 6 }} />
              </div>
            ) : product ? (
              <>
                {/* Name & rating */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "var(--dark)", letterSpacing: "-0.3px", lineHeight: 1.2 }}>{product.name}</h2>
                  {(product.averageRating || 0) > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                      <Star size={14} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)" }}>{Number(product.averageRating).toFixed(1)}</span>
                      {product.totalReviews && <span style={{ fontSize: 11, color: "var(--gray-400)" }}>({product.totalReviews})</span>}
                    </div>
                  )}
                </div>

                {/* Quick info chips */}
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  {product.preparationTime > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--gray-100)", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "var(--gray-600)", fontWeight: 600 }}>
                      <Clock size={12} color="var(--gray-400)" /> {product.preparationTime} {t("preparationTime")}
                    </span>
                  )}
                  {product.spiceLevel > 0 && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#FFF7ED", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#EA580C", fontWeight: 600 }}>
                      <Flame size={12} /> {Array(product.spiceLevel).fill("●").join("")}
                    </span>
                  )}
                  {product.isVegetarian && (
                    <span style={{ display: "flex", alignItems: "center", gap: 4, background: "#F0FDF4", borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#16A34A", fontWeight: 600 }}>
                      <Leaf size={12} /> {t("vegetarian")}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.65, marginBottom: 20 }}>{product.description}</p>

                {/* Variants */}
                {product.variants && product.variants.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)", marginBottom: 10 }}>{t("chooseSize")}</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {product.variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setSelectedVariant(v)}
                          style={{
                            padding: "8px 16px", borderRadius: 10,
                            border: `2px solid ${selectedVariant?.id === v.id ? "var(--primary)" : "var(--border)"}`,
                            background: selectedVariant?.id === v.id ? "var(--primary-light)" : "#fff",
                            color: selectedVariant?.id === v.id ? "var(--primary)" : "var(--gray-600)",
                            fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s",
                          }}
                        >
                          {v.name}
                          {Number(v.priceModifier) > 0 && <span style={{ opacity: 0.7 }}> +{Number(v.priceModifier).toFixed(0)}</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {product.addOns && product.addOns.filter((a) => a.isAvailable).length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "var(--dark)", marginBottom: 10 }}>{t("addOns")}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {product.addOns.filter((a) => a.isAvailable).map((ao) => {
                        const sel = selectedAddOns.some((a) => a.id === ao.id);
                        return (
                          <button
                            key={ao.id}
                            onClick={() => toggleAddOn(ao)}
                            style={{
                              display: "flex", justifyContent: "space-between", alignItems: "center",
                              padding: "10px 14px", borderRadius: 10,
                              border: `1.5px solid ${sel ? "var(--primary)" : "var(--border)"}`,
                              background: sel ? "var(--primary-light)" : "#fff",
                              cursor: "pointer", transition: "all 0.15s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{
                                width: 20, height: 20, borderRadius: 5,
                                border: `2px solid ${sel ? "var(--primary)" : "var(--gray-300)"}`,
                                background: sel ? "var(--primary)" : "transparent",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                {sel && <Check size={11} color="#fff" />}
                              </div>
                              <span style={{ fontSize: 13, color: "var(--dark)", fontWeight: 500 }}>{ao.name}</span>
                            </div>
                            <span style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}>+EGP {Number(ao.price).toFixed(0)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <AlertCircle size={32} color="var(--gray-300)" />
                <p style={{ color: "var(--gray-400)", marginTop: 8 }}>Could not load product</p>
              </div>
            )}
          </div>

          {/* Footer: quantity + price + add */}
          {product && (
            <div style={{ padding: "16px 20px 24px", borderTop: "1px solid var(--border)", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {/* Quantity */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--gray-100)", borderRadius: 10, padding: "6px 10px" }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    style={{ width: 28, height: 28, borderRadius: 7, background: "#fff", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--dark)" }}
                  ><Minus size={13} /></button>
                  <span style={{ fontWeight: 800, fontSize: 15, minWidth: 20, textAlign: "center", color: "var(--dark)" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    style={{ width: 28, height: 28, borderRadius: 7, background: "var(--primary)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}
                  ><Plus size={13} /></button>
                </div>

                {/* Price */}
                <div style={{ flex: 1 }}>
                  {product.discountedPrice && Number(product.discountedPrice) < Number(product.price) && !selectedVariant && selectedAddOns.length === 0 ? (
                    <>
                      <span style={{ fontSize: 18, fontWeight: 900, color: "var(--primary)" }}>EGP {totalPrice.toFixed(0)}</span>
                      <span style={{ fontSize: 12, color: "var(--gray-400)", textDecoration: "line-through", marginInlineStart: 6 }}>EGP {(Number(product.price) * quantity).toFixed(0)}</span>
                    </>
                  ) : (
                    <span style={{ fontSize: 18, fontWeight: 900, color: "var(--dark)" }}>EGP {totalPrice.toFixed(0)}</span>
                  )}
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAdd}
                  className="sg-btn sg-btn-primary"
                  style={{ flex: 1.5, justifyContent: "center", fontSize: 14, padding: "12px", borderRadius: 10 }}
                >
                  {added ? <><Check size={16} /> {t("added")}</> : <><ShoppingCart size={16} /> {t("addToCart")}</>}
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
