import Product from "../../modules/product.modules.js";
import Organisation from "../../modules/organization.modules.js";
import { escapeRegex } from "../../utils/apiResponse.js";
import { invalidateProducts, invalidatePartners } from "../../utils/cache/invalidators.js";

/**
 * Keep the database in sync when media assets change on Cloudinary.
 *
 * Stored image URLs always embed the Cloudinary public_id, so we match
 * references with a regex on the public_id.
 */

/**
 * Remove every DB reference to deleted assets — product images and
 * organisation profile photos — so nothing points at a 404 file.
 */
export const purgeMediaReferences = async (
  publicIds: string[],
): Promise<{ products: number; organizations: number }> => {
  let products = 0;
  let organizations = 0;

  for (const publicId of publicIds) {
    const rx = new RegExp(escapeRegex(publicId));

    const prodRes = await Product.updateMany(
      { images: rx },
      { $pull: { images: rx } },
    );
    products += prodRes.modifiedCount || 0;

    const orgRes = await Organisation.updateMany(
      { profilePhoto: rx },
      { $set: { profilePhoto: "" } },
    );
    organizations += orgRes.modifiedCount || 0;
  }

  if (products) void invalidateProducts();
  if (organizations) void invalidatePartners();

  return { products, organizations };
};

/**
 * When an asset is renamed its URL changes — repoint every DB reference
 * from the old public_id to the new delivery URL.
 */
export const remapMediaReference = async (
  oldPublicId: string,
  newUrl: string,
): Promise<{ products: number; organizations: number }> => {
  const rx = new RegExp(escapeRegex(oldPublicId));

  const products = await Product.find({ images: rx });
  for (const product of products) {
    product.images = product.images.map((url) => (rx.test(url) ? newUrl : url));
    await product.save();
  }

  const orgRes = await Organisation.updateMany(
    { profilePhoto: rx },
    { $set: { profilePhoto: newUrl } },
  );

  if (products.length) void invalidateProducts();
  if (orgRes.modifiedCount) void invalidatePartners();

  return { products: products.length, organizations: orgRes.modifiedCount || 0 };
};
