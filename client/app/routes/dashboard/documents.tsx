'use client';

import { useEffect, useState, useCallback } from 'react';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Card } from '@astryxdesign/core/Card';
import { Badge } from '@astryxdesign/core/Badge';

import { IconButton } from '@astryxdesign/core/IconButton';
import { FileInput } from '@astryxdesign/core/FileInput';

import { Grid } from '@astryxdesign/core/Grid';
import { HStack, VStack } from '@astryxdesign/core/Layout';
import { useToast } from '@astryxdesign/core/Toast';
import {
  MOCK_DOCUMENTS,
  documentStatusVariant,
  documentTypeLabel,
  type AppDocument,
  type UploadStage,
} from '~/lib/mock-data';
import { FileText, Trash2, Eye, CheckCircle2, LoaderCircle, Circle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

interface ApiDocument {
  id: string;
  title: string;
  filename: string;
  created_at: string;
  chunk_count: string; // pg COUNT returns string
}

interface DisplayDocument {
  id: string;
  name: string;
  uploadDate: string;
  chunkCount: number;
}

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}

const uploadStages: UploadStage[] = [
  { label: 'Uploading file...', isComplete: false, isActive: false },
  { label: 'Extracting text...', isComplete: false, isActive: false },
  { label: 'Chunking & embedding...', isComplete: false, isActive: false },
  { label: 'Indexed — ready to query', isComplete: false, isActive: false },
];

export default function DocumentsPage() {
  const toast = useToast();
  const [documents, setDocuments] = useState<DisplayDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File | File[] | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());

   const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_URL}/documents`);
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: ApiDocument[] = await res.json();
      setDocuments(
        data.map((d) => ({
          id: d.id,
          name: d.title,
          uploadDate: d.created_at.slice(0, 10),
          chunkCount: Number(d.chunk_count),
        }))
      );
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setLoadError('Failed to load documents.');
    } finally {
      setIsLoading(false);
    }
  }, []);

   useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadOne = (file: File): Promise<void> => {
    const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setUploads((prev) => [...prev, { id: uploadId, file, progress: 0, status: 'uploading' }]);

    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadId
                ? { ...u, progress: pct, status: pct >= 100 ? 'processing' : 'uploading' }
                : u
            )
          );
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'done', progress: 100 } : u))
          );
          toast({ body: `${file.name} indexed and ready to query` });
        } else {
          let message = 'Upload failed.';
          try {
            message = JSON.parse(xhr.responseText)?.error || message;
          } catch {}
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, status: 'error', error: message } : u))
          );
          toast({ body: `${file.name}: ${message}` });
        }
        resolve();
      });

      xhr.addEventListener('error', () => {
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadId ? { ...u, status: 'error', error: 'Network error' } : u
          )
        );
        toast({ body: `${file.name}: network error` });
        resolve();
      });

      xhr.open('POST', `${API_URL}/documents/upload`);
      xhr.send(formData);
    });
  };

  const handleFileChange = async (files: File | File[] | null) => {
    if (!files) return;
    setSelectedFiles(files);
    const fileArray = Array.isArray(files) ? files : [files];

    for (const file of fileArray) {
      await uploadOne(file);
    }

    setSelectedFiles(null);
    fetchDocuments();
    // clear completed upload rows after a short delay
    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status === 'uploading' || u.status === 'processing'));
    }, 2000);
  };

    const handleDelete = async (docId: string, docName: string) => {
    setDeletingIds((prev) => new Set(prev).add(docId));
    try {
      const res = await fetch(`${API_URL}/documents/${docId}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server responded ${res.status}`);
      }
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast({ body: `${docName} deleted` });
    } catch (err) {
      console.error('Delete failed:', err);
      toast({ body: `Failed to delete ${docName}` });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(docId);
        return next;
      });
    }
  };

  const isUploading = uploads.some((u) => u.status === 'uploading' || u.status === 'processing');


  return (
    <VStack gap={6}>
      <Heading level={2}>Documents</Heading>

      <Card padding={4}>
        <VStack gap={4}>
          <FileInput
            label="Upload Documents"
            mode="dropzone"
            accept=".pdf,.docx,.txt"
            value={selectedFiles}
            onChange={handleFileChange}
            isLoading={isUploading}
            isMultiple
            description="PDF, DOCX, or TXT files — upload multiple at once"
          />
         {uploads.map((u) => (
            <HStack key={u.id} gap={2} align="center" justify="between">
              <Text maxLines={1} style={{ flex: 1 }}>{u.file.name}</Text>
              {u.status === 'error' ? (
                <HStack gap={1} align="center">
                  <AlertCircle size={16} style={{ color: 'var(--color-danger, red)' }} />
                  <Text type="supporting" size="sm">{u.error}</Text>
                </HStack>
              ) : u.status === 'done' ? (
                <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
              ) : u.status === 'processing' ? (
                <HStack gap={1} align="center">
                  <LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  <Text type="supporting" size="sm">Processing...</Text>
                </HStack>
              ) : (
                <Text type="supporting" size="sm">{u.progress}%</Text>
              )}
            </HStack>
          ))}
        </VStack>
      </Card>

      {isLoading && (
        <div style={{ textAlign: 'center' }}>
          <Text color="secondary">Loading documents...</Text>
        </div>
      )}
      {loadError && (
        <div style={{ textAlign: 'center' }}>
          <Text color="secondary">{loadError}</Text>
        </div>
      )}

      {!isLoading && !loadError && documents.length === 0 && (
        <div style={{ textAlign: 'center' }}>
          <Text color="secondary">
            No documents yet — upload your first document to start searching with AI
          </Text>
        </div>
      )}

      {!isLoading && documents.length > 0 && (
        <Grid columns={{ minWidth: 280 }} gap={4}>
          {documents.map((doc) => (
            <Card key={doc.id} padding={4}>
              <VStack gap={3}>
                <HStack gap={3} align="start">
                  <div style={{ opacity: 0.6, flexShrink: 0 }}>
                    <FileText size={24} />
                  </div>
                  <VStack gap={0.5} style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="medium" maxLines={1}>{doc.name}</Text>
                    <Text type="supporting" size="sm">{doc.chunkCount} chunks</Text>
                    <Text type="supporting" size="sm">{doc.uploadDate}</Text>
                  </VStack>
                </HStack>
                <HStack gap={2} align="center" justify="between">
                  <Badge variant="success" label="indexed" />
                  <HStack gap={1}>
                    <IconButton label="View" variant="ghost" size="sm" icon={<Eye size={14} />} />
                    <IconButton
                      label="Delete"
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 size={14} />}
                      disabled={deletingIds.has(doc.id)}
                      onClick={() => handleDelete(doc.id, doc.name)}
                    />
                  </HStack>
                </HStack>
              </VStack>
            </Card>
          ))}
        </Grid>
      )}
    </VStack>
  );
}
