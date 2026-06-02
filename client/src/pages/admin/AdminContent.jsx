import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiImage, FiSave, FiUploadCloud } from "react-icons/fi";
import AdminNav from "../../components/AdminNav";
import Loader from "../../components/Loader";
import { getSiteContent, saveSiteContent } from "../../firebase/db";
import { defaultSiteContent } from "../../hooks/useSiteContent";
import { uploadImageToImgBB } from "../../utils/uploadImage";

const pages = [
  { id: "home", label: "Home hero" },
  { id: "shop", label: "Shop page" },
  { id: "consultation", label: "Consultation page" },
];

function cloneDefault(pageId) {
  return JSON.parse(JSON.stringify(defaultSiteContent[pageId] || {}));
}

export default function AdminContent() {
  const [pageId, setPageId] = useState("home");
  const [values, setValues] = useState(cloneDefault("home"));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getSiteContent(pageId)
      .then((content) => {
        if (mounted) setValues({ ...cloneDefault(pageId), ...(content || {}) });
      })
      .catch((error) => toast.error(error.message))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [pageId]);

  function update(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function updateStat(index, field, value) {
    setValues((current) => ({
      ...current,
      stats: current.stats.map((stat, statIndex) => (statIndex === index ? { ...stat, [field]: value } : stat)),
    }));
  }

  async function uploadHeroImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToImgBB(file);
      update(pageId === "consultation" ? "imageUrl" : "posterImage", url);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveSiteContent(pageId, values);
      toast.success("Page content saved");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  }

  const previewImage = values.posterImage || values.imageUrl;

  return (
    <div className="container-page py-10">
      <AdminNav />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase rainbow-text">Admin content studio</p>
          <h1 className="text-4xl font-black">Manage page heroes</h1>
        </div>
        <select className="input max-w-xs" value={pageId} onChange={(event) => setPageId(event.target.value)}>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader label="Loading page content" />
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <form className="rainbow-panel rainbow-border-top grid gap-5 p-6" onSubmit={submit}>
            <div>
              <label className="label">Eyebrow</label>
              <input className="input" value={values.eyebrow || ""} onChange={(event) => update("eyebrow", event.target.value)} />
            </div>
            <div>
              <label className="label">Title</label>
              <input className="input" value={values.title || ""} onChange={(event) => update("title", event.target.value)} />
            </div>
            <div>
              <label className="label">Subtitle</label>
              <textarea className="input min-h-28" value={values.subtitle || ""} onChange={(event) => update("subtitle", event.target.value)} />
            </div>

            {pageId === "home" && (
              <>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">Primary CTA</label>
                    <input className="input" value={values.primaryCta || ""} onChange={(event) => update("primaryCta", event.target.value)} />
                  </div>
                  <div>
                    <label className="label">Secondary CTA</label>
                    <input className="input" value={values.secondaryCta || ""} onChange={(event) => update("secondaryCta", event.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Hero video URL</label>
                  <input className="input" value={values.videoUrl || ""} onChange={(event) => update("videoUrl", event.target.value)} placeholder="/media/hero-video.mp4" />
                  <p className="mt-2 text-sm text-slate-500">For local storage, replace `client/public/media/hero-video.mp4` and keep this URL as `/media/hero-video.mp4`.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {(values.stats || []).map((stat, index) => (
                    <div key={index} className="rounded-lg border bg-white/70 p-4 dark:border-white/10 dark:bg-white/5">
                      <label className="label">Stat {index + 1}</label>
                      <input className="input mb-2" value={stat.value || ""} onChange={(event) => updateStat(index, "value", event.target.value)} />
                      <input className="input" value={stat.label || ""} onChange={(event) => updateStat(index, "label", event.target.value)} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {(pageId === "home" || pageId === "consultation") && (
              <div>
                <label className="label">Hero image / poster</label>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input className="input" value={pageId === "consultation" ? values.imageUrl || "" : values.posterImage || ""} onChange={(event) => update(pageId === "consultation" ? "imageUrl" : "posterImage", event.target.value)} />
                  <label className="btn-secondary cursor-pointer">
                    <FiUploadCloud />
                    {uploading ? "Uploading..." : "Upload"}
                    <input type="file" accept="image/*" className="hidden" onChange={uploadHeroImage} />
                  </label>
                </div>
              </div>
            )}

            <button className="btn-primary w-max" disabled={saving}>
              <FiSave /> {saving ? "Saving..." : "Save content"}
            </button>
          </form>

          <aside className="card h-max overflow-hidden">
            <div className="border-b p-5 dark:border-white/10">
              <p className="text-sm font-bold uppercase text-primary">Live preview</p>
              <h2 className="mt-1 text-2xl font-black">{values.title}</h2>
            </div>
            {previewImage ? (
              <img src={previewImage} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center bg-slate-100 text-slate-400 dark:bg-white/5">
                <FiImage className="text-4xl" />
              </div>
            )}
            <div className="p-5">
              <p className="text-sm font-bold uppercase rainbow-text">{values.eyebrow}</p>
              <p className="mt-3 text-sm leading-6 text-slate-500">{values.subtitle}</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

