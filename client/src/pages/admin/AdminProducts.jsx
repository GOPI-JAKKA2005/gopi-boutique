import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import AdminNav from "../../components/AdminNav";
import { useProducts } from "../../hooks/useProducts";
import { deleteProduct } from "../../firebase/db";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminProducts() {
  const { products } = useProducts({ pageSize: 100, includeInactive: true });
  const [search, setSearch] = useState("");
  const filtered = products.filter((product) => product.name?.toLowerCase().includes(search.toLowerCase()));

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
    toast.success("Product deleted");
  }

  return (
    <div className="container-page py-10">
      <AdminNav />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-4xl font-black">Products</h1><Link className="btn-primary" to="/admin/products/add"><FiPlus /> Add Product</Link></div>
      <div className="mt-6"><input className="input max-w-md" placeholder="Search products" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-white/5"><tr><th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead>
          <tbody>{filtered.map((product) => <tr key={product.id} className="border-t"><td className="p-4"><div className="flex items-center gap-3"><img src={product.imageUrl || product.images?.[0] || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=300&q=70"} alt="" className="h-12 w-12 rounded-lg object-cover" /><b>{product.name}</b></div></td><td className="p-4">{product.category}</td><td className="p-4">{formatCurrency(product.discountPrice || product.price)}</td><td className="p-4">{product.stock}</td><td className="p-4"><span className="badge bg-primary/10 text-primary">{product.status || "active"}</span></td><td className="p-4"><div className="flex gap-2"><Link className="grid h-9 w-9 place-items-center rounded-lg border" to={`/admin/products/edit/${product.id}`}><FiEdit2 /></Link><button className="grid h-9 w-9 place-items-center rounded-lg border text-danger" onClick={() => remove(product.id)}><FiTrash2 /></button></div></td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
