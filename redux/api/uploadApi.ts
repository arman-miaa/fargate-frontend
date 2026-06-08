/* eslint-disable @typescript-eslint/no-explicit-any */

import { baseApi } from "./baseApi";

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder: any) => ({
    
    // Upload
    uploadImage: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append("image", file);
        return { url: "/upload-image", method: "POST", body: formData };
      },
      invalidatesTags: ["Image"],
    }),

    // Upload Multiple
    uploadMultipleImages: builder.mutation({
      query: (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("image", file));
        return { url: "/upload-images", method: "POST", body: formData };
      },
      invalidatesTags: ["Image"],
    }),

    // Get All Images
    getAllImages: builder.query({
      query: () => ({ url: "/images", method: "GET" }),
      providesTags: ["Image"],
    }),

    // Delete Image
    deleteImage: builder.mutation({
      query: (key: string) => ({
        url: "/delete-image",
        method: "DELETE",
        body: { key },
      }),
      invalidatesTags: ["Image"],
    }),

    // Edit (Replace) Image
    editImage: builder.mutation({
      query: ({ file, oldKey }: { file: File; oldKey: string }) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("oldKey", oldKey);
        return { url: "/edit-image", method: "PUT", body: formData };
      },
      invalidatesTags: ["Image"],
    }),
  }),
});

export const {
  useUploadImageMutation,
  useUploadMultipleImagesMutation,
  useGetAllImagesQuery,
  useDeleteImageMutation,
  useEditImageMutation,
} = uploadApi;