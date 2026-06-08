"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetMeQuery } from "@/redux/api/authApi";
import {
  useUploadImageMutation,
  useGetAllImagesQuery,
  useDeleteImageMutation,
  useEditImageMutation,
} from "@/redux/api/uploadApi";
import { toast } from "sonner";
import { Upload, Trash2, Copy, X, Eye, Pencil } from "lucide-react";

const Page = () => {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const { data: user, isLoading, isError } = useGetMeQuery({}) as any;
  const { data: imageData, isLoading: imagesLoading, refetch } = useGetAllImagesQuery({}) as any;
  const [uploadImage, { isLoading: uploading }] = useUploadImageMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [editImage] = useEditImageMutation();

  const images = imageData?.data || [];

  if (!isLoading && isError) {
    router.push("/login");
    return null;
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res: any = await uploadImage(file).unwrap();
      if (res.success) {
        toast.success("Image uploaded!");
        refetch();
      }
    } catch {
      toast.error("Upload failed");
    }
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteImage(key).unwrap();
      toast.success("Image deleted!");
      refetch();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEdit = async (e: React.ChangeEvent<HTMLInputElement>, oldKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res: any = await editImage({ file, oldKey }).unwrap();
      if (res.success) {
        toast.success("Image updated!");
        setEditing(null);
        refetch();
      }
    } catch {
      toast.error("Edit failed");
    }
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  if (isLoading || imagesLoading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Image Gallery</h1>
            <p className="text-gray-500 mt-1">
              Welcome, {user?.data?.fullName || "User"}! S3 + CloudFront
            </p>
          </div>

          <label className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
            <Upload size={20} />
            <span className="font-medium">{uploading ? "Uploading..." : "Upload Image"}</span>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="hidden" />
          </label>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Images", value: images.length },
            { label: "Storage", value: "S3" },
            { label: "CDN", value: "CloudFront" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Image Grid */}
        {images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img: any) => (
              <div key={img.key} className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all">
                <img src={img.url} alt={img.key} className="w-full h-48 object-cover" loading="lazy" />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setPreview(img.url)} className="p-2 bg-white rounded-full hover:scale-110" title="Preview">
                    <Eye size={18} className="text-gray-700" />
                  </button>
                  <button onClick={() => handleCopy(img.url)} className="p-2 bg-white rounded-full hover:scale-110" title="Copy Link">
                    <Copy size={18} className="text-gray-700" />
                  </button>
                  <label className="p-2 bg-yellow-500 rounded-full hover:scale-110 cursor-pointer" title="Edit">
                    <Pencil size={18} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleEdit(e, img.key)} />
                  </label>
                  <button onClick={() => handleDelete(img.key)} className="p-2 bg-red-500 rounded-full hover:scale-110" title="Delete">
                    <Trash2 size={18} className="text-white" />
                  </button>
                </div>

                <div className="p-3 bg-white">
                  <p className="text-xs text-gray-400 truncate">{img.key}</p>
                  <p className="text-xs text-gray-300">{Math.round(img.size / 1024)} KB</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <Upload size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">No images yet</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {preview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 cursor-pointer" onClick={() => setPreview(null)}>
          <button onClick={() => setPreview(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full">
            <X size={24} className="text-gray-700" />
          </button>
          <img src={preview} alt="Preview" className="max-w-full max-h-[90vh] rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default Page;