'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Upload,
  Database,
  FileArchive,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Layers,
  FileText,
  Users,
  FolderTree,
  Tag as TagIcon,
  Image as ImageIcon,
  MessageSquare,
  Compass,
  Radio,
  Clock,
  ShieldAlert,
  Info,
  Check,
  X,
  HardDrive
} from 'lucide-react';
import { BackupMetadata } from '@/lib/backup-service';

export function ImportExportBackup() {
  // Export States
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState<string | null>(null);

  // Current Database Stats
  const [currentCounts, setCurrentCounts] = useState<Record<string, number> | null>(null);
  const [loadingCurrentStats, setLoadingCurrentStats] = useState(false);

  // Import States
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectedMetadata, setInspectedMetadata] = useState<BackupMetadata | null>(null);
  const [inspectedFileName, setInspectedFileName] = useState<string | null>(null);
  const [inspectedFileSize, setInspectedFileSize] = useState<number | null>(null);
  const [hasMediaInZip, setHasMediaInZip] = useState(false);
  const [importMode, setImportMode] = useState<'skip' | 'update' | 'create_new'>('skip');

  // Import Execution States
  const [isImporting, setIsImporting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCounts?: Record<string, number>;
    message?: string;
    error?: string;
  } | null>(null);

  const [generalError, setGeneralError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCurrentDbStats();
  }, []);

  const fetchCurrentDbStats = async () => {
    setLoadingCurrentStats(true);
    try {
      const [pRes, cRes, tRes, uRes, pgRes, mRes, comRes] = await Promise.all([
        fetch('/api/posts').then((r) => r.json()).catch(() => []),
        fetch('/api/categories').then((r) => r.json()).catch(() => []),
        fetch('/api/tags').then((r) => r.json()).catch(() => []),
        fetch('/api/users').then((r) => r.json()).catch(() => []),
        fetch('/api/pages').then((r) => r.json()).catch(() => []),
        fetch('/api/media').then((r) => r.json()).catch(() => []),
        fetch('/api/comments').then((r) => r.json()).catch(() => []),
      ]);

      setCurrentCounts({
        posts: Array.isArray(pRes) ? pRes.length : pRes?.posts?.length || 0,
        categories: Array.isArray(cRes) ? cRes.length : 0,
        tags: Array.isArray(tRes) ? tRes.length : 0,
        users: Array.isArray(uRes) ? uRes.length : 0,
        pages: Array.isArray(pgRes) ? pgRes.length : 0,
        media: Array.isArray(mRes) ? mRes.length : 0,
        comments: Array.isArray(comRes) ? comRes.length : comRes?.comments?.length || 0,
      });
    } catch {
      // Non-blocking
    } finally {
      setLoadingCurrentStats(false);
    }
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    setGeneralError(null);
    setExportSuccessMessage(null);

    try {
      const res = await fetch('/api/admin/backup/export');

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Export failed' }));
        throw new Error(errJson.error || `Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = 'sereia-backup.zip';

      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      // Trigger browser download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setExportSuccessMessage(`Backup "${filename}" (${(blob.size / 1024).toFixed(1)} KB) successfully downloaded.`);
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to export backup.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setGeneralError(null);
    setImportResult(null);
    setInspectedMetadata(null);
    setIsInspecting(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/backup/inspect', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.valid) {
        throw new Error(data.error || 'Invalid or corrupted backup archive.');
      }

      setInspectedMetadata(data.metadata);
      setInspectedFileName(data.fileName);
      setInspectedFileSize(data.fileSize);
      setHasMediaInZip(Boolean(data.hasMediaFiles));
    } catch (err: any) {
      setGeneralError(err.message || 'Failed to inspect backup file.');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsInspecting(false);
    }
  };

  const handleTriggerImport = () => {
    if (!selectedFile || !inspectedMetadata) {
      setGeneralError('Please select a valid Sereia backup ZIP file first.');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteImport = async () => {
    if (!selectedFile) return;

    setShowConfirmModal(false);
    setIsImporting(true);
    setGeneralError(null);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('mode', importMode);

      const res = await fetch('/api/admin/backup/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Database restoration failed.');
      }

      setImportResult({
        success: true,
        importedCounts: data.importedCounts,
        message: data.message || 'Database restored successfully.',
      });

      // Refresh current counts
      fetchCurrentDbStats();
    } catch (err: any) {
      setImportResult({
        success: false,
        error: err.message || 'Import failed. Database transaction rolled back.',
      });
      setGeneralError(err.message || 'Restoration failed.');
    } finally {
      setIsImporting(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-white">Database Backup & Disaster Recovery</h3>
            <p className="text-xs text-stone-400 mt-1 leading-relaxed">
              Export and restore the complete Sereia CMS database into a portable, versioned ZIP archive.
              Preserves relational taxonomy, author credits, hierarchical menus, tags, and SEO metadata with transaction safety.
            </p>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {generalError && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-200 text-xs flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{generalError}</span>
          </div>
          <button onClick={() => setGeneralError(null)} className="text-rose-400 hover:text-rose-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {exportSuccessMessage && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button onClick={() => setExportSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Column Grid: Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ============================================================ */}
        {/* 1. EXPORT BACKUP PANEL */}
        {/* ============================================================ */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-amber-400" />
                <h4 className="font-semibold text-white text-sm">Export Backup</h4>
              </div>
              <span className="text-[11px] font-mono uppercase bg-stone-950 px-2.5 py-1 rounded text-stone-400 border border-stone-800">
                Single ZIP Package
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Downloads a complete archive containing <code className="text-amber-300 font-mono bg-stone-950 px-1.5 py-0.5 rounded">database.json</code> with all records, taxonomy trees, user profiles, SEO schemas, navigation structures, and local media.
            </p>

            {/* Current Database Summary Chips */}
            <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>Current Database Snapshot:</span>
                <button
                  onClick={fetchCurrentDbStats}
                  className="hover:text-amber-400 transition"
                  title="Refresh counts"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingCurrentStats ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Posts</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.posts ?? '—'}</div>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Categories</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.categories ?? '—'}</div>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Tags</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.tags ?? '—'}</div>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Users</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.users ?? '—'}</div>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Pages</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.pages ?? '—'}</div>
                </div>
                <div className="bg-stone-900/80 p-2.5 rounded border border-stone-800/80">
                  <div className="text-[10px] text-stone-400 uppercase font-mono">Media</div>
                  <div className="text-base font-bold text-stone-100 mt-0.5">{currentCounts?.media ?? '—'}</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-stone-400 flex items-start gap-2 bg-stone-950/40 p-3 rounded border border-stone-800/50">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                Foreign keys and relational mappings are stored with stable slug identifiers, enabling seamless restoration across environments.
              </span>
            </div>
          </div>

          <button
            id="admin-export-backup-btn"
            type="button"
            onClick={handleExportBackup}
            disabled={isExporting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-stone-950 font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Exporting Database Backup...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Export Backup (ZIP)</span>
              </>
            )}
          </button>
        </div>

        {/* ============================================================ */}
        {/* 2. IMPORT BACKUP PANEL */}
        {/* ============================================================ */}
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-rose-400" />
                <h4 className="font-semibold text-white text-sm">Import Backup</h4>
              </div>
              <span className="text-[11px] font-mono uppercase bg-stone-950 px-2.5 py-1 rounded text-stone-400 border border-stone-800">
                Transaction Safe
              </span>
            </div>

            {/* File Upload Trigger */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 block">Choose Backup File (.zip):</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-700 hover:border-amber-400/80 bg-stone-950/60 rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileArchive className="w-8 h-8 text-stone-500 group-hover:text-amber-400 transition" />
                <div className="text-xs font-medium text-stone-300">
                  {selectedFile ? (
                    <span className="text-amber-300 font-mono">{selectedFile.name}</span>
                  ) : (
                    <span>Click to browse or drop Sereia backup ZIP here</span>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">
                  Supports valid Sereia ZIP archives with <code className="text-stone-300">database.json</code>
                </p>
              </div>
            </div>

            {/* Inspecting Spinner */}
            {isInspecting && (
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-lg text-center text-xs text-amber-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Inspecting & validating backup structure...
              </div>
            )}

            {/* Inspected Backup Preview Card */}
            {inspectedMetadata && (
              <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid Sereia Backup Package</span>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400">
                    v{inspectedMetadata.backupVersion}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 text-[10px] block">Exported Date:</span>
                    <span className="text-stone-200 font-mono text-[11px]">
                      {new Date(inspectedMetadata.exportedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] block">File Size:</span>
                    <span className="text-stone-200 font-mono text-[11px]">
                      {inspectedFileSize ? formatBytes(inspectedFileSize) : '—'}
                    </span>
                  </div>
                </div>

                {/* Counts breakdown */}
                <div className="pt-2 border-t border-stone-800/60">
                  <div className="text-[10px] font-mono text-stone-400 mb-2 uppercase">Records Included:</div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Posts:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.posts}</strong>
                    </div>
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Categories:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.categories}</strong>
                    </div>
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Tags:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.tags}</strong>
                    </div>
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Users:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.users}</strong>
                    </div>
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Pages:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.pages}</strong>
                    </div>
                    <div className="bg-stone-900 px-2 py-1.5 rounded text-stone-300">
                      <span className="text-stone-400">Comments:</span> <strong className="text-white font-mono">{inspectedMetadata.counts.comments}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Import Mode Radio Group */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-stone-300 block">Import Mode:</label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'skip' ? 'bg-amber-400/5 border-amber-400/50 text-stone-100' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="skip"
                    checked={importMode === 'skip'}
                    onChange={() => setImportMode('skip')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-stone-200">Skip Existing (Recommended Default)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Inserts new records and maps existing items by unique slug/email without overwriting current data.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'update' ? 'bg-amber-400/5 border-amber-400/50 text-stone-100' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="update"
                    checked={importMode === 'update'}
                    onChange={() => setImportMode('update')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-stone-200">Update Existing</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Updates matching articles, categories, settings, and media while inserting missing items.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'create_new' ? 'bg-amber-400/5 border-amber-400/50 text-stone-100' : 'bg-stone-950/40 border-stone-800 text-stone-400 hover:border-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="create_new"
                    checked={importMode === 'create_new'}
                    onChange={() => setImportMode('create_new')}
                    className="mt-0.5 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-stone-200">Create New (Duplicate as Copies)</div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Generates unique IDs and clone copies for all imported entities while preserving all internal relationships.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <button
            id="admin-import-backup-btn"
            type="button"
            onClick={handleTriggerImport}
            disabled={!selectedFile || !inspectedMetadata || isImporting || isInspecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isImporting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Restoring Database...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Import Backup</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <div className={`p-6 rounded-xl border ${
          importResult.success
            ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
            : 'bg-rose-950/40 border-rose-800 text-rose-200'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            )}
            <h4 className="font-bold text-sm text-white">
              {importResult.success ? 'Database Restoration Succeeded' : 'Database Restoration Failed'}
            </h4>
          </div>
          <p className="text-xs">{importResult.message || importResult.error}</p>

          {importResult.importedCounts && (
            <div className="mt-4 pt-4 border-t border-emerald-900/60">
              <div className="text-[11px] font-mono text-stone-400 mb-2 uppercase">Summary of Changes:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(importResult.importedCounts).map(([key, count]) => (
                  <div key={key} className="bg-stone-900/80 px-2.5 py-1.5 rounded border border-stone-800">
                    <span className="text-stone-400 capitalize">{key}: </span>
                    <strong className="text-emerald-400 font-mono">+{count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-base">Confirm Database Restoration</h3>
                <p className="text-xs text-stone-400 mt-1">
                  You are about to restore the Sereia CMS database from an external backup package.
                </p>
              </div>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-lg border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-400">File:</span>
                <span className="text-stone-200 font-mono truncate max-w-[200px]">{selectedFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Selected Mode:</span>
                <span className="text-amber-400 font-semibold uppercase font-mono">{importMode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-400">Safety Guard:</span>
                <span className="text-emerald-400 font-mono">PostgreSQL Atomic Transaction</span>
              </div>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              If any error occurs during import, all modifications will be automatically rolled back without partial data corruption.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold rounded-lg transition"
              >
                Cancel
              </button>
              <button
                id="admin-confirm-restore-btn"
                type="button"
                onClick={handleExecuteImport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition"
              >
                Confirm & Restore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
