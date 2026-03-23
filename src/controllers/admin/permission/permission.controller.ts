import type { Request, Response } from "express";
import Permission from "../../../modules/permission.modules.js";

// @desc    Get all permissions
// @route   GET /api/admin/permissions
// @access  Private Admin
export const getPermissions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { search, category, sortBy, sortOrder } = req.query;

    let query: any = {};
    if (category && category !== "all") {
      query.category = { $regex: new RegExp(`^${category}$`, "i") };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: "i" } },
        { description: { $regex: search as string, $options: "i" } },
      ];
    }

    const sort: any = {};
    if (sortBy) {
      sort[sortBy as string] = sortOrder === "desc" ? -1 : 1;
      // Add a tie-breaker so sorting is stable
      if (sortBy === "category") {
        sort.name = 1;
      }
    } else {
      sort.category = 1;
      sort.name = 1;
    }

    const permissions = await Permission.find(query).sort(sort);
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a new permission
// @route   POST /api/admin/permissions
// @access  Private Admin
export const createPermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, category } = req.body;

    if (!name || !description) {
      res.status(400).json({ message: "სახელი და აღწერა სავალდებულოა" });
      return;
    }

    const existing = await Permission.findOne({ name });
    if (existing) {
      res.status(400).json({ message: "უფლება ამ სახელით უკვე არსებობს" });
      return;
    }

    const newPermission = await Permission.create({
      name,
      description,
      category: category || "General",
    });

    res.status(201).json({
      message: "უფლება წარმატებით შეიქმნა",
      permission: newPermission,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Update a permission
// @route   PUT /api/admin/permissions/:id
// @access  Private Admin
export const updatePermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, category } = req.body;

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: "უფლება ვერ მოიძებნა" });
      return;
    }

    if (name) permission.name = name;
    if (description) permission.description = description;
    if (category) permission.category = category;

    const updated = await permission.save();

    res.status(200).json({
      message: "უფლება წარმატებით განახლდა",
      permission: updated,
    });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Delete a permission
// @route   DELETE /api/admin/permissions/:id
// @access  Private Admin
export const deletePermission = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await Permission.findById(id);
    if (!permission) {
      res.status(404).json({ message: "უფლება ვერ მოიძებნა" });
      return;
    }

    await Permission.findByIdAndDelete(id);

    res.status(200).json({ message: "უფლება წარმატებით წაიშალა" });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
