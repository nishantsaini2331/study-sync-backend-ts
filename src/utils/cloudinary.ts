import { serverConfig } from "../config/serverConfig";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: serverConfig.CLOUDINARY_API_KEY,
  api_secret: serverConfig.CLOUDINARY_API_SECRET,
  cloud_name: serverConfig.CLOUDINARY_CLOUD_NAME,
});

const uploadMedia = async (file: string) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.log(error);
  }
};

const deleteMediaFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
  }
};

const deleteVideoFromCloudinary = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "video" });
  } catch (error) {
    console.log(error);
  }
};

export { uploadMedia, deleteMediaFromCloudinary, deleteVideoFromCloudinary };
