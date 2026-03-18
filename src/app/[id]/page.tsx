import React from 'react'
import { notFound } from 'next/navigation';
import connectDB from '@/lib/db';
import Template from '@/models/template';
import { z } from 'zod';
import { FaGithub } from 'react-icons/fa';
import { IoMdDownload } from 'react-icons/io';
import { IoArrowBackOutline } from "react-icons/io5";
import { Button } from '@/components/ui/button';
import { PkgInstallCmd } from '@/components/pkg-install-cmd';
import { formatNumberAbbreviated } from '@/lib/helpers';
import { formatMessageCSS } from '@/lib/format-message';
import Link from 'next/link';

const getSchema = z.object({
    id: z
        .string()
        .trim()
        .min(3, "Id must be at least 3 characters")
        .max(50, "Id cannot exceed 50 characters")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Id must be kebab-case")
});

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const parsed = getSchema.safeParse({ id });
    if (!parsed.success) notFound();

    await connectDB();
    const template = await Template.findOne({ id: parsed.data.id }).lean();
    if (!template) notFound();

    return (
        <main className="flex flex-col items-center pb-16">
            <div className="max-w-4xl w-full px-4 mt-6 flex flex-col">

                <div className="mb-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="hover:text-primary hover:bg-primary/5 -ml-2 gap-1.5">
                            <IoArrowBackOutline className="size-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <div className="flex items-start justify-between gap-4 mb-3">
                    <h1 className="text-3xl font-bold tracking-tight leading-tight">{template.title}</h1>
                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                            <IoMdDownload className="size-4" />
                            {formatNumberAbbreviated(template.downloads)}
                        </div>
                        <a href={template.githubURL} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon">
                                <FaGithub className="size-5" />
                            </Button>
                        </a>
                    </div>
                </div>

                <span className="text-primary/70 text-sm font-mono mb-4">{template.id}</span>

                {template.description && (
                    <p className="text-base text-muted-foreground leading-relaxed mb-6">
                        {template.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-2 mb-10">
                    {template.technologies.map((tech: string) => (
                        <span
                            key={tech}
                            className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-medium"
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <div className="border-t mb-10" />

                <div className="flex flex-col gap-3 mb-10">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Installation</h2>
                    <div className="overflow-x-auto">
                        <PkgInstallCmd pkg={template.id} />
                    </div>
                </div>

                {template.nextSteps && (
                    <div className="flex flex-col gap-3">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Next Steps</h2>
                        <pre className="text-sm leading-7 whitespace-pre-wrap font-mono">
                            {formatMessageCSS(template.nextSteps)}
                        </pre>
                    </div>
                )}

            </div>
        </main>
    )
}