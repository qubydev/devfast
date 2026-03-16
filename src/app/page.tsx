"use client";

import { SearchBar } from '@/components/client/search-bar';
import { Button } from '@/components/ui/button';
import { useState, useCallback, useEffect } from 'react';
import { TemplateType } from '@/models/template';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { FaGithub } from 'react-icons/fa';
import { IoMdDownload } from "react-icons/io";
import { PkgInstallCmd } from '@/components/pkg-install-cmd';
import { formatNumberAbbreviated } from '@/lib/helpers';
import { Spinner } from '@/components/ui/spinner';
import toast from 'react-hot-toast';

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type SearchQuery = {
  text: string;
  technologies: string[];
};

export default function Home() {
  const [query, setQuery] = useState<SearchQuery>({
    text: "",
    technologies: [],
  });

  const [results, setResults] = useState<TemplateType[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.text) params.set("text", query.text);
      query.technologies.forEach((t) => params.append("technologies", t));
      params.set("page", String(page));

      const res = await fetch(`/api/template?${params.toString()}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `Server error: ${res.status}`);
      }

      const data = await res.json();
      setResults(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch templates.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    search(1);
  }, []);

  return (
    <main className="flex flex-col items-center pb-8">
      <div className="max-w-4xl p-4 w-full flex items-center gap-3">
        <SearchBar onChange={setQuery} onSubmit={() => search(1)} />
        <Button className="h-10 px-6" onClick={() => search(1)} disabled={loading}>
          Search
        </Button>
      </div>

      <div className="max-w-4xl w-full px-4 mt-4">
        {loading ? (
          <div className="flex items-center justify-center pt-10">
            <Spinner className="size-6 text-primary" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No templates found. Try adjusting your search criteria.
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {results.map((template) => (
                <div
                  key={template._id.toString()}
                  className="border bg-card text-card-foreground rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold tracking-tight">{template.title}</h3>
                        {template.trusted && (
                          <RiVerifiedBadgeFill className="text-blue-500 size-5" />
                        )}
                      </div>
                      <span className="text-primary/80 text-xs font-medium">
                        {template.id}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-md border border-primary/20">
                      <IoMdDownload className="size-4" />
                      {formatNumberAbbreviated(template.downloads)}
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {template.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    {template.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 min-w-0 overflow-x-auto">
                      <PkgInstallCmd pkg={template.id} />
                    </div>
                    <a
                      href={template.githubURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <Button variant="ghost" size="icon">
                        <FaGithub className="size-5" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1 || loading}
                  onClick={() => search(pagination.page - 1)}
                  className="hover:text-primary hover:bg-primary/5"
                >
                  Previous
                </Button>

                <span className="text-sm font-medium text-muted-foreground">
                  Page {pagination.page} of {pagination.pages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.pages || loading}
                  onClick={() => search(pagination.page + 1)}
                  className="hover:text-primary hover:bg-primary/5"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}