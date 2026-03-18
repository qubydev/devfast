import { headers } from "next/headers";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Template from "@/models/template";
import { z } from "zod";

const postSchema = z.object({
  id: z
    .string()
    .trim()
    .min(3, "Id must be at least 3 characters")
    .max(50, "Id cannot exceed 50 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Id must be kebab-case"),

  // Github Repo URL
  // Supports:
  // https://https://github.com/user/repo.git
  // https://github.com/user/repo
  // https://github.com/user/repo/tree/branch
  githubURL: z
    .string()
    .trim()
    .regex(
      /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+(?:\.git)?(?:\/tree\/[\w./-]+)?$/,
      "Invalid GitHub repository URL"
    ),

  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .max(2000, "Description cannot exceed 2000 characters")
    .optional()
    .default(""),

  technologies: z
    .array(z.string().trim().min(1))
    .min(1, "At least one technology is required"),

  trusted: z
    .boolean()
    .optional()
    .default(false),

  nextSteps: z
    .string()
    .max(2000, "Next steps cannot exceed 2000 characters")
    .optional()
    .default(""),
});

export const POST = async (request: Request) => {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session) {
    return NextResponse.json({
      error: "Unauthorized",
      message: "You must be logged in to perform this action."
    }, { status: 401 });
  }

  const { email } = session.user || {};

  if (!process.env.ADMIN_EMAIL || email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({
      error: "Forbidden",
      message: "You are not authorized to perform this action."
    }, { status: 403 });
  }

  try {
    await connectDB();

    const body = await request.json();

    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));

      const errorMsg = errors.length > 0 ? errors[0].message : "Invalid request schema";

      return NextResponse.json(
        {
          error: "Invalid request body",
          fields: errors,
          message: errorMsg
        },
        { status: 400 }
      );
    }

    const { id, githubURL, title, description, technologies, trusted, nextSteps } = parsed.data;

    // unique id check
    const existing = await Template.findOne({ id });

    if (existing) {
      return NextResponse.json(
        {
          error: "Template with this ID already exists.",
          message: "A template with the specified ID already exists."
        },
        { status: 400 }
      );
    }

    const template = new Template({
      id,
      githubURL,
      title,
      description,
      technologies,
      trusted,
      nextSteps,
      downloads: 0
    });

    const created = await template.save();

    return NextResponse.json(created, { status: 201 });

  } catch (error: unknown) {
    console.error("Error in POST /api/admin/templates:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
};
