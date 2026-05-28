import Product from "../../modules/product.modules.js";
import cloudinary from "../config/cloudinary.js";
import { getCloudinaryPublicId } from "../apiResponse.js";
import { orgFolderAbsolute } from "../config/mediaFolders.js";

/**
 * One-time migration: move every product image from the legacy flat
 * `khelovani/products` folder into its owning organisation's folder
 * `khelovani/organizations/<orgId>`, and update the stored URLs in MongoDB.
 *
 * Idempotent — images already inside an `organizations/` folder are skipped.
 */
export async function migrateImagesToOrgFolders() {
  const products = await Product.find({
    images: { $exists: true, $ne: [] },
  });

  if (products.length === 0) {
    console.log("migrateImagesToOrgFolders: no products with images — nothing to do.");
    return;
  }

  let movedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const product of products) {
    const orgId = product.owner?.toString();
    if (!orgId) {
      console.warn(`Product ${product._id} has no owner — skipped.`);
      continue;
    }

    const targetFolder = orgFolderAbsolute(orgId);
    const newImages: string[] = [];
    let changed = false;

    for (const imageUrl of product.images) {
      const publicId = getCloudinaryPublicId(imageUrl);

      // Not a Cloudinary asset or already migrated — keep as-is.
      if (!publicId || publicId.includes("/organizations/")) {
        newImages.push(imageUrl);
        if (publicId?.includes("/organizations/")) skippedCount++;
        continue;
      }

      const baseName = publicId.split("/").pop()!;
      const targetPublicId = `${targetFolder}/${baseName}`;

      try {
        const result = await cloudinary.uploader.rename(
          publicId,
          targetPublicId,
          { overwrite: false, invalidate: true },
        );
        newImages.push(result.secure_url);
        movedCount++;
        changed = true;
        console.log(`  moved ${publicId} -> ${targetPublicId}`);
      } catch (err: any) {
        failedCount++;
        newImages.push(imageUrl); // keep old URL so nothing breaks
        console.error(
          `  FAILED ${publicId} (product ${product._id}): ${err?.message || err}`,
        );
      }
    }

    if (changed) {
      product.images = newImages;
      await product.save();
    }
  }

  console.log(
    `migrateImagesToOrgFolders done — moved: ${movedCount}, skipped: ${skippedCount}, failed: ${failedCount}.`,
  );
}
