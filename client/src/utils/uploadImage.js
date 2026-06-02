export async function uploadImageToImgBB(file) {
  const apiKey = import.meta.env.VITE_IMGBB_API_KEY;

  if (!apiKey) {
    throw new Error("Missing VITE_IMGBB_API_KEY in .env");
  }

  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.success) throw new Error("Image upload failed");
  return data.data.url;
}
