'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AddTimelineEventInput, LocalDocumentMetadata, LocalTimelineEvent } from '@caseai/local-vault';
import { useVaultSession } from '../../../components/vault-provider';
import { withUploadNetworkGuard } from '../../../components/dev-upload-guard';

type TabKey = 'documents' | 'timeline' | 'notes';

export default function CaseWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { vault } = useVaultSession();
  const [tab, setTab] = useState<TabKey>('documents');
  const [documents, setDocuments] = useState<LocalDocumentMetadata[]>([]);
  const [timeline, setTimeline] = useState<LocalTimelineEvent[]>([]);
  const [noteInput, setNoteInput] = useState('');

  const refresh = useMemo(
    () => async () => {
      if (!vault) {
        return;
      }
      const [nextDocuments, nextTimeline] = await Promise.all([vault.listDocuments(id), vault.listTimeline(id)]);
      setDocuments(nextDocuments);
      setTimeline(nextTimeline);
    },
    [id, vault]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!vault) {
    return <p>Please authenticate in /auth.</p>;
  }

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const file = formData.get('file');
    const pages = Number(formData.get('pageCountEstimate') ?? '1');
    if (!(file instanceof File)) {
      return;
    }

    await withUploadNetworkGuard(async () => {
      await vault.addDocument(id, file, { pageCountEstimate: pages });
    });
    await refresh();
    event.currentTarget.reset();
  };

  const addTimeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const content = String(formData.get('content') ?? '');
    const input: AddTimelineEventInput = {
      caseId: id,
      type: 'MILESTONE',
      content,
      occurredAt: new Date().toISOString()
    };
    await vault.addTimelineEvent(id, input);
    await refresh();
    event.currentTarget.reset();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setTab('documents')} className="px-3 py-2 bg-slate-800">Documents</button>
        <button onClick={() => setTab('timeline')} className="px-3 py-2 bg-slate-800">Timeline</button>
        <button onClick={() => setTab('notes')} className="px-3 py-2 bg-slate-800">Notes</button>
      </div>

      {tab === 'documents' ? (
        <div className="space-y-3">
          <form className="space-y-2" onSubmit={onUpload}>
            <input type="file" name="file" required className="w-full p-2" />
            <input type="number" min={1} name="pageCountEstimate" placeholder="Page estimate" className="w-full p-2" required />
            <button type="submit" className="px-3 py-2 bg-indigo-600">Upload to local vault</button>
          </form>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="rounded border border-slate-700 p-3 flex items-center justify-between">
                <span>{doc.mimeType} • {doc.sizeBytes} bytes</span>
                <button
                  className="px-2 py-1 bg-slate-800"
                  onClick={async () => {
                    const blob = await vault.getDocumentFile(doc.id);
                    const url = URL.createObjectURL(blob);
                    window.open(url, '_blank');
                    setTimeout(() => URL.revokeObjectURL(url), 30000);
                  }}
                >
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === 'timeline' ? (
        <div className="space-y-3">
          <form onSubmit={addTimeline} className="space-y-2">
            <textarea name="content" className="w-full p-2" placeholder="Timeline event" required />
            <button type="submit" className="px-3 py-2 bg-indigo-600">Add Event</button>
          </form>
          <ul className="space-y-2">
            {timeline.map((event) => (
              <li key={event.id} className="rounded border border-slate-700 p-2">{event.content}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === 'notes' ? (
        <div className="space-y-2">
          <form
            className="space-y-2"
            onSubmit={async (event) => {
              event.preventDefault();
              if (!noteInput.trim()) {
                return;
              }
              await vault.addTimelineEvent(id, {
                caseId: id,
                type: 'NOTE',
                content: noteInput,
                occurredAt: new Date().toISOString()
              });
              setNoteInput('');
              await refresh();
            }}
          >
            <textarea
              className="w-full p-3 min-h-32"
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              placeholder="Local-only encrypted notes"
            />
            <button className="px-3 py-2 bg-indigo-600" type="submit">Save local note</button>
          </form>
          <ul className="space-y-2">
            {timeline
              .filter((event) => event.type === 'NOTE')
              .map((event) => (
                <li key={event.id} className="rounded border border-slate-700 p-2">
                  {event.content}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      <div className="flex gap-3">
        <button className="px-3 py-2 bg-slate-800" onClick={() => router.push(`/marketplace/publish?caseId=${id}`)}>
          Publish anonym listing
        </button>
      </div>
    </div>
  );
}
