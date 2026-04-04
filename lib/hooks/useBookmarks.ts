"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * useBookmarks — 글 북마크 + 폴더 관리
 *
 * localStorage 기반 (추후 서버 연동)
 * 사용: const { bookmarks, toggle, folders, addFolder, moveToFolder } = useBookmarks();
 */
const BM_KEY = "naisser_bookmarks";

interface BookmarkItem {
  postId: string;
  folderId: string; // "default" | custom folder id
  savedAt: string;
}

interface BookmarkFolder {
  id: string;
  name: string;
  createdAt: string;
}

interface BookmarkStore {
  items: BookmarkItem[];
  folders: BookmarkFolder[];
}

export function useBookmarks() {
  const [store, setStore] = useState<BookmarkStore>({
    items: [],
    folders: [{ id: "default", name: "저장한 글", createdAt: "" }],
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(BM_KEY);
      if (saved) setStore(JSON.parse(saved));
    } catch { /* */ }
  }, []);

  const save = useCallback((s: BookmarkStore) => {
    setStore(s);
    try { localStorage.setItem(BM_KEY, JSON.stringify(s)); } catch { /* */ }
  }, []);

  const isBookmarked = useCallback((postId: string) => {
    return store.items.some((i) => i.postId === postId);
  }, [store]);

  const toggle = useCallback((postId: string) => {
    const exists = store.items.find((i) => i.postId === postId);
    if (exists) {
      save({ ...store, items: store.items.filter((i) => i.postId !== postId) });
      return false;
    } else {
      save({
        ...store,
        items: [...store.items, { postId, folderId: "default", savedAt: new Date().toISOString() }],
      });
      return true;
    }
  }, [store, save]);

  const addFolder = useCallback((name: string) => {
    const folder: BookmarkFolder = {
      id: `f-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
    };
    save({ ...store, folders: [...store.folders, folder] });
    return folder;
  }, [store, save]);

  const moveToFolder = useCallback((postId: string, folderId: string) => {
    save({
      ...store,
      items: store.items.map((i) => i.postId === postId ? { ...i, folderId } : i),
    });
  }, [store, save]);

  const getFolderItems = useCallback((folderId: string) => {
    return store.items.filter((i) => i.folderId === folderId);
  }, [store]);

  return {
    bookmarks: store.items,
    folders: store.folders,
    isBookmarked,
    toggle,
    addFolder,
    moveToFolder,
    getFolderItems,
  };
}
