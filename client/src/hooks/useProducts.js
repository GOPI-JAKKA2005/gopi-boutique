import { useEffect, useState } from "react";
import { getProducts } from "../firebase/db";

function applyLocalFilters(items, filters) {
  let products = [...items];

  if (!filters.includeInactive) {
    products = products.filter((product) => !["draft", "archived"].includes(product.status));
  }

  if (filters.featured !== undefined) {
    products = products.filter((product) => product.isFeatured === filters.featured);
  }

  if (filters.category && filters.category !== "All") {
    products = products.filter((product) => product.category === filters.category);
  }

  if (filters.search) {
    const lowered = filters.search.toLowerCase();
    products = products.filter((product) =>
      [product.name, product.brand, product.category, product.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(lowered)),
    );
  }

  const sorters = {
    newest: () => 0,
    rating: (a, b) => Number(b.rating || 0) - Number(a.rating || 0),
    priceAsc: (a, b) => Number(a.discountPrice || a.price || 0) - Number(b.discountPrice || b.price || 0),
    priceDesc: (a, b) => Number(b.discountPrice || b.price || 0) - Number(a.discountPrice || a.price || 0),
  };

  products.sort(sorters[filters.sortBy] || sorters.newest);
  return products.slice(0, filters.pageSize || 24);
}

export function useProducts({
  category,
  featured,
  includeInactive = false,
  pageSize = 24,
  search,
  sortBy = "newest",
} = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const filters = {
      category,
      featured,
      includeInactive,
      pageSize,
      search,
      sortBy,
    };

    setLoading(true);

    getProducts(filters)
      .then((data) => {
        if (isMounted) {
          setProducts(applyLocalFilters(data, filters));
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [category, featured, includeInactive, pageSize, search, sortBy]);

  return { products, loading, error };
}