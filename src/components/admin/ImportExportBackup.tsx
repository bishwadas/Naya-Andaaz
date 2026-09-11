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
      let filename = 'naya-andaaz-backup.zip';

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
      setGeneralError('Please select a valid Naya Andaaz backup ZIP file first.');
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
      <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-pink-50 border border-pink-200 text-[#EC008C] rounded-xl shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-serif font-bold text-[#171717]">Database Backup & Disaster Recovery</h3>
            <p className="text-xs text-[#6B625C] mt-1 leading-relaxed">
              Export and restore the complete Naya Andaaz CMS database into a portable, versioned ZIP archive.
              Preserves relational taxonomy, author credits, hierarchical menus, tags, and SEO metadata with transaction safety.
            </p>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {generalError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{generalError}</span>
          </div>
          <button onClick={() => setGeneralError(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {exportSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{exportSuccessMessage}</span>
          </div>
          <button onClick={() => setExportSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Two Column Grid: Export & Import */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ============================================================ */}
        {/* 1. EXPORT BACKUP PANEL */}
        {/* ============================================================ */}
        <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4">
              <div className="flex items-center gap-2.5">
                <Download className="w-5 h-5 text-[#EC008C]" />
                <h4 className="font-semibold text-[#171717] text-sm">Export Backup</h4>
              </div>
              <span className="text-[11px] font-mono uppercase bg-[#F7F5F2] px-2.5 py-1 rounded text-[#6B625C] border border-[#E5E0DA]">
                Single ZIP Package
              </span>
            </div>

            <p className="text-xs text-[#6B625C] leading-relaxed">
              Downloads a complete archive containing <code className="text-[#EC008C] font-mono bg-[#F7F5F2] px-1.5 py-0.5 rounded border border-[#E5E0DA]">database.json</code> with all records, taxonomy trees, user profiles, SEO schemas, navigation structures, and local media.
            </p>

            {/* Current Database Summary Chips */}
            <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#6B625C] font-mono">
                <span>Current Database Snapshot:</span>
                <button
                  onClick={fetchCurrentDbStats}
                  className="hover:text-[#EC008C] transition"
                  title="Refresh counts"
                >
                  <RefreshCw className={`w-3 h-3 ${loadingCurrentStats ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Posts</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.posts ?? '—'}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Categories</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.categories ?? '—'}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Tags</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.tags ?? '—'}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Users</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.users ?? '—'}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Pages</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.pages ?? '—'}</div>
                </div>
                <div className="bg-white p-2.5 rounded border border-[#DDD6D0]">
                  <div className="text-[10px] text-[#6B625C] uppercase font-mono">Media</div>
                  <div className="text-base font-bold text-[#171717] mt-0.5">{currentCounts?.media ?? '—'}</div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-[#6B625C] flex items-start gap-2 bg-[#F3F0EC] p-3 rounded border border-[#E5E0DA]">
              <Info className="w-4 h-4 text-[#EC008C] shrink-0 mt-0.5" />
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#EC008C] hover:bg-pink-600 active:bg-pink-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition disabled:opacity-50 cursor-pointer"
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
        <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl p-6 flex flex-col justify-between space-y-6 shadow-xs">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-4">
              <div className="flex items-center gap-2.5">
                <Upload className="w-5 h-5 text-purple-600" />
                <h4 className="font-semibold text-[#171717] text-sm">Import Backup</h4>
              </div>
              <span className="text-[11px] font-mono uppercase bg-[#F7F5F2] px-2.5 py-1 rounded text-[#6B625C] border border-[#E5E0DA]">
                Transaction Safe
              </span>
            </div>

            {/* File Upload Trigger */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#171717] block">Choose Backup File (.zip):</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#DDD6D0] hover:border-[#EC008C] bg-[#F7F5F2] rounded-xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip,application/zip"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <FileArchive className="w-8 h-8 text-[#8A817A] group-hover:text-[#EC008C] transition" />
                <div className="text-xs font-medium text-[#171717]">
                  {selectedFile ? (
                    <span className="text-[#EC008C] font-mono">{selectedFile.name}</span>
                  ) : (
                    <span>Click to browse or drop Naya Andaaz backup ZIP here</span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B625C]">
                  Supports valid Naya Andaaz ZIP archives with <code className="text-[#171717]">database.json</code>
                </p>
              </div>
            </div>

            {/* Inspecting Spinner */}
            {isInspecting && (
              <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg text-center text-xs text-[#EC008C] flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Inspecting & validating backup structure...
              </div>
            )}

            {/* Inspected Backup Preview Card */}
            {inspectedMetadata && (
              <div className="bg-[#F7F5F2] border border-[#E5E0DA] rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E0DA] pb-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valid Naya Andaaz Backup Package</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#6B625C]">
                    v{inspectedMetadata.backupVersion}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#6B625C] text-[10px] block">Exported Date:</span>
                    <span className="text-[#171717] font-mono text-[11px]">
                      {new Date(inspectedMetadata.exportedAt).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#6B625C] text-[10px] block">File Size:</span>
                    <span className="text-[#171717] font-mono text-[11px]">
                      {inspectedFileSize ? formatBytes(inspectedFileSize) : '—'}
                    </span>
                  </div>
                </div>

                {/* Counts breakdown */}
                <div className="pt-2 border-t border-[#E5E0DA]">
                  <div className="text-[10px] font-mono text-[#6B625C] mb-2 uppercase">Records Included:</div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Posts:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.posts}</strong>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Categories:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.categories}</strong>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Tags:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.tags}</strong>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Users:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.users}</strong>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Pages:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.pages}</strong>
                    </div>
                    <div className="bg-white px-2 py-1.5 rounded border border-[#DDD6D0] text-[#6B625C]">
                      <span>Comments:</span> <strong className="text-[#171717] font-mono">{inspectedMetadata.counts.comments}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Import Mode Radio Group */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-[#171717] block">Import Mode:</label>
              <div className="space-y-2">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'skip' ? 'bg-pink-50/60 border-[#EC008C] text-[#171717]' : 'bg-[#F7F5F2] border-[#E5E0DA] text-[#6B625C] hover:border-[#DDD6D0]'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="skip"
                    checked={importMode === 'skip'}
                    onChange={() => setImportMode('skip')}
                    className="mt-0.5 accent-[#EC008C]"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-[#171717]">Skip Existing (Recommended Default)</div>
                    <div className="text-[11px] text-[#6B625C] mt-0.5">
                      Inserts new records and maps existing items by unique slug/email without overwriting current data.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'update' ? 'bg-pink-50/60 border-[#EC008C] text-[#171717]' : 'bg-[#F7F5F2] border-[#E5E0DA] text-[#6B625C] hover:border-[#DDD6D0]'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="update"
                    checked={importMode === 'update'}
                    onChange={() => setImportMode('update')}
                    className="mt-0.5 accent-[#EC008C]"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-[#171717]">Update Existing</div>
                    <div className="text-[11px] text-[#6B625C] mt-0.5">
                      Updates matching articles, categories, settings, and media while inserting missing items.
                    </div>
                  </div>
                </label>

                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  importMode === 'create_new' ? 'bg-pink-50/60 border-[#EC008C] text-[#171717]' : 'bg-[#F7F5F2] border-[#E5E0DA] text-[#6B625C] hover:border-[#DDD6D0]'
                }`}>
                  <input
                    type="radio"
                    name="importMode"
                    value="create_new"
                    checked={importMode === 'create_new'}
                    onChange={() => setImportMode('create_new')}
                    className="mt-0.5 accent-[#EC008C]"
                  />
                  <div className="text-xs">
                    <div className="font-semibold text-[#171717]">Create New (Duplicate as Copies)</div>
                    <div className="text-[11px] text-[#6B625C] mt-0.5">
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
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-3 mb-3">
            {importResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            )}
            <h4 className="font-bold text-sm text-[#171717]">
              {importResult.success ? 'Database Restoration Succeeded' : 'Database Restoration Failed'}
            </h4>
          </div>
          <p className="text-xs">{importResult.message || importResult.error}</p>

          {importResult.importedCounts && (
            <div className="mt-4 pt-4 border-t border-[#E5E0DA]">
              <div className="text-[11px] font-mono text-[#6B625C] mb-2 uppercase">Summary of Changes:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {Object.entries(importResult.importedCounts).map(([key, count]) => (
                  <div key={key} className="bg-white px-2.5 py-1.5 rounded border border-[#DDD6D0]">
                    <span className="text-[#6B625C] capitalize">{key}: </span>
                    <strong className="text-emerald-700 font-mono">+{count}</strong>
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
        <div className="fixed inset-0 z-50 bg-[#171717]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFDFC] border border-[#E5E0DA] rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-pink-50 border border-pink-200 text-[#EC008C] rounded-lg shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-[#171717] text-base">Confirm Database Restoration</h3>
                <p className="text-xs text-[#6B625C] mt-1">
                  You are about to restore the Naya Andaaz CMS database from an external backup package.
                </p>
              </div>
            </div>

            <div className="bg-[#F7F5F2] p-3.5 rounded-lg border border-[#E5E0DA] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B625C]">File:</span>
                <span className="text-[#171717] font-mono truncate max-w-[200px]">{selectedFile?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B625C]">Selected Mode:</span>
                <span className="text-[#EC008C] font-semibold uppercase font-mono">{importMode.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B625C]">Safety Guard:</span>
                <span className="text-emerald-700 font-mono">PostgreSQL Atomic Transaction</span>
              </div>
            </div>

            <p className="text-xs text-[#6B625C] leading-relaxed">
              If any error occurs during import, all modifications will be automatically rolled back without partial data corruption.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-[#F3F0EC] hover:bg-[#E5E0DA] text-[#171717] text-xs font-semibold rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="admin-confirm-restore-btn"
                type="button"
                onClick={handleExecuteImport}
                className="px-4 py-2 bg-[#EC008C] hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
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
