import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../../modules/user.modules.js";
import Organisation from "../../modules/organization.modules.js";
import Review from "../../modules/review.modules.js";
import { PartnerStatusEnum } from "../../types/partnerStatus.js";
import { recomputePartnerRating } from "../reviews/recomputePartnerRating.js";

dotenv.config();

const DEMO_PASSWORD = "TestPass123!";

/** Demo reviewers. `idNumber` must be exactly 11 chars and unique. */
const REVIEWERS = [
  { idNumber: "90000000001", nameGe: "ნინო ბერიძე", nameEn: "Nino Beridze" },
  { idNumber: "90000000002", nameGe: "გიორგი კაპანაძე", nameEn: "Giorgi Kapanadze" },
  { idNumber: "90000000003", nameGe: "მარიამ ლომიძე", nameEn: "Mariam Lomidze" },
  { idNumber: "90000000004", nameGe: "ლევან ჩხეიძე", nameEn: "Levan Chkheidze" },
  { idNumber: "90000000005", nameGe: "ანა მაისურაძე", nameEn: "Ana Maisuradze" },
  { idNumber: "90000000006", nameGe: "დავით ხარაძე", nameEn: "Davit Kharadze" },
  { idNumber: "90000000007", nameGe: "თამარ ჯანელიძე", nameEn: "Tamar Janelidze" },
  { idNumber: "90000000008", nameGe: "საბა წიკლაური", nameEn: "Saba Tsiklauri" },
];

/** Comment pool, indexed by star value so the text matches the score. */
const COMMENTS: Record<number, string[]> = {
  5: [
    "შესანიშნავი ხელოსნობა, ნივთი ზუსტად ისეთია, როგორსაც ველოდი. ნამდვილად გირჩევთ!",
    "ულამაზესი ნამუშევარი და ძალიან თბილი მომსახურება. აუცილებლად დავუბრუნდები.",
    "ხარისხი ყოველგვარ მოლოდინს აღემატება. შეფუთვაც ძალიან ლამაზი იყო.",
  ],
  4: [
    "ძალიან კარგი ხარისხი, მიწოდებამ ცოტა მეტი დრო წაიღო, მაგრამ ღირდა ლოდინად.",
    "ნივთი ლამაზია და კარგად დამზადებული. ფერი ოდნავ განსხვავდებოდა ფოტოსგან.",
    "კმაყოფილი ვარ შენაძენით, კომუნიკაციაც სასიამოვნო იყო.",
  ],
  3: [
    "ნივთი ნორმალურია, თუმცა ფასის გათვალისწინებით მეტს ველოდი.",
    "საშუალო გამოცდილება — პროდუქტი კარგია, პასუხს კი დიდხანს ველოდე.",
  ],
  2: [
    "სამწუხაროდ ნივთი ნაჩქარევად ჩანს დამზადებული, დეტალები ზუსტი არ არის.",
    "მიწოდება ძალიან დაგვიანდა და კომუნიკაცია რთული იყო.",
  ],
  1: [
    "სამწუხაროდ საერთოდ არ დაემთხვა აღწერას, ძალიან იმედგაცრუებული დავრჩი.",
  ],
};

/** Weighted toward 4–5, so the seeded averages look realistic. */
const STAR_POOL = [5, 5, 5, 5, 4, 4, 4, 3, 3, 2, 1];

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

const shuffle = <T>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
};

/**
 * Seeds demo reviewers and spreads 3–8 reviews across every approved partner,
 * then recomputes each partner's `rating` / `reviewCount`.
 *
 * Idempotent — reviews are upserted on {user, partner}, so reruns never
 * duplicate and never overwrite a real customer's review.
 */
async function seed() {
  try {
    const MONGO_URI = process.env.MONGODB_URL_TEST || process.env.MONGODB_URL!;
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    const hashed = await bcrypt.hash(DEMO_PASSWORD, 10);

    console.log(`Seeding ${REVIEWERS.length} demo reviewers...`);
    const users = [];
    for (const r of REVIEWERS) {
      const email = `reviewer${r.idNumber.slice(-1)}@khelovani.test`;
      const user = await User.findOneAndUpdate(
        { email },
        {
          $set: { isVerified: true, isActive: true },
          $setOnInsert: {
            idNumber: r.idNumber,
            nameGe: r.nameGe,
            nameEn: r.nameEn,
            email,
            phone: `5551000${r.idNumber.slice(-2)}`,
            password: hashed,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      users.push(user);
    }

    const partners = await Organisation.find({
      status: PartnerStatusEnum.APPROVED,
    })
      .select("_id companyNameEn")
      .lean();

    if (!partners.length) {
      console.warn("⚠️  No approved partners found — nothing to review.");
      process.exit(0);
    }

    console.log(`Seeding reviews for ${partners.length} approved partners...`);

    let created = 0;
    let hiddenLeft = 2; // leave a couple hidden so moderation has something to show

    for (const partner of partners) {
      const count = 3 + Math.floor(Math.random() * 6); // 3..8
      const authors = shuffle(users).slice(0, Math.min(count, users.length));

      for (const author of authors) {
        const rating = pick(STAR_POOL);
        const isVisible = hiddenLeft > 0 && Math.random() < 0.05 ? false : true;
        if (!isVisible) hiddenLeft -= 1;

        const res = await Review.updateOne(
          { user: author._id, partner: partner._id },
          {
            $setOnInsert: {
              user: author._id,
              partner: partner._id,
              rating,
              comment: pick(COMMENTS[rating]!),
              isVisible,
            },
          },
          { upsert: true },
        );
        if (res.upsertedCount) created += 1;
      }

      await recomputePartnerRating(String(partner._id));
    }

    console.log(
      `✅ Review seeding completed — ${created} new review(s) across ${partners.length} partner(s).`,
    );
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seed();
