"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getUserSavedSearches,
  createSavedSearch,
  updateSavedSearch,
  deleteSavedSearch,
} from "@/lib/services/user";
import { SavedSearch, ListingsFilter } from "@/types/listing";

interface SavedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, filters: ListingsFilter) => void;
  initialData?: SavedSearch;
}

function SavedSearchModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: SavedSearchModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [filters, setFilters] = useState<ListingsFilter>(
    initialData?.filters || {},
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setFilters(initialData.filters);
    } else {
      setName("");
      setFilters({});
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      await onSave(name.trim(), filters);
      onClose();
    } catch (err) {
      console.error("Failed to save search:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? "Edit Saved Search" : "Create Saved Search"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="My Search"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              value={filters.city || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  city: e.target.value || undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="Any city"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Min Price</label>
            <input
              type="number"
              value={filters.priceMin || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="No minimum"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input
              type="number"
              value={filters.priceMax || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  priceMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="No maximum"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as any) || undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Any Status</option>
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
              <option value="sold">Sold</option>
              <option value="rented">Rented</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Property Type
            </label>
            <select
              value={filters.propertyType || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  propertyType: (e.target.value as any) || undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Any Type</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
              <option value="duplex">Duplex</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Min Bedrooms
            </label>
            <input
              type="number"
              value={filters.bedroomsMin || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  bedroomsMin: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
              className="w-full border rounded px-3 py-2"
              placeholder="No minimum"
              min="0"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SavedSearchesList() {
  const { user } = useAuth();
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSearch, setEditingSearch] = useState<SavedSearch | undefined>();

  useEffect(() => {
    if (!user) return;

    const loadSearches = async () => {
      try {
        setLoading(true);
        const userSearches = await getUserSavedSearches(user.uid);
        setSearches(userSearches);
      } catch (err) {
        setError("Failed to load saved searches");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadSearches();
  }, [user]);

  const handleCreateSearch = async (name: string, filters: ListingsFilter) => {
    if (!user) return;

    const id = await createSavedSearch(user.uid, name, filters);
    const newSearch: SavedSearch = {
      id,
      user_id: user.uid,
      name,
      filters,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSearches((prev) => [newSearch, ...prev]);
  };

  const handleUpdateSearch = async (name: string, filters: ListingsFilter) => {
    if (!editingSearch) return;

    await updateSavedSearch(editingSearch.id, name, filters);
    setSearches((prev) =>
      prev.map((s) =>
        s.id === editingSearch.id
          ? { ...s, name, filters, updatedAt: new Date().toISOString() }
          : s,
      ),
    );
  };

  const handleDeleteSearch = async (id: string) => {
    await deleteSavedSearch(id);
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplySearch = (search: SavedSearch) => {
    const query = new URLSearchParams();
    if (search.filters.status) query.set("status", search.filters.status);
    if (search.filters.city) query.set("city", search.filters.city);
    if (search.filters.propertyType)
      query.set("propertyType", search.filters.propertyType);
    if (
      search.filters.priceMin !== null &&
      search.filters.priceMin !== undefined
    )
      query.set("priceMin", search.filters.priceMin.toString());
    if (
      search.filters.priceMax !== null &&
      search.filters.priceMax !== undefined
    )
      query.set("priceMax", search.filters.priceMax.toString());
    if (
      search.filters.bedroomsMin !== null &&
      search.filters.bedroomsMin !== undefined
    )
      query.set("bedroomsMin", search.filters.bedroomsMin.toString());
    router.push(`/search?${query.toString()}`);
  };

  const openCreateModal = () => {
    setEditingSearch(undefined);
    setModalOpen(true);
  };

  const openEditModal = (search: SavedSearch) => {
    setEditingSearch(search);
    setModalOpen(true);
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your saved searches.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p>Loading saved searches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Saved Searches</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Search
        </button>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-8">
          <p>You haven&apos;t saved any searches yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <div
              key={search.id}
              className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => handleApplySearch(search)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{search.name}</h3>
                  <div className="text-sm text-gray-600 mt-1">
                    {search.filters.status && (
                      <span>
                        Status: {search.filters.status.replace("_", " ")}
                      </span>
                    )}
                    {search.filters.propertyType && (
                      <span> | Type: {search.filters.propertyType}</span>
                    )}
                    {search.filters.city && (
                      <span> | City: {search.filters.city}</span>
                    )}
                    {search.filters.priceMin && (
                      <span> | Min Price: ${search.filters.priceMin}</span>
                    )}
                    {search.filters.priceMax && (
                      <span> | Max Price: ${search.filters.priceMax}</span>
                    )}
                    {search.filters.bedroomsMin && (
                      <span> | Min Bedrooms: {search.filters.bedroomsMin}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(search);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSearch(search.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <SavedSearchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={editingSearch ? handleUpdateSearch : handleCreateSearch}
        initialData={editingSearch}
      />
    </div>
  );
}
