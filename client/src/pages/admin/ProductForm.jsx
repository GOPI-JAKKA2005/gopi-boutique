import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { getProduct, saveProduct } from "../../firebase/db";
import { uploadImageToImgBB } from "../../utils/uploadImage";
import AdminNav from "../../components/AdminNav";
import Loader from "../../components/Loader";
import { boutiqueCategories } from "../../data/boutique";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  price: yup.number().positive().required("Price is required"),
  discountPrice: yup.number().min(0).required("Discount price is required"),
  category: yup.string().required("Category is required"),
  brand: yup.string().required("Brand is required"),
  stock: yup.number().integer().min(0).required("Stock is required"),
  status: yup.string().required("Status is required"),
  deliveryWindow: yup.string(),
  isFeatured: yup.boolean(),
});

export default function ProductForm({ mode = "add" }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { category: "Women", status: "active", deliveryWindow: "Made to order", isFeatured: false, rating: 0, reviewCount: 0 },
  });

  useEffect(() => {
    if (mode !== "edit" || !id) return;
    getProduct(id).then((product) => {
      reset(product);
      setExistingImages(product?.images || [product?.imageUrl].filter(Boolean));
      setLoading(false);
    });
  }, [id, mode, reset]);

  async function onSubmit(values, event) {
    setSaving(true);
    try {
      const files = Array.from(event.target.images.files || []);
      const uploaded = files.length ? await Promise.all(files.map(uploadImageToImgBB)) : [];
      const images = [...existingImages, ...uploaded].filter(Boolean);
      await saveProduct({ ...values, images, imageUrl: images[0] || "", rating: values.rating || 0, reviewCount: values.reviewCount || 0 }, mode === "edit" ? id : undefined);
      toast.success(mode === "edit" ? "Product updated" : "Product added");
      navigate("/admin/products");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader />;

  return (
    <div className="container-page py-10">
      <AdminNav />
      <h1 className="text-4xl font-black">{mode === "edit" ? "Edit Collection Post" : "Add Collection Post"}</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 grid gap-5 p-6 lg:grid-cols-2">
        {[
          ["name", "Name"],
          ["brand", "Brand"],
          ["price", "Price"],
          ["discountPrice", "Discount Price"],
          ["stock", "Stock"],
          ["deliveryWindow", "Delivery Window"],
        ].map(([key, label]) => <div key={key}><label className="label">{label}</label><input className="input" type={["price", "discountPrice", "stock"].includes(key) ? "number" : "text"} {...register(key)} /><p className="mt-1 text-sm text-danger">{errors[key]?.message}</p></div>)}
        <div>
          <label className="label">Category / Blog Section</label>
          <select className="input" {...register("category")}>
            {boutiqueCategories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
          </select>
          <p className="mt-1 text-sm text-danger">{errors.category?.message}</p>
        </div>
        <div>
          <label className="label">Status</label>
          <select className="input" {...register("status")}>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <p className="mt-1 text-sm text-danger">{errors.status?.message}</p>
        </div>
        <div className="lg:col-span-2"><label className="label">Description</label><textarea rows="5" className="input" {...register("description")} /><p className="mt-1 text-sm text-danger">{errors.description?.message}</p></div>
        <div className="lg:col-span-2">
          <label className="label">Admin Image Upload</label>
          <input name="images" type="file" multiple accept="image/*" className="input" />
          <p className="mt-2 text-sm text-slate-500">Only admins can upload collection images for Women, Men, and Kids sections.</p>
          {existingImages.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {existingImages.map((image) => (
                <div key={image} className="relative">
                  <img src={image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <button type="button" className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-danger text-white shadow" onClick={() => setExistingImages((current) => current.filter((item) => item !== image))} aria-label="Remove image">
                    <FiX />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <label className="flex items-center gap-3"><input type="checkbox" className="h-5 w-5 accent-primary" {...register("isFeatured")} /><span className="font-bold">Featured product</span></label>
        <div className="lg:col-span-2"><button disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Product"}</button></div>
      </form>
    </div>
  );
}
